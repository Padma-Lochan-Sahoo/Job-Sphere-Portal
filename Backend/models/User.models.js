import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String, required: true 
    },
    resume:{
        type: String,
    },
    image:{
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["job-seeker", "recruiter"],
        default: "job-seeker" // Default role set to "job-seeker"
    },
    resetPasswordToken: {type :String}, 
    resetPasswordExpires: {type: Date}
    
},{timestamps: true})

const User = mongoose.model("User",userSchema)

export default User