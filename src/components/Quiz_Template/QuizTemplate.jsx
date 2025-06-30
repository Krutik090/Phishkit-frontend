import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './style.css';
import Quiz_question from './Quiz_question';

function QuizTemplate() {
  const { publicUrl } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/url/${publicUrl}`);
        if (!response.ok) throw new Error("Quiz not found");
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load quiz. Please check the link.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [publicUrl]);

  if (loading) return <div className="quiz-container">Loading quiz...</div>;
  if (error) return <div className="quiz-container error">{error}</div>;

  return (
    <div className="quiz-page">
      <div className="header">
        <h1 className="quiz-title">{quiz.title}</h1>
        <img
          src="https://www.jindalstainless.com/wp-content/themes/jsl/assets/images/Logo-Dark.png"
          alt="JSL Logo"
        />
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