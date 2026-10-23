import mongoose from 'mongoose';
import User from '../models/user.mjs';
import Post from '../models/posts.mjs';

// Save or remove a bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(id).select('_id');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const alreadySaved = user.bookmarks.some(
      (postId) => postId.toString() === id
    );

    if (alreadySaved) {
      user.bookmarks.pull(id);
    } else {
      user.bookmarks.addToSet(id);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: alreadySaved ? 'Bookmark removed' : 'Post bookmarked',
      bookmarked: !alreadySaved,
    });
  } catch (error) {
    console.error('Bookmark error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to update bookmark',
    });
  }
};

// Get current user's saved posts
export const getMyBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'bookmarks',
        populate: {
          path: 'user',
          select: 'name profilePicture',
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      count: user.bookmarks.length,
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    console.error('Get bookmarks error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks',
    });
  }
};