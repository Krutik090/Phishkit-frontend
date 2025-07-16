import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  initialMessages: [
    createChatBotMessage("Hi! Ask me anything about the PhishKit.")
  ],
  botName: "PhishKit AI",
  customStyles: {
    botMessageBox: {
      backgroundColor: localStorage.getItem('primaryColor'),
    },
    chatButton: {
      backgroundColor: localStorage.getItem('primaryColor'),
    },
  },
};

export default config;