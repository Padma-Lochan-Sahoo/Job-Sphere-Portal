import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Initialize express
const app = express();

// Middlewares
// app.use(cors({
//         origin: process.env.FRONTEND_URL || "http://localhost:5173",
//         credentials: true
//     }
// ));
const allowedOrigins = [
    'http://localhost:5173', // For development
    'https://job-sphere-portal-frontend.vercel.app', // For production
  ];
  
  app.use(cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error('Not allowed by CORS')); // Block the request
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
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
