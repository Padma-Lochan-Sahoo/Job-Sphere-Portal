import Job from "../models/job.models.js"
import JobApplication from "../models/jobApplication.models.js"
import User from "../models/User.models.js"
import { v2 as cloudinary} from 'cloudinary'


// Get user data
export const getUserData = async (req,res) => {
    try {
        const userId = req.auth?.userId
        const user = await User.findById(userId)
        console.log("User ID:", req.auth.userId);

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

    const userId = req.auth.userId

    try {
        const isAlreadyApplied = await JobApplication.findOne({ userId, jobId }) // use find instead of find
        if (isAlreadyApplied.length > 0) {
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
            date: Date.now() 
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
        const userId = req.auth.userId

        const applications = await JobApplication.find({ userId })
        .populate('companyId','name email image')
        .populate('jobId','title description location categort level salary')
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
export const updateUserResume = async (req,res) => {
    try {
        const userId = req.auth.userId
        const resumeFile  = req.resumeFile

        const userData = await User.findById(userId)

        if(resumeFile){
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
        }
        await userData.save()
        return res.json({
            success: true,
            message: "Resume updated successfully"
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }

}