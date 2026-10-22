
import Post from '../models/posts.mjs';
import cloudinary from '../config/cloudinary.mjs';
import streamifier from 'streamifier';
import mongoose from 'mongoose';
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
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      Post.find()
        .populate('user', 'name email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Post.countDocuments(),
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
