import Company from "../models/Company.models.js";
import bcrypt  from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import Job from "../models/job.models.js";
import JobApplication from "../models/jobApplication.models.js";
import transporter from "../config/nodemailer.js";
import crypto from "crypto";

// Register new company
const registerCompany = async (req , res) => {
    try {
        const { name , email ,password } = req.body

        const imageFile = req.file;

        if(!name || !email || !password || !imageFile){
            return res
            .status(400)
            .json({
                message: "Please fill in all fields.",
                success: false
            })
        }
        
        const userExist = await Company.findOne({email})

        if(userExist){
            return res
            .status(400)
            .json({
                message: " Company already registrered",
                success: false
            })
        }
        // hash user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        const company = await Company.create({
            name,
            email,
            password: hashedPassword,
            image: imageUpload.secure_url
        })
        res.status(201).json({
            message: "Company created successfully",
            success: true,
            company: {
                _id : company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id)
        })

    } catch (error) {
        console.log(error)
    }
}

// Company Login
const loginCompany = async (req , res) => {
    const {email , password} = req.body

    try {
        const company = await Company.findOne({email})

        if (!company) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password", // Return same error for security reasons
            });
        }


        if(await bcrypt.compare(password,company.password)){

            res.json({
                success: true,
                message: "Company logged in successfully",
                company: {
                    _id : company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id)
            })
        }else{
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }
    } catch (error) {
        res.json({
            success: false,
            mesage: error.message
        })
        
    }
}

// Get all company Data
const getCompanyData = async (req , res) => {
    try {
        const company = req.company
        res.json({
            success: true,
            message: "Company data fetched successfully",
            company
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }

}

// Post a new job
const postJob = async (req , res) => {
    const { title , description , location ,salary, level ,category} = req.body
    if (!req.company || !req.company._id) {
        return res.status(400).json({ success: false, message: "Company authentication failed" });
    }
    const companyId  = req.company?._id

    try {
        const newJob = new Job({
            title ,
            description ,
            location ,
            salary ,
            companyId,
            date: Date.now(),
            level,
            category
        })

        await newJob.save()
        res.json({
            success: true ,
            message: "Job posted successfully",
            newJob
        })
    } catch (error) {
        res.json({
            success: false ,
            message: error.message
        })
    }
}

// Get Company Job Applicants
const getJobApplicants = async (req , res) => {
    try {
        const companyId = req.company._id

        // find job application for the user and populate related data
        const applications = await JobApplication.find({companyId})
        .populate('userId','name image resume')
        .populate('jobId','title location salary level category')
        .exec()
        res.json({
            success: true ,
            message: "Job applicants retrieved successfully",
            applications
            })
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

// Get Company Posted Jobs
const getCompanyPostedJobs = async (req , res) => {
    try {
        const companyId = req.company._id
        const jobs = await Job.find({companyId}).populate("companyId", "name image");
        // Adding no. of applicants info in data
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({jobId: job._id})
            return {
                ...job.toObject(),
                applicants: applicants.length
            }
        }))

        res.json({
            success: true ,
            jobsData
        })
    } catch (error) {
        res.json({
            success: false ,
            message: error.message
        })
    }
}

// Change Job Application Status
const changeJobApplicationStatus = async (req , res) => {
    try {
        
        const { id , status } = req.body
    
        // Find Job Application and update status
        const updatedApplication = await JobApplication.findOneAndUpdate(
            { _id: id }, 
            { status }, 
            { new: true } // Ensures it returns the updated document
        );
        res.json({
            success: true,
            message: "Job application status updated successfully",
            application: updatedApplication // Return updated data
        });
        
    } catch (error) {
        res.json({
            success: false ,
            message: error.message
        })
    }
}

// Change Job Visibility
const changeJobVisibility = async (req , res) => {
    try {
        const {id} = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if(companyId.toString() === job.companyId.toString()){
            job.visible = !job.visible
        }
        await job.save()
        res.json({
            success: true ,
            message: 'Job Visibility Changed',
            job
            })
    } catch (error) {
        
    }
}   

// 1️⃣ Forgot Password - Generate Token & Send Email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if company exists
        const company = await Company.findOne({ email });
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        // Generate a secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token before storing in database
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        company.resetPasswordToken = hashedToken;
        company.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

        await company.save();

        // Construct reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${company._id}/${resetToken}`;
        console.log("🔗 Reset Link:", resetLink); // ✅ Debugging

        // Send reset email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetLink}" target="_blank">${resetLink}</a>
                   <p>This link is valid for 10 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Password reset link sent to your email",resetLink});

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2️⃣ Reset Password - Verify Token & Update Password
const resetPassword = async (req, res) => {
    try {
        const { id, token } = req.params;
        const { newPassword } = req.body;

        // Hash token to match the stored hashed token
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find company by ID and verify token validity
        const company = await Company.findOne({
            _id: id,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },  // Ensure token is still valid
        });

        if (!company) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        company.password = await bcrypt.hash(newPassword, salt);

        // Clear reset token fields
        company.resetPasswordToken = undefined;
        company.resetPasswordExpires = undefined;

        await company.save();

        res.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// export all the controller functions
export { 
    registerCompany ,
    loginCompany ,
    getCompanyData ,
    postJob ,
    getJobApplicants,
    getCompanyPostedJobs , 
    changeJobApplicationStatus , 
    changeJobVisibility ,
    forgotPassword,
    resetPassword
}