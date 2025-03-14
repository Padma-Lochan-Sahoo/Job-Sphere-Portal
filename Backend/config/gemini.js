import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please check your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function run(prompt, chatHistory) {
    try {
        const chatSession = model.startChat({
            generationConfig,
            history: chatHistory, // Pass previous messages
        });

        const result = await chatSession.sendMessage(prompt);
        const botResponse = result.response.text();

        return { botResponse };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return { botResponse: "Sorry, an error occurred." };
    }
}

export default run;
