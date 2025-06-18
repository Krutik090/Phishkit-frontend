import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Quiz_question() {
  const { id } = useParams(); // Extract quiz ID from URL
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch quiz data');
        const data = await response.json();
        setQuizData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchQuizData();
  }, [id]);

  const handleAnswerChange = (questionIdx, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(userAnswers).length !== quizData.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitted(true);
    alert('Quiz submitted!');
  };

  if (!quizData) return <div>Loading quiz...</div>;

  return (
    <div>
      <h1>{quizData.title}</h1>
      <p>{quizData.description}</p>

      <form onSubmit={handleSubmit}>
        {quizData.questions.map((q, qIdx) => (
          <div key={q._id}>
            <p>{qIdx + 1}. {q.questionText}</p>
            {q.options.map((opt, oIdx) => (
              <label key={opt._id}>
                <input
                  type="radio"
                  name={`q${qIdx}`}
                  value={oIdx}
                  checked={userAnswers[qIdx] === oIdx}
                  onChange={() => handleAnswerChange(qIdx, oIdx)}
                  disabled={submitted}
                />
                {opt.text}
              </label>
            ))}
            {submitted && (
              <div>
                {userAnswers[qIdx] === undefined
                  ? 'Not Answered'
                  : userAnswers[qIdx] === q.options.findIndex(opt => opt.isCorrect)
                  ? '✔ Correct'
                  : '✖ Incorrect'}
                <p><strong>Explanation:</strong> {q.options[userAnswers[qIdx]]?.explanation}</p>
              </div>
            )}
          </div>
        ))}

        {!submitted && <button type="submit">Submit</button>}
      </form>
    </div>
  );
}

export default Quiz_question;

