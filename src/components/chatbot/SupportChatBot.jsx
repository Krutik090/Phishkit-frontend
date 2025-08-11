import React, { useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  Fab,
  Box,
  IconButton,
  alpha,
  useMediaQuery,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Support as SupportIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SupportChatBot = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      message: "Hi! Ask me anything about PhishKit. How can I help you today?",
      sentTime: "just now",
      sender: "ChatBot",
      direction: "incoming",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  const toggleChat = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      
      if (newState && isFirstOpen) {
        setIsFirstOpen(false);
        advancedToast.success(
          "Welcome! How can I help you today?",
          "Support Chat",
          { 
            icon: "💬",
            position: isMobile ? "top-center" : "top-right"
          }
        );
      }
      
      return newState;
    });
  };

  const callChatbotAPI = async (userMessage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          question: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.answer || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      console.error("Chatbot API Error:", error);
      
      advancedToast.error(
        "Failed to get response from the server. Please try again.",
        "Connection Error",
        { icon: "🔌" }
      );
      
      return "⚠️ I'm having trouble connecting to the server right now. Please try again later or contact support.";
    }
  };

  const handleSend = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      message,
      direction: "outgoing",
      sender: "user",
      sentTime: new Date().toLocaleTimeString(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsTyping(true);

    try {
      const botResponse = await callChatbotAPI(message);
      
      const botMessage = {
        message: botResponse,
        sentTime: new Date().toLocaleTimeString(),
        sender: "ChatBot",
        direction: "incoming",
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
    } catch (error) {
      console.error("Error in handleSend:", error);
      
      const errorMessage = {
        message: "Sorry, I encountered an error. Please try again.",
        sentTime: new Date().toLocaleTimeString(),
        sender: "ChatBot",
        direction: "incoming",
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* ✅ CRITICAL FIX: Global CSS injection to fix input text visibility in dark mode */}
      <style jsx global>{`
        .cs-message-input__content-editor {
          background-color: ${darkMode ? 'rgba(255, 255, 255, 0.05) !important' : 'rgba(255, 255, 255, 0.9) !important'};
          color: ${darkMode ? '#e1e1e1 !important' : '#333 !important'};
          border: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} !important;
          border-radius: 25px !important;
        }
        
        .cs-message-input__content-editor-wrapper {
          background-color: ${darkMode ? 'rgba(255, 255, 255, 0.05) !important' : 'rgba(255, 255, 255, 0.9) !important'};
          color: ${darkMode ? '#e1e1e1 !important' : '#333 !important'};
          border-radius: 25px !important;
        }
        
        .cs-message-input__content-editor div[contenteditable="true"] {
          color: ${darkMode ? '#e1e1e1 !important' : '#333 !important'};
          background-color: transparent !important;
        }
        
        .cs-message-input__content-editor div[contenteditable="true"]:focus {
          color: ${darkMode ? '#ffffff !important' : '#000 !important'};
          outline: none !important;
        }
        
        .cs-message-input__content-editor div[data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: ${darkMode ? '#999 !important' : '#666 !important'};
          opacity: 0.7;
        }
        
        .cs-message-input__content-editor div[contenteditable="true"]:empty:before {
          content: "Type your message about PhishKit...";
          color: ${darkMode ? '#999 !important' : '#666 !important'};
          opacity: 0.7;
        }
        
        /* Fix for all text inputs in chatbot */
        .cs-message-input input,
        .cs-message-input textarea,
        .cs-message-input [contenteditable] {
          color: ${darkMode ? '#e1e1e1 !important' : '#333 !important'};
          background-color: transparent !important;
        }
        
        /* Ensure caret is visible */
        .cs-message-input__content-editor div[contenteditable="true"] {
          caret-color: ${darkMode ? '#e1e1e1' : '#333'};
        }
      `}</style>

      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 20, sm: 30 },
          right: { xs: 20, sm: 30 },
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {/* ✅ ChatScope Chat Container */}
        {isOpen && (
          <Box
            sx={{
              mb: 2,
              borderRadius: "20px",
              overflow: "hidden",
              width: { xs: "90vw", sm: "400px", md: "450px" },
              height: { xs: "70vh", sm: "500px", md: "600px" },
              maxWidth: "450px",
              maxHeight: "600px",
              boxShadow: darkMode 
                ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(236, 0, 140, 0.2)' 
                : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(236, 0, 140, 0.1)',
              animation: "chatboxSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transformOrigin: "bottom right",
              '@keyframes chatboxSlideIn': {
                '0%': { transform: 'scale(0.3) translateY(100px)', opacity: 0 },
                '50%': { transform: 'scale(1.05) translateY(-10px)', opacity: 0.8 },
                '100%': { transform: 'scale(1) translateY(0px)', opacity: 1 },
              },
              // ✅ Enhanced ChatScope Dark Mode Styling
              '& .cs-main-container': {
                backgroundColor: darkMode ? '#1a1a2e !important' : '#ffffff !important',
                borderRadius: '20px !important',
                border: 'none !important',
              },
              '& .cs-chat-container': {
                backgroundColor: darkMode ? '#1a1a2e !important' : '#ffffff !important',
                borderRadius: '20px !important',
              },
              '& .cs-message-list': {
                backgroundColor: darkMode ? '#1a1a2e !important' : '#ffffff !important',
                padding: '16px !important',
              },
              '& .cs-message--incoming .cs-message__content': {
                backgroundColor: darkMode ? 'rgba(236, 0, 140, 0.15) !important' : 'rgba(236, 0, 140, 0.08) !important',
                color: darkMode ? '#e1e1e1 !important' : '#333 !important',
                borderRadius: '12px !important',
                border: '1px solid rgba(236, 0, 140, 0.2) !important',
              },
              '& .cs-message--outgoing .cs-message__content': {
                background: 'linear-gradient(135deg, #ec008c, #fc6767) !important',
                color: '#fff !important',
                borderRadius: '12px !important',
              },
              '& .cs-message-input': {
                backgroundColor: darkMode ? 'rgba(45, 45, 62, 0.3) !important' : 'rgba(249, 249, 249, 0.8) !important',
                borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} !important`,
                borderRadius: '0 0 20px 20px !important',
              },
              '& .cs-button--send': {
                background: 'linear-gradient(135deg, #ec008c, #fc6767) !important',
                borderRadius: '50% !important',
                border: 'none !important',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d6007a, #e55555) !important',
                  transform: 'scale(1.05) !important',
                },
              },
              '& .cs-typing-indicator': {
                backgroundColor: darkMode ? 'rgba(236, 0, 140, 0.15) !important' : 'rgba(236, 0, 140, 0.08) !important',
                borderRadius: '12px !important',
                border: '1px solid rgba(236, 0, 140, 0.2) !important',
              },
            }}
          >
            {/* ✅ Custom Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #ec008c, #fc6767)',
                color: '#fff',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '20px 20px 0 0',
                position: 'relative',
                zIndex: 10,
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <SupportIcon />
                <Box>
                  <Box sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    PhishKit Assistant
                  </Box>
                  <Box sx={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Online • Ready to help
                  </Box>
                </Box>
              </Box>
              
              <IconButton
                onClick={toggleChat}
                size="small"
                sx={{
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* ✅ ChatScope Main Container */}
            <MainContainer
              style={{
                height: 'calc(100% - 80px)',
                backgroundColor: darkMode ? '#1a1a2e' : '#ffffff',
                borderRadius: '0 0 20px 20px',
              }}
            >
              <ChatContainer>
                <MessageList
                  scrollBehavior="smooth"
                  typingIndicator={
                    isTyping ? (
                      <TypingIndicator content="PhishKit Assistant is thinking..." />
                    ) : null
                  }
                >
                  {messages.map((message, i) => (
                    <Message
                      key={i}
                      model={{
                        message: message.message,
                        sentTime: message.sentTime,
                        sender: message.sender,
                        direction: message.direction,
                      }}
                    >
                      {message.direction === "incoming" && (
                        <Avatar
                          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSA5VjIySDNWOUMzIDguNDUgMy40NSA4IDQgOEg1TDcgNkgxN0wxOSA4SDIwQzIwLjU1IDggMjEgOC40NSAyMSA5WiIgZmlsbD0iIzgwODA4MCIvPgo8L3N2Zz4K"
                          name="PhishKit Assistant"
                        />
                      )}
                    </Message>
                  ))}
                </MessageList>
                <MessageInput 
                  placeholder="Type your message about PhishKit..." 
                  onSend={handleSend}
                  attachButton={false}
                  disabled={isTyping}
                />
              </ChatContainer>
            </MainContainer>
          </Box>
        )}

        {/* ✅ Toggle Button */}
        <Fab
          onClick={toggleChat}
          sx={{
            width: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
            background: isOpen 
              ? 'linear-gradient(135deg, #f44336, #ff5722)'
              : 'linear-gradient(135deg, #ec008c, #fc6767)',
            color: '#fff',
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(236, 0, 140, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(236, 0, 140, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            animation: isFirstOpen ? 'pulse 2s infinite' : 'none',
            '&:hover': {
              transform: 'scale(1.1) rotateZ(5deg)',
              boxShadow: darkMode 
                ? '0 12px 48px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(236, 0, 140, 0.4)' 
                : '0 12px 48px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(236, 0, 140, 0.3)',
            },
            '@keyframes pulse': {
              '0%, 100%': {
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(236, 0, 140, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(236, 0, 140, 0.2)',
              },
              '50%': {
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(236, 0, 140, 0.5)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(236, 0, 140, 0.4)',
                transform: 'scale(1.05)',
              },
            },
          }}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </Fab>

        {/* ✅ Tooltip */}
        {isFirstOpen && !isOpen && (
          <Box
            sx={{
              position: 'absolute',
              top: -60,
              right: 0,
              background: darkMode 
                ? alpha('#1a1a2e', 0.95) 
                : alpha('#ffffff', 0.98),
              backdropFilter: 'blur(12px)',
              border: `1px solid ${darkMode 
                ? alpha('#fff', 0.15) 
                : alpha('#000', 0.1)
              }`,
              borderRadius: '12px',
              p: 1.5,
              boxShadow: darkMode 
                ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
              animation: 'tooltipFadeIn 0.5s ease-out',
              '@keyframes tooltipFadeIn': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '100%',
                right: '20px',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: `8px solid ${darkMode 
                  ? alpha('#1a1a2e', 0.95) 
                  : alpha('#ffffff', 0.98)
                }`,
              },
            }}
          >
            <Box
              sx={{
                fontSize: '0.875rem',
                fontWeight: 'medium',
                color: darkMode ? '#e1e1e1' : '#333',
                whiteSpace: 'nowrap',
              }}
            >
              💬 Need help with PhishKit?
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default SupportChatBot;
