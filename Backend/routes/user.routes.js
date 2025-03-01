import express from "express"
import { applyForJob, getUserData, getUserJobApplications, updateUserResume } from "../controller/user.controller.js"
import upload from "../config/multer.js"

const router = express.Router()

// Get user Data
router.get('/user',getUserData)

// Apply for a Job
router.post('/apply', applyForJob)

// Get Applied Job data
router.get('/applications', getUserJobApplications)

// Update user profile (resume)
router.post('/update-resume',upload.single('resume'),updateUserResume)


export default router