import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// 👉 Function to Send Email
const sendEmail = async (email, subject, text) => {
    try {
        console.log("📨 Sending email to:", email);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL, // Your Gmail from .env
                pass: process.env.SMTP_PASS, // App password from .env
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: email,
            subject,
            text,
        });

        console.log("✅ Email Sent Successfully!");
    } catch (error) {
        console.error("❌ Email Sending Failed:", error);
    }
};

// 👉 Forgot Password (Send Reset Link)
export const forgotPassword = async (req, res) => {
    const { email } = req.body; // Get user's email

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate Reset Token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

        // Save token & expiry in the database
        user.resetToken = resetToken;
        user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        // Send Reset Email
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        await sendEmail(user.email, "Password Reset", `Click here to reset your password: ${resetLink}`);

        res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 👉 Reset Password (Set New Password)
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || user.resetToken !== token) return res.status(400).json({ message: "Invalid or expired token" });

        // Hash new password & save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("❌ Reset Password Error:", error);
        res.status(400).json({ message: "Invalid or expired token" });
    }
};
