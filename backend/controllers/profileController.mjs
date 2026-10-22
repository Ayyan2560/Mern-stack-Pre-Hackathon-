import bcrypt from 'bcryptjs';
import User from '../models/user.mjs';

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      {
        new: true,
        runValidators: true,
      }
    ).select(
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
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// GET PROFILE
export const getProfile = async (req, res) => {
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
      message: 'Profile fetched successfully',
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

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    
    
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Please send request body as JSON',
      });
    }
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (typeof currentPassword !== 'string' ||
        typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Passwords must be strings',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (error) {
    console.error('Change password error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};