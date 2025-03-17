import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },role: {
        type: String,
        enum: ["recruiter"],
        default: "recruiter" // Default role set to "recruiter"
    },
    resetPasswordToken: {type :String}, 
    resetPasswordExpires: {type: Date}
})

const Company = mongoose.model('Company',companySchema)

export default Company 