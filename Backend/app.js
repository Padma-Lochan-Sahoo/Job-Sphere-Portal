import "./config/instrument.js"
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as Sentry from "@sentry/node";
// import { clerkWebhooks } from "./controller/webhooks.controller.js";
// import { clerkMiddleware } from '@clerk/express'


// Initialize express
const app = express();
Sentry.setupExpressErrorHandler(app);

// Middlewares
app.use(cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true
    }
));
app.use(express.json());
// Middleware to parse raw body for Clerk webhooks
// app.use('/webhooks', express.json({
//     verify: (req, res, buf) => { req.rawBody = buf.toString(); }
// }));
// app.use(clerkMiddleware());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// import Routes
app.get('/', (req,res) => {
    res.send("Hello World")
})
app.get("/debug-sentry",(req,res) => {
    throw new Error("Test error");
})
// app.post('/webhooks',clerkWebhooks)
import companyRoutes from "./routes//company.routes.js"
import jobRoutes from './routes/job.routes.js'
import userRoutes from './routes/user.routes.js'
// routes declaration
app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users',userRoutes)



export { app }
