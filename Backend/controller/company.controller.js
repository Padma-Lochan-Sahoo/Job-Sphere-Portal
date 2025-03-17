import Company from "../models/Company.models.js";
import bcrypt  from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import Job from "../models/job.models.js";
import JobApplication from "../models/jobApplication.models.js";
import transporter from "../config/nodemailer.js";
import crypto from "crypto";
import User from "../models/User.models.js";

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
            image: imageUpload.secure_url,
            role: "recruiter" // Auto-assign recruiter role
        })
        res.status(201).json({
            message: "Company created successfully",
            success: true,
            company: {
                _id : company._id,
                name: company.name,
                email: company.email,
                role: company.role, // Now always "recruiter"
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


// Function to send job email notifications
const sendJobEmailToUsers = async (job) => {
    try {
        const jobSeekers = await User.find(); // Fetch all users

        if (jobSeekers.length === 0) return; // No users to notify

        const emailList = jobSeekers.map(user => user.email);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailList, // Send to all job seekers
            subject: `🚀 Exciting Job Opportunity: ${job.title} - Apply Now!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #2c3e50;">🌟 New Job Alert: ${job.title} 🌟</h2>
                        
                        <p style="font-size: 16px; color: #333;">
                            A new job opportunity has just been posted that might be a great fit for you. Don't miss out!
                        </p>

                        <div style="border-left: 4px solid #3498db; padding-left: 10px; margin: 10px 0;">
                            <p><strong>📍 Location:</strong> ${job.location}</p>
                            <p><strong>💰 Salary:</strong> ${job.salary}</p>
                            <p><strong>⚡ Experience Level:</strong> ${job.level}</p>
                            <p><strong>🏢 Category:</strong> ${job.category}</p>
                        </div>

                        <p style="font-size: 16px; color: #333;">
                            🔥 <strong>Hurry! Applications are open for a limited time.</strong> Click below to apply now:
                        </p>

                        <div style="text-align: center; margin-top: 20px;">
                            <a href="${process.env.FRONTEND_URL}/jobs/${job._id}" 
                               style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; 
                               font-size: 16px; border-radius: 5px; display: inline-block;">
                                👉 Apply Now
                            </a>
                        </div>

                        <p style="margin-top: 20px; font-size: 14px; color: #555;">
                            Best wishes,<br>
                            <strong>Job Sphere Team</strong>
                        </p>
                        
                        <hr style="border: 0; height: 1px; background: #ddd; margin-top: 20px;">
                        <p style="font-size: 12px; color: #888; text-align: center;">
                            This is an automated message. Please do not reply.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("🚀 Job email notifications sent successfully!");
    } catch (error) {
        console.error("❌ Error sending job notification emails:", error);
    }
};


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

        // Send email to all users
        await sendJobEmailToUsers(newJob);

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


// Function to send status update email
const sendStatusEmail = async (email, job, status) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Update on Your Job Application for ${job.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #2c3e50;">📢 Job Application Status Update</h2>
                    <p>Dear Applicant,</p>
                    <p>We hope you're doing well! We wanted to update you on the status of your job application.</p>
                    
                    <p><strong>Job Title:</strong> ${job.title}</p>
                    <p><strong>Application Status:</strong> <span style="color: ${status === 'Accepted' ? 'green' : status === 'Rejected' ? 'red' : '#f39c12'}; font-weight: bold;">${status}</span></p>
                    
                    <p>We appreciate your interest in this opportunity. Please log in to your account to view more details.</p>

                    <p>Best Regards,</p>
                    <p><strong>Job Sphere Team</strong></p>
                    <hr style="border: 0; height: 1px; background: #ddd;">
                    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply to this email.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Status update email sent to ${email}`);
    } catch (error) {
        console.error("Error sending job application status email:", error);
    }
};



// Change Job Application Status
const changeJobApplicationStatus = async (req , res) => {
    try {
        
        const { id , status } = req.body
    
        // Find Job Application and update status
        const updatedApplication = await JobApplication.findOneAndUpdate(
            { _id: id }, 
            { status }, 
            { new: true } // Ensures it returns the updated document
        ).populate('userId', 'email')
        .populate('jobId', 'title');
        res.json({
            success: true,
            message: "Job application status updated successfully",
            application: updatedApplication // Return updated data
        });

        // Send status update email
        await sendStatusEmail(updatedApplication.userId.email, updatedApplication.jobId, status);
        
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
        const resetLink = `${process.env.FRONTEND_URL}/company/reset-password/${company._id}/${resetToken}`;

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

        res.json({ success: true, message: "Password reset link sent to your email", resetLink });

    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ success: false, message: "Failed to process your request" });
    }
};

// 2️⃣ Reset Password - Verify Token & Update Password
const resetPassword = async (req, res) => {
    try {
        const { id, token } = req.params; // Get id and token from URL params
        const { newPassword } = req.body;

        // Validate newPassword
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        // Hash the token to match the stored hashed token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the company by ID and verify token validity
        const company = await Company.findOne({
            _id: id, // Use the id to find the specific company
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Ensure token is still valid
        });

        if (!company) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        company.password = await bcrypt.hash(newPassword, salt);

        // Clear the reset token fields
        company.resetPasswordToken = undefined;
        company.resetPasswordExpires = undefined;

        // Save the updated company document
        await company.save();

        // Return success response
        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ success: false, message: "Failed to reset password" });
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