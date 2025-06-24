import React, { useState } from 'react';

function Quiz_question({ questions = [], title, description }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionIdx, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(userAnswers).length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitted(true);
    alert('Quiz submitted!');
  };

  return (
    <div>
      <h1>{title || 'Quiz'}</h1>
      <p>{description}</p>

      <form onSubmit={handleSubmit}>
        {questions.map((q, qIdx) => (
          <div key={q._id} style={{ marginBottom: '1.5rem' }}>
            <p><strong>{qIdx + 1}. {q.questionText}</strong></p>

            {q.options.map((opt, oIdx) => (
              <label key={opt._id} style={{ display: 'block', marginLeft: '1rem' }}>
                <input
                  type="radio"
                  name={`q${qIdx}`}
                  value={oIdx}
                  checked={userAnswers[qIdx] === oIdx}
                  onChange={() => handleAnswerChange(qIdx, oIdx)}
                  disabled={submitted}
                />{' '}
                {opt.text}
              </label>
            ))}

            {submitted && (
              <div style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                <p>
                  {userAnswers[qIdx] === q.options.findIndex((opt) => opt.isCorrect)
                    ? '✅ Correct'
                    : '❌ Incorrect'}
                </p>
                {/* <p><strong>Explanation:</strong> {q.options.find((_, i) => i === userAnswers[qIdx])?.explanation}</p> */}
              </div>
            )}
          </div>
        ))}

        {!submitted && (
          <button type="submit" style={{
            padding: '0.5rem 1.2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            background: '#ec008c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Submit
          </button>
        )}
      </form>
    </div>
  );
}

export default Quiz_question;
