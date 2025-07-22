import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './style.css';
import Quiz_question from './Quiz_question';

function QuizTemplate() {
  const { publicUrl } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/quizzes/url/${publicUrl}`);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No quiz found");
        }
        
        setQuiz(data[0]);
      } catch (err) {
        console.error(err);
        setError("Unable to load quiz. Please check the link.");
      } finally {
        setLoading(false);
      }
    };

    if (publicUrl) {
      fetchQuiz();
    }
  }, [publicUrl]);

  if (loading) return <div className="quiz-container">⏳ Loading quiz...</div>;
  if (error) return <div className="quiz-container error">{error}</div>;
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return <div className="quiz-container error">❌ No valid quiz data found.</div>;
  }

  return (
    <div className="quiz-page">
      <div className="header">
        <img src="/Triabation_Logo.png" alt="Logo" height={50} />
        <h1 className="quiz-title">{quiz.title}</h1>
      </div>

      <div className="animated-bg"></div>

      <div className="quiz-container">
        <Quiz_question
          title={quiz.title}
          description={quiz.description}
          questions={quiz.questions}
        />
      </div>
    </div>
  );
}

export default QuizTemplate;
