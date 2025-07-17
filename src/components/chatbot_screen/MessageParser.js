import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  async parse(message) {
    try {
      const loadingMessage = this.actionProvider.createChatBotMessage("Typing...");
      this.actionProvider.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, loadingMessage],
      }));

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/chatbot/ask`, {
        question: message,
      });

      const botMessage = this.actionProvider.createChatBotMessage(res.data.answer);

      this.actionProvider.setState((prev) => ({
        ...prev,
        messages: [...prev.messages.slice(0, -1), botMessage],
      }));
    } catch (err) {
      const errorMsg = this.actionProvider.createChatBotMessage("⚠️ Failed to get a response.");
      this.actionProvider.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
      }));
    }
  }
}
