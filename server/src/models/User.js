import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    name: { type: String, required: false, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: true },
    emailVerificationTokenHash: { type: String, required: false },
    emailVerificationExpiresAt: { type: Date, required: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
