
import mongoose from 'mongoose';
import User from '../models/user.mjs';

// Search users by name
export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      20,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    // Escape regex special characters
    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const filter = {
      name: { $regex: safeQuery, $options: 'i' },
    };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name profilePicture createdAt')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    console.error('Search users error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to search users',
    });
  }
};

// Get public profile by user ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await User.findById(userId)
      .select('name profilePicture createdAt')
      .lean();

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
    console.error('Get user by ID error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
    });
  }
};
