import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Store user ID for tracking chat history
    history: [
        {
            role: { type: String, enum: ["user", "model"], required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
