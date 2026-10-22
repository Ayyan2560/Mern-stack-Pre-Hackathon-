import  express  from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.mjs";
import authRoutes from "./routes/authroutes.mjs";
import profileRoutes from './routes/profileroutes.mjs';
const app = express()

app.use(express.json());

connectDB()
const PORT = process.env.PORT || 5000;
app.get("/", (req, res)=>{
    res.send("Hello, World!");
})
 app.use("/api/auth",authRoutes);
 
app.use("/api/profile", profileRoutes);

app.listen (5000 , ()=>{
    console.log("Server is running on port 5000");
})