import Company from "../models/Company.models.js";
import bcrypt  from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import Job from "../models/job.models.js";
import JobApplication from "../models/jobApplication.models.js";

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
    
    const companyId = req.company._id

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
    
}

// Get Company Posted Jobs
const getCompanyPostedJobs = async (req , res) => {
    try {
        const companyId = req.company._id
        const jobs = await Job.find({companyId})

        // TODO: Adding no. of applicants info in data
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

// export all the controller functions
export { 
    registerCompany ,
    loginCompany ,
    getCompanyData ,
    postJob ,
    getJobApplicants,
    getCompanyPostedJobs , 
    changeJobApplicationStatus , 
    changeJobVisibility 
}