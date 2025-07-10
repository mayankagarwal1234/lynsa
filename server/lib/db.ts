import mongoose from "mongoose";


export const connectDB = async () => {
  try {
    
    await mongoose.connect(`${process.env.MONGODB_URI}/lynsachat`)
      .then(() => {
        console.log("MongoDB connected");
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
      });

  
  } catch (error: any) {
    console.error(`Error connecting to database: ${error.message}`);
  }
};
