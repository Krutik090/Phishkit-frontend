import React, { useState } from 'react';
import './style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Quiz_question({ questions = [], title, description }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const q = questions[currentQuestion];
  const selectedIdx = userAnswers[currentQuestion];
  const correctIdx = q.options.findIndex((opt) => opt.isCorrect);
  const isAnswered = selectedIdx !== undefined;

  const handleAnswerChange = (optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [currentQuestion]: optionIdx }));
  };

  const handleNext = () => {
    if (!isAnswered) {
      toast.warning('Please select an answer before proceeding.', {
        position: 'top-center',
      });
      return;
    }
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(userAnswers).length !== questions.length) {
      toast.error('Please answer all questions before submitting.', {
        position: 'top-center',
      });
      return;
    }

    // Calculate score
    let score = 0;
    questions.forEach((q, index) => {
      const selectedIdx = userAnswers[index];
      const correctIdx = q.options.findIndex((opt) => opt.isCorrect);
      if (selectedIdx === correctIdx) score++;
    });

    // Get uid from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');

    if (!uid) {
      toast.error('User ID is missing in the URL.', {
        position: 'top-center',
      });
      return;
    }

    // Send POST request
    try {
      const response = await fetch('http://localhost:5000/api/tracking/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid, score }),
      });

      if (!response.ok) {
        throw new Error('Failed to track quiz completion.');
      }

      toast.success('Quiz submitted and tracked successfully!', {
        position: 'top-center',
      });

      // ✅ Only mark as submitted after success
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error('Error tracking quiz completion.', {
        position: 'top-center',
      });
    }
  };


  return (
    <div className="quiz-card">
      <ToastContainer />
      <h2>{title}</h2>
      <p className="quiz-description">{description}</p>

      <form onSubmit={handleSubmit}>
        <div className="question-block">
          <p className="question-text">
            <strong>Q{currentQuestion + 1}:</strong> {q.questionText}
          </p>

          {q.options.map((opt, oIdx) => (
            <label key={opt._id} className="option-label">
              <input
                type="radio"
                name={`q${currentQuestion}`}
                value={oIdx}
                checked={selectedIdx === oIdx}
                onChange={() => handleAnswerChange(oIdx)}
                disabled={submitted}
              />{' '}
              {opt.text}
            </label>
          ))}

          {isAnswered && (
            <div className="answer-feedback">
              <p>{selectedIdx === correctIdx ? '✅ Correct' : '❌ Incorrect'}</p>
              <p>
                <strong>Explanation:</strong>{' '}
                {q.options[selectedIdx]?.explanation || 'No explanation provided.'}
              </p>
            </div>
          )}
        </div>

        {!submitted && (
          <div className="nav-buttons">
            <button
              type="button"
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
              className="btn-secondary"
              style={{ visibility: currentQuestion === 0 ? 'hidden' : 'visible' }}
            >
              ⬅ Prev
            </button>

            {currentQuestion < questions.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
              >
                Next ➡
              </button>
            )}

            {currentQuestion === questions.length - 1 && isAnswered && (
              <button type="submit" className="btn-submit">
                Submit
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default Quiz_question;
