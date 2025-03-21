import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["super-admin", "admin", "sales-rep"], 
    default: "sales-rep" 
  },
  tags: { type: [String], default: [] }, // Array of unique strings (manually checked)
  resetToken: { type: String, default: null }, // Token for password reset
  resetTokenExpires: { type: Date, default: null }, // Expiry time for the token
});

const User = mongoose.model("User", userSchema);

export default User;
