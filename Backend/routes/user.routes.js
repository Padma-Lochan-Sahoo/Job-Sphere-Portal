import express from "express"
import { applyForJob, getUserData, getUserJobApplications, loginUser, registerUser, updateUserResume,forgotPasswordUser,resetPasswordUser  } from "../controller/user.controller.js"
import upload from "../config/multer.js"
import { protectUser } from '../middleware/auth.middleware.js'

const router = express.Router()

// User Registration
router.post("/register",upload.single("image"),registerUser);

// User Login
router.post("/login",loginUser);

// Get user Data
router.get('/user',protectUser,getUserData)

// Apply for a Job
router.post('/apply',protectUser, applyForJob)

// Get Applied Job data
router.get('/applications',protectUser, getUserJobApplications)

// Update user profile (resume)
router.post('/update-resume',upload.single('resume'),protectUser,updateUserResume)

// Forgot Password - Request OTP
router.post('/forgot-password', forgotPasswordUser );

// Reset Password - Verify OTP and Update Password
router.post('/reset-password/:id/:token', resetPasswordUser);
export default router