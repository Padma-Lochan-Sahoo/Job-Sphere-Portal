
import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';



dotenv.config({});

const PORT = process.env.PORT || 5000

// connect to the database
await connectDB()
.then(() => {
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    })
    
})
.catch((error) => {
    console.log(`MOGO DB connection error: ${error}`)
})

// connect to Clodinary
await connectCloudinary()
.catch((error) => {
    console.log(`Cloudinary connection error: ${error}`)
})