import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ChatbotWindow = ({ onClose }) => {
    const { backendUrl, userToken, userData } = useContext(AppContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (!userData || !userData._id) {
            console.error("User ID is missing. Cannot send message.");
            return;
        }

        const userId = userData._id;
        const newMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/chatbot`,
                { userId, prompt: input },
                { headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}` 
                } }
            );

            setMessages((prev) => [...prev, { text: data.response, sender: "bot" }]);
        } catch (error) {
            console.error("Chatbot error:", error.response?.data || error.message);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-16 right-6 bg-white shadow-xl w-[400px] h-[500px] rounded-xl flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-3 flex justify-between">
                <span>Chatbot</span>
                <button onClick={onClose}><X size={20} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`p-2 rounded-lg break-words w-fit max-w-[75%]
                            ${msg.sender === "user" ? "bg-blue-500 text-white ml-auto text-right" : "bg-gray-200 text-black mr-auto text-left"}`
                        }
                    >
                        {msg.sender === "bot" ? (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        ) : (
                            msg.text
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="p-2 bg-gray-200 text-black rounded-lg self-start max-w-[50%]">
                        Typing...
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t flex">
                <input 
                    className="flex-1 border rounded-l p-2" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me something..."
                />
                <button 
                    className="bg-blue-600 text-white p-2 rounded-r"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatbotWindow;
