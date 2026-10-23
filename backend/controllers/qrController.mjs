import QRCode from 'qrcode';
import mongoose from 'mongoose';
import Post from '../models/posts.mjs';

export const generatePostQR = async (req, res) => {
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

    const frontendURL = process.env.FRONTEND_URL;

    const backendURL = process.env.BACKEND_URL || 'http://localhost:5000';

    const postURL = `${backendURL.replace(/\/$/, '')}/api/posts/${post._id}`;
 
    // if (!frontendURL) {
    //   return res.status(500).json({
    //     success: false,
    //     message: 'Frontend URL is not configured',
    //   });
    // }

    // const postURL = `${frontendURL.replace(/\/$/, '')}/posts/${post._id}`;

    const qrCode = await QRCode.toDataURL(postURL);

    return res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      postURL,
      qrCode,
    });
  } catch (error) {
    console.error('QR generation error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
    });
  }
};