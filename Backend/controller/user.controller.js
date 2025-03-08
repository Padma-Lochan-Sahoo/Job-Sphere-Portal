import Job from "../models/job.models.js";
import JobApplication from "../models/jobApplication.models.js";
import User from "../models/User.models.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from 'fs';
import path from 'path';

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
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            image: imageUpload.secure_url,
            resume: "",
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
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