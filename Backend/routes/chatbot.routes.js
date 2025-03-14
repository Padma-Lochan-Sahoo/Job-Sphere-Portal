import express from 'express'
import { jobAssistant,clearHistory } from '../controller/chatbot.controller.js';

const router = express.Router()

// Route to talk to the chatbot
router.post("/",jobAssistant)
// Route to clear the chatbot history
router.post("/clear-history",clearHistory)

export default router;