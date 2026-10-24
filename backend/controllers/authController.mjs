import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.mjs';
import nodemailer from 'nodemailer';
import { randomBytes, createHash , randomInt} from 'node:crypto';
import sendEmail from "../utils/sendEmail.mjs";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a 6-digit OTP
    const otp = String(randomInt(100000, 1000000));

    // Store only the OTP hash
    const hashedOTP = createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationOTP: hashedOTP,
      emailVerificationOTPExpires: new Date(
        Date.now() + 10 * 60 * 1000
      ),
    });

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: user.email,
        subject: "Your Email Verification OTP",
        text: `Your verification OTP is ${otp}. It expires in 10 minutes.`,
      });
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);

      console.error("Verification email failed:", emailError.message);

      return res.status(500).json({
        success: false,
        message: "Could not send verification OTP. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created. Please check your email for the 6-digit OTP.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error("Signup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    // 1. Request se email aur password lena
    const { email, password } = req.body;

    // 2. Required fields validate karna
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 3. JWT secret configured hai ya nahi
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from environment variables');
    }

    // 4. Email se user find karna
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // 5. User nahi mila
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 6. Password ko stored hash se compare karna
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 7. JWT token generate karna
    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 8. Successful response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



const resetMessage =
  'If an account with that email exists, a reset link has been sent.';

// 1. FORGOT PASSWORD

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Account existence reveal nahi karna
    const message =
      "If an account exists, a password reset OTP has been sent.";

    if (!user) {
      return res.status(200).json({
        success: true,
        message,
      });
    }

    const otp = String(randomInt(100000, 1000000));

    user.resetPasswordOTP = createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetPasswordOTPExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: user.email,
        subject: "Password Reset OTP",
        text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
      });
    } catch (emailError) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save();

      console.error("Password reset email failed:", emailError.message);

      return res.status(500).json({
        success: false,
        message: "Could not send reset OTP. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// 2. RESET PASSWORD

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email, 6-digit OTP and password of at least 8 characters are required",
      });
    }

    const hashedOTP = createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordOTP: hashedOTP,
      resetPasswordOTPExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset OTP",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    // OTP ko dobara use hone se rokna
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    // Purane link-based reset tokens bhi invalidate kar do
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login again.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 3. LOGOUT
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logout successful. Please clear the auth token.',
  });
};
// verify email

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and 6-digit OTP are required",
      });
    }

    const hashedOTP = createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      emailVerificationOTP: hashedOTP,
      emailVerificationOTPExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;

    // Clear old link-based verification fields too
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -resetPasswordToken -resetPasswordExpires ' +
      '-emailVerificationToken -emailVerificationExpires'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


