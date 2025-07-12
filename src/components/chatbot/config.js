import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  initialMessages: [
    createChatBotMessage("Hi! Ask me anything about the PhishKit.")
  ],
  botName: "PhishKit AI",
  customStyles: {
    botMessageBox: {
      backgroundColor: "#ec008c",
    },
    chatButton: {
      backgroundColor: "#ec008c",
    },
  },
};

export default config;
