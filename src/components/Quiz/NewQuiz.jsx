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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext"; 

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", answers: ["", "", "", ""], correctIndex: null },
  ]);

  const { darkMode } = useTheme(); 

  const fileInputRef = useRef();

  useEffect(() => {
    if (id) {
      fetch(`${API_BASE_URL}/quizzes/${id}`)
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
        })
        .catch((err) => {
          console.error("Failed to load quiz:", err);
          alert("Quiz not found");
          navigate("/quizz");
        });
    }
  }, [id]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", answers: ["", "", "", ""], correctIndex: null },
    ]);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
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
      const response = await fetch(`${API_BASE_URL}/quizzes/template`, {
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
    } catch (error) {
      toast.error("Failed to download sample file.");
      console.error("Download error:", error);
    }
  };

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/quizzes/import`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to import quiz");

      const data = await response.json();

      // Set title and description from imported quiz
      setTitle(data.quiz.title || "");
      setDescription(data.quiz.description || "");

      // Transform options to answers and correctIndex
      const importedQuestions = data.quiz.questions.map((q) => ({
        questionText: q.questionText,
        answers: q.options.map((opt) => opt.text),
        correctIndex: q.options.findIndex((opt) => opt.isCorrect),
      }));

      setQuestions(importedQuestions);
      toast.success("📥 Quiz imported and populated!");
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import from Excel.");
    }
  };

  const saveQuiz = async () => {
    const formattedQuestions = questions.map((q) => ({
      questionText: q.questionText,
      options: q.answers.map((ans, idx) => ({
        text: ans,
        isCorrect: q.correctIndex === idx,
        explanation:
          "Phishing tricks users into revealing personal information via fake emails or websites.",
      })),
    }));

    const quizData = {
      title,
      description,
      publicUrl: id ? undefined : generatePublicUrl(),
      questions: formattedQuestions,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/quizzes/${id || ""}`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) throw new Error("Failed to save quiz");

      await response.json();
      toast.success(id ? "Quiz updated successfully!" : "🎉 Quiz created successfully!");
      navigate("/quizz");
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Failed to save quiz. Please try again.");
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate("/quizz")} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            {id ? "✏️ Edit Quiz" : "➕ Create New Quiz"}
          </Typography>
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
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current.click()}
            sx={{
              background: `linear-gradient(135deg,${localStorage.getItem("primaryColor")},${localStorage.getItem("secondaryColor")})`,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
              textTransform: "uppercase",
              px: 3,
            }}
          >
            Import from Excel
          </Button>

          <Button
            startIcon={<DownloadIcon />}
            onClick={handleSampleDownload}
            sx={{
              background: `linear-gradient(135deg,${localStorage.getItem("primaryColor")},${localStorage.getItem("secondaryColor")})`,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "8px",
              textTransform: "uppercase",
              px: 3,
            }}
          >
            Download Sample Template
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: "12px",
          maxWidth: 1200,
          height: "750px",
          margin: "0 auto",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: darkMode ? "#FEC5F6" : "#fff",
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
          }}
        >
          <TextField
            label="Quiz Title"
            variant="standard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            variant="standard"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            fullWidth
          />

          {questions.map((q, qIdx) => (
            <Paper key={qIdx} variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: darkMode ? "#FFE1FF" : "#f9f9f9",  }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight="bold">Question {qIdx + 1}</Typography>
                <Tooltip title="Delete Question">
                  <IconButton color="error" onClick={() => handleDeleteQuestion(qIdx)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <TextField
                label="Question"
                fullWidth
                variant="standard"
                value={q.questionText}
                onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
                sx={{ mt: 1 }}
              />

              {q.answers.map((ans, aIdx) => (
                <Box key={aIdx} display="flex" alignItems="center" gap={2} mt={1}>
                  <Checkbox
                    checked={q.correctIndex === aIdx}
                    onChange={() => handleCorrectAnswer(qIdx, aIdx)}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label={`Answer ${aIdx + 1}`}
                    value={ans}
                    onChange={(e) => handleAnswerChange(qIdx, aIdx, e.target.value)}
                  />
                </Box>
              ))}
            </Paper>
          ))}

          <Box display="flex" justifyContent="flex-end">
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              sx={{
                background: `linear-gradient(135deg,${localStorage.getItem("primaryColor")},${localStorage.getItem("secondaryColor")})`,
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "8px",
                px: 3,
                py: 1,
                textTransform: "uppercase",
                "&:hover": {
                  background: `linear-gradient(135deg,${localStorage.getItem("primaryColor")},${localStorage.getItem("secondaryColor")})`,
                },
              }}
            >
              Add Question
            </Button>
          </Box>
        </Box>

        <Button
          variant="contained"
          sx={{
            mt: 3,
            alignSelf: "center",
            background: `linear-gradient(135deg, ${localStorage.getItem("primaryColor")},${localStorage.getItem("secondaryColor")})`,
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 4,
            py: 1.5,
            textTransform: "uppercase",
          }}
          onClick={saveQuiz}
        >
          {id ? "Update Quiz" : "Save Quiz"}
        </Button>
      </Paper>
    </Box>
  );
};

export default NewQuiz;
