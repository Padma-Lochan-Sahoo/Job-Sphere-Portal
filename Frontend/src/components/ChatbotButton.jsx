import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { MessageCircle } from "lucide-react";
import ChatbotWindow from "./ChatbotWindow";
import { motion, AnimatePresence } from "framer-motion";

const ChatbotButton = () => {
    const { userToken } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);

    if (!userToken) return null; // Show only if user is logged in

    return (
        <>
            {/* Floating Chatbot Button with Interactive Animations */}
            <motion.button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
                whileHover={{ scale: 1.1 }} // Slight scale on hover
                whileTap={{ scale: 0.9 }} // Click shrink effect
                animate={{ y: [0, -5, 0] }} // Floating bounce effect
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            >
                <MessageCircle size={24} />
            </motion.button>

            {/* Animated Chatbot Window with Smooth Fade & Slide */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }} // Start lower
                        animate={{ opacity: 1, y: 0 }} // Slide up into view
                        exit={{ opacity: 0, y: 50 }} // Slide down on exit
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed bottom-16 right-6"
                    >
                        <ChatbotWindow onClose={() => setIsOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatbotButton;
