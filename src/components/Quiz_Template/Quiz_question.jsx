import React, { useEffect, useState, useRef } from 'react';
import './style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Quiz_question({ questions = [], title, description, uid }) {
  const [userAnswers, setUserAnswers] = useState(() => {
    const saved = sessionStorage.getItem(`answers_${uid}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [frozenQuestions, setFrozenQuestions] = useState(() => {
    const saved = sessionStorage.getItem(`frozen_${uid}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef(null);
  const submittedRef = useRef(false);
  const scoreRef = useRef(null);
  const autoAdvanceRef = useRef(false);

  const q = Array.isArray(questions) && questions.length > 0 ? questions[currentQuestion] : null;
  const selectedIdx = userAnswers[currentQuestion];
  const correctIdx = q?.options.findIndex((opt) => opt.isCorrect);
  const isAnswered = selectedIdx !== undefined;
  const isFrozen = frozenQuestions[currentQuestion];

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (questions.length > 0) {
      const saved = sessionStorage.getItem(`current_${uid}`);
      const parsed = saved ? parseInt(saved, 10) : 0;
      setCurrentQuestion(parsed >= 0 && parsed < questions.length ? parsed : 0);
    }
  }, [questions, uid]);

  useEffect(() => {
    if (!submitted && q) {
      clearInterval(timerRef.current);
      setTimeLeft(60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (!isAnswered) {
              setFrozenQuestions((prev) => {
                const updated = { ...prev, [currentQuestion]: true };
                sessionStorage.setItem(`frozen_${uid}`, JSON.stringify(updated));
                return updated;
              });
            }
            autoAdvanceRef.current = true;
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [currentQuestion, submitted, q]);

  useEffect(() => {
    if (autoAdvanceRef.current && !submitted) {
      autoAdvanceRef.current = false;
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        handleSubmit(new Event('submit'));
      }
    }
  }, [timeLeft, submitted]);

  useEffect(() => {
    if (questions.length > 0) {
      sessionStorage.setItem(`answers_${uid}`, JSON.stringify(userAnswers));
      sessionStorage.setItem(`current_${uid}`, currentQuestion);
    }
  }, [userAnswers, currentQuestion, uid, questions.length]);

  useEffect(() => {
    if (submitted) {
      sessionStorage.removeItem(`answers_${uid}`);
      sessionStorage.removeItem(`current_${uid}`);
      sessionStorage.removeItem(`frozen_${uid}`);
    }
  }, [submitted, uid]);

  useEffect(() => {
    const preventExit = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handleVisibility = () => {
      if (document.hidden && !submitted) {
        toast.error('🚫 Switching tabs is not allowed!', { position: 'top-center' });
      }
    };

    window.addEventListener('beforeunload', preventExit);
    window.addEventListener('blur', preventExit);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', preventExit);
      window.removeEventListener('blur', preventExit);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [submitted]);

  const handleAnswerChange = (optionIdx) => {
    if (isAnswered || isFrozen) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (!isAnswered && !isFrozen) {
      toast.warning('Please answer or wait for timeout.', { position: 'top-center' });
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    sessionStorage.clear();
    setUserAnswers({});
    setFrozenQuestions({});
    setCurrentQuestion(0);
    setSubmitted(false);
    submittedRef.current = false;
    toast.success('🔁 Quiz reset.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittedRef.current) return;
    submittedRef.current = true;

    let score = 0;
    questions.forEach((q, index) => {
      const selected = userAnswers[index];
      const correct = q.options.findIndex((opt) => opt.isCorrect);
      if (selected === correct) score++;
    });

    if (!uid) {
      toast.error('User ID is missing.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/tracking/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, score }),
      });

      if (!res.ok) throw new Error('Tracking failed.');

      scoreRef.current = score;
      setSubmitted(true);
      toast.success(`✅ Quiz completed! Your score: ${score}/${questions.length}`);
    } catch (err) {
      console.error(err);
      toast.error('Error tracking completion.');
    }
  };

  if (!Array.isArray(questions) || questions.length === 0) {
    return <div className="quiz-card"><ToastContainer /><p>Loading quiz...</p></div>;
  }

  if (!q || currentQuestion >= questions.length) {
    return <div className="quiz-card"><ToastContainer /><p>Invalid question index.</p></div>;
  }

  return (
    <div className="quiz-card">
      <ToastContainer />
      <h2>{title}</h2>
      <p className="quiz-description">{description}</p>

      {!submitted && !isFrozen && (
        <div className="timer-bar">
          <div className="bar" style={{ width: `${(timeLeft / 60) * 100}%` }} />
          <p>Time Left: ⏰ {formatTime(timeLeft)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!submitted && (
          <div className="question-block">
            <p className="question-text"><strong>Q{currentQuestion + 1}:</strong> {q.questionText}</p>
            {q.options.map((opt, oIdx) => (
              <label key={opt._id || oIdx} className="option-label">
                <input
                  type="radio"
                  name={`q${currentQuestion}`}
                  value={oIdx}
                  checked={selectedIdx === oIdx}
                  onChange={() => handleAnswerChange(oIdx)}
                  disabled={isAnswered || isFrozen}
                />{' '}
                {opt.text}
              </label>
            ))}
            {(isAnswered || isFrozen) && (
              <div className="answer-feedback">
                <p>
                  {selectedIdx === correctIdx
                    ? '✅ Correct'
                    : selectedIdx !== undefined
                    ? '❌ Incorrect'
                    : '⏱️ Time’s up!'}
                </p>
                <p><strong>Explanation:</strong> {q.options[selectedIdx]?.explanation || 'No explanation provided.'}</p>
              </div>
            )}
          </div>
        )}

        {!submitted && (
          <div className="nav-buttons">
            {currentQuestion > 0 && (
              <button type="button" onClick={handlePrev} className="btn-secondary">⬅ Prev</button>
            )}
            {currentQuestion < questions.length - 1 && (
              <button type="button" onClick={handleNext} className="btn-primary">Next ➡</button>
            )}
            {currentQuestion === questions.length - 1 && (isAnswered || isFrozen) && (
              <button type="submit" className="btn-submit">Submit</button>
            )}
            <button type="button" onClick={handleReset} className="btn-danger">🔁 Reset</button>
          </div>
        )}

        {submitted && scoreRef.current !== null && (
          <div className="final-score">
            <h3>✅ Your final score: {scoreRef.current}/{questions.length}</h3>
            <hr />
            {questions.map((q, index) => {
              const selected = userAnswers[index];
              const correct = q.options.findIndex((o) => o.isCorrect);
              return (
                <div key={index} className="question-summary">
                  <p><strong>Q{index + 1}:</strong> {q.questionText}</p>
                  <p>
                    Your answer: {selected !== undefined ? (
                      <span style={{ color: selected === correct ? 'green' : 'red' }}>
                        {q.options[selected]?.text || 'No Answer'} ({selected === correct ? '✅ Correct' : '❌ Incorrect'})
                      </span>
                    ) : (
                      <span style={{ color: 'gray' }}>No Answer</span>
                    )}
                  </p>
                  <p>Correct answer: <strong>{q.options[correct]?.text}</strong></p>
                  <p><strong>Explanation:</strong> {q.options[selected]?.explanation || q.options[correct]?.explanation || 'No explanation.'}</p>
                  <hr />
                </div>
              );
            })}
          </div>
        )}
      </form>
    </div>
  );
}

export default Quiz_question;
