import  mongoose   from "mongoose";


const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not configured; starting without MongoDB.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    return false;
  }
}



export default connectDB;
