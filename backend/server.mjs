import 'dotenv/config';
import  express  from "express";
import connectDB from "./config/db.mjs";
import authRoutes from "./routes/authroutes.mjs";
import profileRoutes from './routes/profileroutes.mjs';
import cloudinary from './config/cloudinary.mjs';
import postRoutes from './routes/postRoutes.mjs';
import multer from 'multer';
import userRoutes from './routes/userRoutes.mjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import notificationRoutes from './routes/notificationRoutes.mjs';
const app = express()

app.use(express.json());

  app.use("/api/notifications", notificationRoutes);
// Security headers 
app.use(helmet());

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

app.use('/api', apiLimiter);




const PORT = process.env.PORT || 5000;

app.get("/", (req, res)=>{
    res.send("Hello, World!");
})
 app.use("/api/auth",authRoutes);
 
app.use("/api/profile", profileRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/users", userRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'File size must be 5 MB or less',
      LIMIT_FILE_COUNT: 'Maximum 5 images allowed',
      LIMIT_UNEXPECTED_FILE: 'Invalid file field. Use "images".',
    };

    return res.status(400).json({
      success: false,
      message: messages[err.code] || err.message,
    });
  }

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  console.error('Server Error:', err.message);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});


const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    const cloudinaryConfigured = [
      process.env.CLOUDINARY_CLOUD_NAME,
      process.env.CLOUDINARY_API_KEY,
      process.env.CLOUDINARY_API_SECRET,
    ].every(Boolean);

    if (!cloudinaryConfigured) {
      console.warn('Cloudinary is not configured; image uploads are disabled.');
      return;
    }

    cloudinary.api.ping()
      .then(() => console.log('Cloudinary connected successfully'))
      .catch((error) => {
        console.error('Cloudinary connection failed:', error.message);
      });
  });
};

startServer();
