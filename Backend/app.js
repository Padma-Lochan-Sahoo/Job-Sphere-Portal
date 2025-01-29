import "./config/instrument.js"
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from "./controller/webhooks.controller.js";

// Initialize express
const app = express();
Sentry.setupExpressErrorHandler(app);

// Middlewares
app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// import Routes
app.get('/', (req,res) => {
    res.send("dvkoko")
})
app.get("/debug-sentry",(req,res) => {
    throw new Error("Test error");
})
app.post('/webhooks',clerkWebhooks)

// routes declaration



export { app }
