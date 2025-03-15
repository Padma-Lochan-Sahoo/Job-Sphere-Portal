import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Initialize express
const app = express();

// Middlewares
app.use(cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    }
));
app.get('/',(req,res)=>{
    res.send('Server is running')
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get('/',(req,res)=>{
    res.send('Server is running')
})

import companyRoutes from "./routes//company.routes.js"
import jobRoutes from './routes/job.routes.js'
import userRoutes from './routes/user.routes.js'
import chatbotRoutes from './routes/chatbot.routes.js'

// routes declaration
app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users',userRoutes)
app.use('/api/chatbot',chatbotRoutes)

export { app }
