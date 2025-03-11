import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();  // Load environment variables

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Your Gmail
        pass: process.env.EMAIL_PASS,  // App password from Google
    }
});

export default transporter;
