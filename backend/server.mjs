import 'dotenv/config';
import  express  from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.mjs";
import authRoutes from "./routes/authroutes.mjs";
import profileRoutes from './routes/profileroutes.mjs';
import cloudinary from './config/cloudinary.mjs';
import postRoutes from './routes/postRoutes.mjs';


const app = express()

app.use(express.json());

connectDB()
const PORT = process.env.PORT || 5000;
app.get("/", (req, res)=>{
    res.send("Hello, World!");
})
 app.use("/api/auth",authRoutes);
 
app.use("/api/profile", profileRoutes);

app.use("/api/posts", postRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  cloudinary.api.ping()
    .then(() => console.log('Cloudinary connected successfully'))
    .catch((error) => {
      console.error('Cloudinary connection failed:', error.message);
    });
});