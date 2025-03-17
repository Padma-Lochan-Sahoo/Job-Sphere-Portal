import React, { useState, useContext, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { X, Send, Volume2, VolumeX, ArrowDown, Trash } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";


const ChatbotWindow = ({ onClose }) => {
  const { backendUrl, userToken, userData } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const synth = window.speechSynthesis;
  const chatRef = useRef(null);
  const chatEndRef = useRef(null);


  useEffect(() => {
    const handleScroll = () => {
      if (!chatRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = chatRef.current;

      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    };

    const chatContainer = chatRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToBottom = (smooth = true) => {
    chatEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom(false);
    }
  }, [messages]);

  const getLatestBotResponse = () => {
    const botMessages = messages.filter((msg) => msg.sender === "bot");
    return botMessages.length > 0
      ? botMessages[botMessages.length - 1].text
      : "";
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      const latestResponse = getLatestBotResponse();
      if (latestResponse) {
        const utterance = new SpeechSynthesisUtterance(latestResponse);
        utterance.onend = () => setIsSpeaking(false);
        synth.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const typeMessage = async (text, delay = 200) => {
    let botMessage = { text: "", sender: "bot" };
    setMessages((prev) => [...prev, botMessage]);
  
    const words = text.split(" ");
  
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      botMessage.text += (i === 0 ? "" : " ") + words[i];
      setMessages((prev) => [...prev.slice(0, -1), { ...botMessage }]);
    }
  };
  

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    if (!userData || !userData._id) {
      console.error("User ID is missing.");
      return;
    }

    const userId = userData._id;
    const newMessage = { text: input, sender: "user" };
    setMessages([...messages, newMessage]);
    setInput("");
    setIsTyping(true);
    setIsGenerating(true);

    setTimeout(() => scrollToBottom(), 100);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/chatbot`,
        { userId, prompt: input },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      await typeMessage(data.response, 50); 
    } catch (error) {
      console.error("Chatbot error:", error.response?.data || error.message);
    } finally {
      setIsTyping(false);
      setIsGenerating(false);
    }
  };

  const clearChatHistory = async () => {
    if (!userData || !userData._id) {
      console.error("User ID is missing.");
      return;
    }
  
    try {
      const response = await axios.post(
        `${backendUrl}/api/chatbot/clear-history`,
        { userId: userData._id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
  
      if (response.status === 200) {
        setMessages([]);
        console.log("Chat history cleared.");
      }
    } catch (error) {
      console.error("Error clearing chat history:", error.response?.data || error.message);
    }
  };
  

  return (



    <div className="fixed bottom-5 right-3 md:right-10 bg-white shadow-xl w-full max-w-[90%] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] h-[75vh] max-h-[80vh] rounded-xl flex flex-col overflow-hidden">
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <span>Chatbot</span>
        <div className="flex items-center space-x-3">
          <button onClick={clearChatHistory} className="hover:text-gray-300 transition">
            <Trash size={20} />
          </button>
          <button onClick={onClose} className="hover:text-gray-300 transition">
            <X size={20} />
          </button>
        </div>
      </div>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[65vh]"
      >
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-2 rounded-lg break-words whitespace-pre-wrap w-fit max-w-[85%] md:max-w-[75%] ${
                msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {msg.sender === "bot" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div 
            className="p-2 bg-gray-200 text-black rounded-lg self-start w-fit"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            ...
          </motion.div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {showScrollButton && (
        <button
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white p-2 rounded-full shadow-lg"
          onClick={() => scrollToBottom()}
        >
          <ArrowDown size={20} />
        </button>
      )}

      <div className="p-3 border-t flex items-center space-x-2 bg-white">
        <input
          className="flex-1 border rounded-l p-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me something..."
        />
        <button
          className={`bg-blue-600 text-white ml-2 p-2 rounded ${
            isGenerating || !input.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={sendMessage}
          disabled={isGenerating || !input.trim()}
        >
          <Send size={20} />
        </button>

        <button
          className="bg-gray-300 text-black p-2 rounded-r ml-2"
          onClick={toggleSpeech}
        >
          {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
};

export default ChatbotWindow;