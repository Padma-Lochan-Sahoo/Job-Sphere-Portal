import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { MessageCircle } from "lucide-react";
import ChatbotWindow from "./ChatbotWindow";

const ChatbotButton = () => {
    const { userToken } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);

    if (!userToken) return null; // Show only if user is logged in

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
            >
                <MessageCircle size={24} />
            </button>
            {isOpen && <ChatbotWindow onClose={() => setIsOpen(false)} />}
        </>
    );
};

export default ChatbotButton;
