import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  IconButton,
  Checkbox,
  Tooltip,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { advancedToast } from "../../utils/toast"; // ✅ Use advanced toast

const API_BASE_URL = import.meta.env.VITE_API_URL;

const generatePublicUrl = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${slug}?uid=''`;
};

const NewQuiz = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { darkMode } = useTheme();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", answers: ["", "", "", ""], correctIndex: null },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      const loadingId = advancedToast.info(
        "Loading quiz data...",
        "Fetching Quiz",
        { icon: "📚", autoClose: false }
      );

      fetch(`${API_BASE_URL}/quizzes/${id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title || "");
          setDescription(data.description || "");
          const loadedQuestions = data.questions.map((q) => ({
            questionText: q.questionText,
            answers: q.options.map((opt) => opt.text),
            correctIndex: q.options.findIndex((opt) => opt.isCorrect),
          }));
          setQuestions(loadedQuestions);
          
          advancedToast.dismissById(loadingId);
          advancedToast.success(
            "Quiz loaded successfully!",
            "Quiz Loaded",
            { icon: "✅" }
          );
        })
        .catch((err) => {
          console.error("Failed to load quiz:", err);
          advancedToast.dismissById(loadingId);
          advancedToast.error(
            "Quiz not found or failed to load.",
            "Load Failed",
            { icon: "❌" }
          );
          navigate("/quizz");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", answers: ["", "", "", ""], correctIndex: null },
    ]);
    advancedToast.success(
      "New question added to quiz.",
      "Question Added",
      { icon: "❓" }
    );
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length <= 1) {
      advancedToast.warning(
        "Quiz must have at least one question.",
        "Cannot Delete",
        { icon: "⚠️" }
      );
      return;
    }
    
    setQuestions(questions.filter((_, i) => i !== index));
    advancedToast.success(
      `Question ${index + 1} deleted successfully.`,
      "Question Deleted",
      { icon: "🗑️" }
    );
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].questionText = value;
    setQuestions(updated);
  };

  const handleAnswerChange = (qIdx, aIdx, value) => {
    const updated = [...questions];
    updated[qIdx].answers[aIdx] = value;
    setQuestions(updated);
  };

  const handleCorrectAnswer = (qIdx, aIdx) => {
    const updated = [...questions];
    updated[qIdx].correctIndex = aIdx;
    setQuestions(updated);
  };

  const handleSampleDownload = async () => {
    try {
      const loadingId = advancedToast.info(
        "Preparing quiz template download...",
        "Downloading Template",
        { icon: "⏳", autoClose: false }
      );

      const response = await fetch(`${API_BASE_URL}/quizzes/template`, {
        credentials: "include",
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to download template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sample_quiz_template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);

      advancedToast.dismissById(loadingId);
      advancedToast.success(
        "Quiz template downloaded successfully!",
        "Download Complete",
        { icon: "💾" }
      );
    } catch (error) {
      advancedToast.error(
        "Failed to download sample template. Please try again.",
        "Download Failed",
        { icon: "❌" }
      );
      console.error("Download error:", error);
    }
  };

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const loadingId = advancedToast.info(
        `Importing quiz from "${file.name}"...`,
        "Processing File",
        { icon: "⏳", autoClose: false }
      );

      const response = await fetch(`${API_BASE_URL}/quizzes/import`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to import quiz");

      const data = await response.json();

      setTitle(data.quiz.title || "");
      setDescription(data.quiz.description || "");

      const importedQuestions = data.quiz.questions.map((q) => ({
        questionText: q.questionText,
        answers: q.options.map((opt) => opt.text),
        correctIndex: q.options.findIndex((opt) => opt.isCorrect),
      }));

      setQuestions(importedQuestions);

      advancedToast.dismissById(loadingId);
      advancedToast.success(
        `Quiz imported successfully with ${importedQuestions.length} questions!`,
        "Import Complete",
        { icon: "📥" }
      );

      // Clear the file input
      e.target.value = '';
    } catch (error) {
      console.error("Import error:", error);
      advancedToast.error(
        error.message || "Failed to import from Excel. Please check the file format.",
        "Import Failed",
        { icon: "❌" }
      );
    } finally {
      setIsImporting(false);
    }
  };

  const saveQuiz = async () => {
    // Validation
    if (!title.trim()) {
      advancedToast.warning(
        "Please enter a quiz title to continue.",
        "Title Required",
        { icon: "📝" }
      );
      return;
    }

    if (!description.trim()) {
      advancedToast.warning(
        "Please enter a quiz description.",
        "Description Required",
        { icon: "📝" }
      );
      return;
    }

    // Validate questions
    const invalidQuestions = questions.filter(q => 
      !q.questionText.trim() || 
      q.answers.some(ans => !ans.trim()) || 
      q.correctIndex === null
    );

    if (invalidQuestions.length > 0) {
      advancedToast.warning(
        "Please complete all questions with text, answers, and correct answer selection.",
        "Incomplete Questions",
        { icon: "❓" }
      );
      return;
    }

    setIsSaving(true);

    const formattedQuestions = questions.map((q) => ({
      questionText: q.questionText,
      options: q.answers.map((ans, idx) => ({
        text: ans,
        isCorrect: q.correctIndex === idx,
        explanation: "Phishing tricks users into revealing personal information via fake emails or websites.",
      })),
    }));

    const quizData = {
      title,
      description,
      publicUrl: id ? undefined : generatePublicUrl(),
      questions: formattedQuestions,
    };

    try {
      const loadingId = advancedToast.info(
        `${id ? 'Updating' : 'Creating'} quiz "${title}"...`,
        "Saving Quiz",
        { icon: "⏳", autoClose: false }
      );

      const response = await fetch(`${API_BASE_URL}/quizzes/${id || ""}`, {
        credentials: "include",
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) throw new Error("Failed to save quiz");

      await response.json();

      advancedToast.dismissById(loadingId);
      advancedToast.success(
        `Quiz "${title}" ${id ? 'updated' : 'created'} successfully!`,
        `Quiz ${id ? 'Updated' : 'Created'}`,
        { icon: "🎉" }
      );

      navigate("/quizz");
    } catch (error) {
      console.error("Error saving quiz:", error);
      advancedToast.error(
        error.message || "Failed to save quiz. Please try again.",
        "Save Failed",
        { icon: "❌" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const textFieldStyle = {
    '& .MuiInput-root': {
      color: darkMode ? '#e1e1e1' : '#333',
      '&:before': {
        borderBottomColor: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
      },
      '&:hover:before': {
        borderBottomColor: darkMode ? alpha('#fff', 0.5) : alpha('#000', 0.5),
      },
      '&.Mui-focused:after': {
        borderBottomColor: '#ec008c',
      },
    },
    '& .MuiInputLabel-root': {
      color: darkMode ? '#ccc' : '#666',
      '&.Mui-focused': {
        color: '#ec008c',
      },
    },
    '& .MuiInput-input': {
      color: `${darkMode ? '#e1e1e1' : '#333'} !important`,
    },
  };

  if (isLoading) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={48} sx={{ mb: 2, color: '#ec008c' }} />
            <Typography variant="h6" color="text.secondary">
              Loading quiz...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: '16px',
          backgroundColor: darkMode ? alpha('#1e1e2f', 0.7) : alpha('#ffffff', 0.7),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={() => navigate("/quizz")} 
            sx={{
              color: '#ec008c',
              '&:hover': {
                backgroundColor: alpha('#ec008c', 0.1),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={1.5}>
            <QuizIcon sx={{ color: '#ec008c' }} />
            <Typography 
              variant="h5" 
              fontWeight="bold"
              color={darkMode ? '#e1e1e1' : '#333'}
            >
              {id ? "Edit Quiz" : "Create New Quiz"}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2}>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleExcelImport}
          />

          <Button
            startIcon={isImporting ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
            onClick={() => fileInputRef.current.click()}
            disabled={isSaving || isImporting}
            sx={{
              background: (isSaving || isImporting) ? 
                'rgba(236, 0, 140, 0.3)' : 
                'linear-gradient(135deg, #ec008c, #fc6767)',
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #d6007a, #e55555)',
              },
            }}
          >
            {isImporting ? 'Importing...' : 'Import from Excel'}
          </Button>

          <Button
            startIcon={<DownloadIcon />}
            onClick={handleSampleDownload}
            disabled={isSaving || isImporting}
            sx={{
              background: 'linear-gradient(135deg, #ec008c, #fc6767)',
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #d6007a, #e55555)',
              },
            }}
          >
            Download Template
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "20px",
          maxWidth: 1200,
          height: "750px",
          margin: "0 auto",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: darkMode ? alpha("#1a1a2e", 0.95) : alpha("#ffffff", 0.95),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${darkMode ? alpha('#fff', 0.15) : alpha('#000', 0.1)}`,
          boxShadow: darkMode ? 
            '0 8px 32px rgba(0, 0, 0, 0.5)' : 
            '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            // ✅ Advanced scrollbar styling
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05),
              borderRadius: '4px',
              margin: '2px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: darkMode ? alpha('#fff', 0.2) : alpha('#000', 0.2),
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: darkMode ? alpha('#fff', 0.3) : alpha('#000', 0.3),
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: darkMode 
              ? 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05)',
          }}
        >
          <TextField
            label="Quiz Title *"
            variant="standard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
            fullWidth
            sx={textFieldStyle}
            placeholder="Enter a descriptive quiz title..."
          />
          
          <TextField
            label="Description *"
            variant="standard"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSaving}
            multiline
            fullWidth
            sx={textFieldStyle}
            placeholder="Describe what this quiz is about..."
          />

          {questions.map((q, qIdx) => (
            <Paper 
              key={qIdx} 
              variant="outlined" 
              sx={{ 
                p: 3, 
                borderRadius: '16px', 
                backgroundColor: darkMode ? alpha('#2d2d3e', 0.6) : alpha('#f9f9f9', 0.8),
                border: `1px solid ${darkMode ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  fontWeight="bold" 
                  variant="h6"
                  color={darkMode ? '#e1e1e1' : '#333'}
                >
                  Question {qIdx + 1}
                </Typography>
                <Tooltip title="Delete Question">
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteQuestion(qIdx)}
                    disabled={isSaving}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha('#f44336', 0.1),
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <TextField
                label="Question Text *"
                fullWidth
                variant="standard"
                value={q.questionText}
                onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
                disabled={isSaving}
                sx={{ ...textFieldStyle, mt: 1, mb: 2 }}
                placeholder="Enter your question here..."
              />

              {q.answers.map((ans, aIdx) => (
                <Box key={aIdx} display="flex" alignItems="center" gap={2} mt={2}>
                  <Checkbox
                    checked={q.correctIndex === aIdx}
                    onChange={() => handleCorrectAnswer(qIdx, aIdx)}
                    disabled={isSaving}
                    sx={{
                      color: darkMode ? '#ccc' : '#666',
                      '&.Mui-checked': {
                        color: '#ec008c',
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label={`Answer ${aIdx + 1} *`}
                    value={ans}
                    onChange={(e) => handleAnswerChange(qIdx, aIdx, e.target.value)}
                    disabled={isSaving}
                    sx={textFieldStyle}
                    placeholder={`Enter answer option ${aIdx + 1}...`}
                  />
                </Box>
              ))}

              {/* Hint text */}
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 1, 
                  display: 'block',
                  color: darkMode ? '#999' : '#666',
                  fontStyle: 'italic'
                }}
              >
                💡 Check the checkbox next to the correct answer
              </Typography>
            </Paper>
          ))}

          <Box display="flex" justifyContent="flex-end">
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              disabled={isSaving}
              sx={{
                background: 'linear-gradient(135deg, #ec008c, #fc6767)',
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "12px",
                px: 3,
                py: 1.5,
                textTransform: "none",
                '&:hover': {
                  background: 'linear-gradient(135deg, #d6007a, #e55555)',
                },
              }}
            >
              Add Question
            </Button>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={isSaving ? null : <SaveIcon />}
          sx={{
            mt: 3,
            alignSelf: "center",
            background: (isSaving || !title.trim() || !description.trim()) ? 
              'rgba(236, 0, 140, 0.3)' : 
              'linear-gradient(135deg, #ec008c, #fc6767)',
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "12px",
            px: 4,
            py: 1.5,
            textTransform: "none",
            minWidth: '160px',
          }}
          onClick={saveQuiz}
          disabled={isSaving || !title.trim() || !description.trim()}
        >
          {isSaving ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={16} color="inherit" />
              {id ? "Updating..." : "Saving..."}
            </Box>
          ) : (
            id ? "Update Quiz" : "Save Quiz"
          )}
        </Button>
      </Paper>
    </Box>
  );
};

export default NewQuiz;
