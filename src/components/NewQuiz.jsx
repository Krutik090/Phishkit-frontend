import React, { useState } from "react";
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const NewQuiz = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      answers: ["", "", "", ""],
      correctIndex: null,
    },
  ]);

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

  return (
    <Box p={3}>
      {/* Header and Back Button */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate("/quiz-training")} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" color="#343a40">
          ➕ Create New Quiz
        </Typography>
      </Box>

      {/* Main Card */}
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
        }}
      >
        {/* Scrollable Form Area */}
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
            <Paper
              key={qIdx}
              variant="outlined"
              sx={{ p: 2, borderRadius: 2 }}
            >
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

          {/* Add Question Button */}
          <Box display="flex" justifyContent="flex-end">
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              sx={{
                background: "linear-gradient(135deg, #ec008c, #ff6a9f)",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "8px",
                px: 3,
                py: 1,
                textTransform: "uppercase",
                "&:hover": {
                  background: "linear-gradient(135deg, #d6007a, #ff478a)",
                },
              }}
            >
              Add Question
            </Button>
          </Box>
        </Box>

        {/* Save Button */}
        <Button
          variant="contained"
          sx={{
            mt: 3,
            alignSelf: "center",
            background: "linear-gradient(135deg, #28a745, #6fdc8c)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 4,
            py: 1.5,
            textTransform: "uppercase",
          }}
          onClick={() => console.log({ title, description, questions })}
        >
          Save Quiz
        </Button>
      </Paper>
    </Box>
  );
};

export default NewQuiz;
