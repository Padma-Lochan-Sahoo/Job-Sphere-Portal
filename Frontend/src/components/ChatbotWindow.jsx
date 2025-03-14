import React, { useState, useContext, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { X, Send, Volume2, VolumeX, ArrowDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

      let responseText = data.response.split("\n");
      let botMessage = { text: "", sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);

      for (let line of responseText) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        botMessage.text += line + "\n";
        setMessages((prev) => [...prev.slice(0, -1), botMessage]);
      }
    } catch (error) {
      console.error("Chatbot error:", error.response?.data || error.message);
    } finally {
      setIsTyping(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-16 right-6 bg-white shadow-xl w-[550px] h-[620px] rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between">
        <span>Chatbot</span>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 relative"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-lg break-words w-fit max-w-[75%] 
                                ${
                                  msg.sender === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-black"
                                }`}
            >
              {msg.sender === "bot" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="p-2 bg-gray-200 text-black rounded-lg self-start w-fit">
            Typing...
          </div>
        )}

        {/* Empty div for scrolling */}
        <div ref={chatEndRef}></div>
      </div>

      {/* Scroll to bottom button (Centered like ChatGPT) */}
      {showScrollButton && (
        <button
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white p-2 rounded-full shadow-lg"
          onClick={() => scrollToBottom()}
        >
          <ArrowDown size={20} />
        </button>
      )}

      {/* Input & Buttons */}
      <div className="p-3 border-t flex items-center">
        <input
          className="flex-1 border rounded-l p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me something..."
        />
        <button
          className={`bg-blue-600 text-white ml-2 p-2 rounded-r ${
            isGenerating || !input.trim()
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
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
