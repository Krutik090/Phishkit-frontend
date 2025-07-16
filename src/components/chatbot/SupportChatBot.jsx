import React, { useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";

import config from "./config";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";

const SupportChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 30,
        right: 30,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {/* Chatbox with advanced animation */}
      {isOpen && (
        <div
          style={{
            transition: "all 0.5s ease",
            transform: "scale(1) translateY(0px)",
            opacity: 1,
            pointerEvents: "auto",
            transformOrigin: "bottom right",
          }}
        >
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        </div>
      )}


      {/* Toggle Chat Icon Button */}
      <button
        onClick={toggleChat}
        style={{
          backgroundColor: "#ec008c",
          border: "none",
          borderRadius: "50%",
          width: 60,
          height: 60,
          color: "white",
          fontSize: 28,
          cursor: "pointer",
          marginTop: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "transform 0.2s ease",
        }}
        title="Toggle Chat"
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        💬
      </button>
    </div>
  );
};

export default SupportChatBot;
