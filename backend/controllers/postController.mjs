import Post from '../models/posts.mjs';
import cloudinary from '../config/cloudinary.mjs';
import streamifier from 'streamifier';
import mongoose from 'mongoose';
import Notification from '../models/notification.mjs';

// CREATE POST
export const createPost = async (req, res) => {
  const uploadedImages = [];

  try {
    const { title, content } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    // Maximum 5 images per post
    if (req.files?.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images are allowed',
      });
    }

    // Upload images to Cloudinary
    for (const file of req.files || []) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'mern-post-images',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier
          .createReadStream(file.buffer)
          .pipe(stream);
      });

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    // Save post in MongoDB
    const post = await Post.create({
      user: req.user.id,
      title: title.trim(),
      content: content.trim(),
      images: uploadedImages,
    });

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    // Clean up uploaded images if post creation fails
    await Promise.allSettled(
      uploadedImages.map((image) =>
        cloudinary.uploader.destroy(image.publicId)
      )
    );

    console.error('Create post error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to create post',
    });
  }
};



export const getAllPosts = async (req, res) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    // Search, filter and sorting parameters
    const { search, userId, sort = 'newest' } = req.query;

    // Build MongoDB filter
    const filter = {};

    if (search?.trim()) {
      const safeSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { content: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    // Filter posts by author
    if (userId) {
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
      }

      filter.user = userId;
    }

    // Select sorting order
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      updated: { updatedAt: -1 },
    };

    if (!sortOptions[sort]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort option. Use newest, oldest, or updated.',
      });
    }

    const [posts, totalPosts] = await Promise.all([
      Post.find(filter)
        .populate('user', 'name email profilePicture')
        .sort(sortOptions[sort])
        .skip(skip)
        .limit(limit)
        .lean(),

      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        limit,
        hasNextPage: page * limit < totalPosts,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get posts error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
    });
  }
};

// GET SINGLE POST
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(id)
      .populate('user', 'name email profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Get single post error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
    });
  }
};



export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    if (
      (title !== undefined &&
        (typeof title !== 'string' || !title.trim())) ||
      (content !== undefined &&
        (typeof content !== 'string' || !content.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Title and content cannot be empty',
      });
    }

    if (title === undefined && content === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Provide a title or content to update',
      });
    }

    if (title && title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 200 characters',
      });
    }

    if (
  content !== undefined &&content.trim().length > 100000
) {
  return res.status(400).json({
    success: false,
    message: 'Content cannot exceed 100000 characters',
  });
}

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this post',
      });
    }

    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) post.content = content.trim();

    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    console.error('Update post error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to update post',
    });
  }
};


export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Only the post owner can delete it
    if (post.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this post',
      });
    }

    // Delete the post from MongoDB first
    await post.deleteOne();

    // Then clean up its Cloudinary images
    const cleanupResults = await Promise.allSettled(
      (post.images || []).map((image) =>
        cloudinary.uploader.destroy(image.publicId)
      )
    );

    const cleanupFailed = cleanupResults.some(
      (result) =>
        result.status === 'rejected' ||
        !['ok', 'not found'].includes(result.value?.result)
    );

    return res.status(200).json({
      success: true,
      message: cleanupFailed
        ? 'Post deleted, but some images may need cleanup'
        : 'Post and images deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete post',
    });
  }
};




export const togglePostLike = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userId = req.user.id;

    // Check whether this user already liked the post
    const alreadyLiked = post.likes.some(
      (likedUserId) => likedUserId.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.addToSet(userId);
    }

    await post.save();

 if (
      !alreadyLiked &&
      post.user.toString() !== req.user.id.toString()
    ) {
      await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        post: post._id,
        type: 'like',
        message: 'liked your post',
      });
    }

    return res.status(200).json({
      success: true,
      message: alreadyLiked
        ? 'Post unliked successfully'
        : 'Post liked successfully',
      liked: !alreadyLiked,
      totalLikes: post.likes.length,
    });

    // Notify post owner when someone likes their post
  } catch (error) {
    console.error('Toggle post like error:', error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update like',
    });
  }
};



//Add comment to a post
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 1000 characters',
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.comments.push({
      user: req.user.id,
      text: text.trim(),
    });

    await post.save();

    // Notify post owner when someone comments
  if (post.user.toString() !== req.user.id.toString()) {
  await Notification.create({
    recipient: post.user,
    sender: req.user.id,
    post: post._id,
    type: 'comment',
    message: 'commented on your post',
  });
}

    const comment = post.comments[post.comments.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    console.error('Add comment error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to add comment',
    });
  }
};


// Get comments for a post(comment dekhna)
export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(id)
      .select('comments')
      .populate('comments.user', 'name profilePicture')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    return res.status(200).json({
      success: true,
      totalComments: post.comments.length,
      comments: post.comments,
    });
  } catch (error) {
    console.error('Get comments error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
    });
  }
};




export const deleteComment = async (req, res) => {


  try {
    const { postId, commentId } = req.params;

    if (
      !mongoose.isValidObjectId(postId) ||
      !mongoose.isValidObjectId(commentId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post or comment ID',
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });

    }
    console.log('Post ID:', req.params.postId);
console.log('Comment ID:', req.params.commentId);

console.log(
'Post ID valid:',
mongoose.isValidObjectId(req.params.postId)
);

console.log(
'Comment ID valid:',
mongoose.isValidObjectId(req.params.commentId)
);

    // Only the comment author or post owner can delete it
    const isCommentAuthor =
      comment.user.toString() === req.user.id.toString();

    const isPostOwner =
      post.user.toString() === req.user.id.toString();

    if (!isCommentAuthor && !isPostOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this comment',
      });
    }

    comment.deleteOne();
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
    });
  }
};


export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID',
      });
    }

    const post = await Post.findById(id).select('_id title');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
     // const frontendURL =
  //process.env.FRONTEND_URL || 'http://localhost:5173';

// TODO: Frontend banne ke baad uncomment karna
// const shareURL = `${frontendURL}/posts/${post._id}`;
  

// Temporary: backend API share link
const backendURL =
process.env.BACKEND_URL || 'http://localhost:5000';
 const shareURL =
      `${backendURL.replace(/\/$/, '')}/api/posts/${post._id}`;

    return res.status(200).json({
      success: true,
      message: 'Share link generated successfully',
      shareURL,
    });
  } catch (error) {
    console.error('Share post error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate share link',
    });
  }
};