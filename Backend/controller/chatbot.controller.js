import Chat from "../models/chatbot.model.js";
import run from "../config/gemini.js";

export const jobAssistant = async (req, res) => {
    try {
        
        const { userId, prompt } = req.body; // Get userId from request
        if (!userId || !prompt) {
            return res.status(400).json({ error: "userId and prompt are required" });
        }

        console.log("Prompt:", prompt);

        // Fetch previous chat history from MongoDB
        let userChat = await Chat.findOne({ userId });

        if (!userChat) {
            userChat = new Chat({ userId, history: [] }); // Create new chat history if not exists
        }

        // Append new user message
        userChat.history.push({ role: "user", text: prompt });

        // Call Gemini API with full chat history
        const geminiHistory = userChat.history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const { botResponse } = await run(prompt, geminiHistory);

        // Save bot response in MongoDB
        userChat.history.push({ role: "model", text: botResponse });
        await userChat.save();

        return res.status(200).json({ response: botResponse, history: userChat.history });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const clearHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Delete all chat history related to the user
        await Chat.deleteMany({ userId });

        return res.status(200).json({ message: "Chat history cleared" });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
