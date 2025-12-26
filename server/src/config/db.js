import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/safeglow";

  mongoose.set("bufferCommands", false);

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    return conn;
  } catch (err) {
    console.error("MongoDB connection failed:", err?.message || err);
    return null;
  }
};

export default connectDB;
