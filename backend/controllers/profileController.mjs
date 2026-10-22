import bcrypt from 'bcryptjs';
import User from '../models/user.mjs';
import cloudinary from '../config/cloudinary.mjs';
import streamifier from 'streamifier';


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


export const uploadProfilePicture = async (req, res) => {
  let newPublicId = '';

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Upload new image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'mern-profile-pictures',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier
        .createReadStream(req.file.buffer)
        .pipe(stream);
    });

    newPublicId = uploadResult.public_id;

    // Save new image details in MongoDB
    const oldPublicId = user.profilePicture?.publicId;

    user.profilePicture = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };

    await user.save();

    // Delete old image only after the new image is saved
    if (oldPublicId && oldPublicId !== newPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (deleteError) {
        console.error(
          'Old image deletion failed:',
          deleteError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture,
    });
  } catch (error) {

    // Remove newly uploaded image if saving fails
    if (newPublicId) {
      try {
        await cloudinary.uploader.destroy(newPublicId);
      } catch (deleteError) {
        console.error(
          'New image cleanup failed:',
          deleteError.message
        );
      }
    }

    console.error('Profile picture upload error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
    });
  }
};



export const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const publicId = user.profilePicture?.publicId;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to remove',
      });
    }

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(502).json({
        success: false,
        message: 'Could not remove profile picture from Cloudinary',
      });
    }

    // Clear image details in MongoDB
    user.profilePicture = {
      url: '',
      publicId: '',
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully',
    });
  } catch (error) {
    console.error('Remove profile picture error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to remove profile picture',
    });
  }
};



