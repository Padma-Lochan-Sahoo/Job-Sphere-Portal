import express from 'express'

const router = express.Router()
import { changeJobApplicationStatus, changeJobVisibility, getCompanyData, getCompanyPostedJobs, getJobApplicants, loginCompany, postJob, registerCompany, forgotPassword, resetPassword } from "../controller/company.controller.js"
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/auth.middleware.js'


// Register a company
router.post('/register',upload.single('image'),registerCompany)

// Company Login
router.post('/login',loginCompany)

// Get company data
router.get('/company',protectCompany,getCompanyData)

// post a Job
router.post('/post-job',protectCompany,postJob)

// Get Applicants Data of company
router.get('/applicants',protectCompany,getJobApplicants)

// Get Company Job List
router.get('/job-list',protectCompany,getCompanyPostedJobs)

// Change Applications Status
router.post('/change-status',protectCompany,changeJobApplicationStatus)

// Change Application visibility
router.post('/change-visibility',protectCompany,changeJobVisibility)

// Forgot Password - Request OTP
router.post('/forgot-password', forgotPassword);

// Reset Password - Verify OTP and Update Password
router.post('/reset-password/:id/:token', resetPassword);

export default router