import Job from "../models/job.models.js";
import JobApplication from "../models/jobApplication.models.js";
import User from "../models/User.models.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from 'fs';
import path from 'path';
import transporter from "../config/nodemailer.js";
import crypto from "crypto";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// User Signup with Image Upload
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const imageFile = req.file;

        

        // Validate required fields
        if (!name || !email || !password || !imageFile) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { folder: "profile_images" });

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            image: imageUpload.secure_url,
            resume: "",
            role: "job-seeker", // Auto-assign role
        });

        fs.unlinkSync(imageFile.path);


        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role, // Now always "job-seeker"
                image: newUser.image,
            },
            token: generateToken(newUser._id),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// User Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                message: "Invalid email or password" 
            });
        }
        const isPasswordValid = await bcrypt.compare(password , user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }
        res.json({
            success: true,
            message: "User logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                
            },
            token: generateToken(user._id), // send JWT token
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


// Get user data
export const getUserData = async (req,res) => {
    try {
        // const userId = req.user_id
        // const user = await User.findById(userId)
        // console.log("User ID:", req.user_id);

        const user = req.user;
        if(!user){
            return res
            .status(404)
            .json({
                success: false,
                message: "User not found"
            })
        }
        res.json({
            success: true,
            user
        })

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}


// Function to send email to recruiter
const sendApplicationEmailToRecruiter = async (recruiterEmail, recruiterName, applicantName, applicantEmail, jobTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recruiterEmail,
            subject: `New Job Application for ${jobTitle}`,
            html: `
                <h2>New Job Application Received</h2>
                <p>Dear ${recruiterName},</p>
                <p>A new job application has been submitted for the position of <strong>${jobTitle}</strong>.</p>
                <p><strong>Applicant Name:</strong> ${applicantName}</p>
                <p><strong>Applicant Email:</strong> ${applicantEmail}</p>
                <br>
                <p>Log in to your dashboard to view the complete application details.</p>
                <br>
                <p>Best Regards,<br>Your Job Portal Team</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to recruiter: ${recruiterEmail}`);
    } catch (error) {
        console.error("Error sending job application email:", error);
    }
};

// Apply for a job
export const applyForJob = async (req,res) => {
    const { jobId } = req.body

    const userId = req.user?._id

    try {
        const isAlreadyApplied = await JobApplication.findOne({ userId, jobId }) // use find instead of find
        if (isAlreadyApplied) {
            return res
            .status(400)
            .json({
                success: false,
                message: "You have already applied for this job"
            })
        }
        const jobData = await Job.findById(jobId)
        if(!jobData){
            return res
            .status(404)
            .json({
                success: false,
                message: "Job not found"
            })
        }
        const jobApplication = await JobApplication.create({ 
            companyId: jobData.companyId,
            userId,
            jobId,
            date: new Date(), 
        })
        res.json({
            success: true,
            message: "Job Applied Successfully",
            jobApplication
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Get User applied applications
export const getUserJobApplications = async (req,res) => {
    try {
        console.log("Extracted userId from request:", req.user._id);
        const userId = req.user?._id
        const applications = await JobApplication.find({ userId })
        .populate('companyId','name email image')
        .populate('jobId','title description location category level salary')
        .exec()

        if(!applications){
            return res
            .status(404)
            .json({
                success: false,
                message: "No Job applications found"
            })
        }
        return res.json({
            success: true,
            applications
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

// update user profile(resume)
export const updateUserResume = async (req, res) => {
    try {
        console.log("User from request:", req.user);

      const userId = req.user._id;
      if (!req.file) {
        console.error("Multer failed to process file.");
        return res.status(400).json({ success: false, message: "File not received by the server." });
    }
    
      const resumeFile = req.file;
      console.log("Resume file details:", req.file);

  
      if (!resumeFile) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
  
      const userData = await User.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  

      // Upload to cloudinary
    const resumeUpload = await cloudinary.uploader.upload(resumeFile.path,{
        resource_type: "auto",
        format: "pdf",
        folder: "resumes"
    });
      console.log("Cloudinary Upload Response:", resumeUpload);

      userData.resume = resumeUpload.secure_url;
      await userData.save();
    
      // Delete file from frontend/public/uploads after successful upload
      fs.unlinkSync(resumeFile.path);
      return res.json({ success: true, message: "Resume updated successfully", resumeUrl: resumeUpload.secure_url });
    } catch (error) {
        console.error("Error updating resume:", error); // Log full error details
      res.status(500).json({ success: false, message: error.message });
    }
  };

export const forgotPasswordUser = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate a secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token before storing in database
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

        await user.save();

        // Construct reset link
        const resetLink = `${process.env.FRONTEND_URL}/users/reset-password/${user._id}/${resetToken}`;

        // Send reset email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetLink}" target="_blank">${resetLink}</a>
                   <p>This link is valid for 10 minutes.</p>`,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            return res.status(500).json({ success: false, message: "Failed to send reset email" });
        }

        res.json({ success: true, message: "Password reset link sent to your email", resetLink });

    } catch (error) {
        console.error("Error in forgotPasswordUser:", error);
        res.status(500).json({ success: false, message: "Failed to process your request" });
    }
};

export const resetPasswordUser = async (req, res) => {
    try {
        const { id, token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        // Hash token to match the stored hashed token
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user by ID and verify token validity
        const user = await User.findOne({
            _id: id,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },  // Ensure token is still valid
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error("Error in resetPasswordUser:", error);
        res.status(500).json({ success: false, message: "Failed to reset password" });
    }
};


// const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
// if (!passwordRegex.test(newPassword)) {
//     return res.status(400).json({ success: false, message: "Password must contain at least one uppercase letter, one number, and one special character" });
// }


export const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, password } = req.body;
        const imageFile = req.file;

        console.log("Received Data:", { userId, name, email, password, imageFile });

        // Find user
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update name and email if provided
        if (name) user.name = name;
        if (email) user.email = email;

        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Handle Profile Picture Update
        if (imageFile) {
            // Upload new image to Cloudinary
            console.log("Updating Image...");
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{ folder: "profile_images" });
            console.log("Cloudinary Upload Response:", imageUpload);
            // Delete the old image from Cloudinary if it exists
            if (user.image) {
                const oldImagePublicId = user.image.split('/').slice(-2).join('/').split('.')[0];  
                await cloudinary.uploader.destroy(oldImagePublicId);
            }

            // Save new image URL
            user.image = imageUpload.secure_url;
            fs.unlinkSync(imageFile.path);
        }

        // Save updated user
        await user.save();
        console.log("Updated User:", user);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};