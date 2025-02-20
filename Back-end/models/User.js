import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ New Fields
    activity: {
      hoursSpent: { type: Number, default: 0 },
      weeklyData: [{ day: String, hours: Number }], // Example: [{ day: "Mon", hours: 3 }]
    },
    earnings: {
      revenue: { type: Number, default: 0 },
      profit: { type: Number, default: 0 },
      growthRate: { type: Number, default: 0 }, // Percentage growth
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
