import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Score from './Score';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Quiz_question({ questions = [], title, description }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get('uid');

  const [userAnswers, setUserAnswers] = useState(() => {
    const saved = sessionStorage.getItem(`answers_${uid}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [frozenQuestions, setFrozenQuestions] = useState(() => {
    const saved = sessionStorage.getItem(`frozen_${uid}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [stoppedTimers, setStoppedTimers] = useState(() => {
    const saved = sessionStorage.getItem(`stopped_${uid}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [submitted, setSubmitted] = useState(() => {
    return localStorage.getItem(`submitted_${uid}`) === 'true';
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(null);
  const [userName, setUserName] = useState("Anonymous");
  const [timerVisible, setTimerVisible] = useState(true);

  const timerRef = useRef(null);
  const submittedRef = useRef(submitted);
  const autoAdvanceRef = useRef(false);
  const stopTimerRef = useRef(false);

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

  // ✅ Fetch user full name using UID
  useEffect(() => {
    if (uid) {
      fetch(`${API_BASE_URL}/users/user/${uid}`)
        .then(res => res.json())
        .then(data => {
          const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
          setUserName(fullName || "Anonymous");
        })
        .catch(err => {
          console.error("Failed to fetch user:", err);
          setUserName("Anonymous");
        });
    }
  }, [uid]);

  useEffect(() => {
    const saved = sessionStorage.getItem(`current_${uid}`);
    const parsed = saved ? parseInt(saved, 10) : 0;
    setCurrentQuestion(parsed >= 0 && parsed < questions.length ? parsed : 0);
  }, [questions, uid]);

  useEffect(() => {
    clearInterval(timerRef.current);

    if (!submitted && q && !isFrozen && !stoppedTimers[currentQuestion]) {
      const timerKey = `timer_${uid}_${currentQuestion}`;
      const storedStart = sessionStorage.getItem(timerKey);
      const startTime = storedStart ? parseInt(storedStart, 10) : Date.now();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = 60 - elapsed;

      setTimeLeft(Math.max(remaining, 0));
      setTimerVisible(true);
      if (!storedStart) sessionStorage.setItem(timerKey, startTime);

      stopTimerRef.current = false;

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (stopTimerRef.current) return prev;
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setFrozenQuestions((prevFrozen) => {
              const updated = { ...prevFrozen, [currentQuestion]: true };
              sessionStorage.setItem(`frozen_${uid}`, JSON.stringify(updated));
              return updated;
            });

            setStoppedTimers((prevStopped) => {
              const updated = { ...prevStopped, [currentQuestion]: true };
              sessionStorage.setItem(`stopped_${uid}`, JSON.stringify(updated));
              return updated;
            });

            autoAdvanceRef.current = true;
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [currentQuestion, submitted, q, isFrozen, stoppedTimers, uid]);

  useEffect(() => {
    if (autoAdvanceRef.current && !submitted) {
      autoAdvanceRef.current = false;
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        document.getElementById('quiz-form')?.requestSubmit();
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
      Object.keys(sessionStorage).forEach((key) => {
        if (
          key.startsWith(`answers_${uid}`) ||
          key.startsWith(`frozen_${uid}`) ||
          key.startsWith(`stopped_${uid}`) ||
          key.startsWith(`timer_${uid}`) ||
          key.startsWith(`current_${uid}`)
        ) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }, [submitted, uid]);

  const handleAnswerChange = (optionIdx) => {
    if (isAnswered || isFrozen) {
      toast.warning('⚠️ You can only answer once!', { position: 'top-center' });
      return;
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIdx,
    }));

    stopTimerRef.current = true;

    setStoppedTimers((prev) => {
      const updated = { ...prev, [currentQuestion]: true };
      sessionStorage.setItem(`stopped_${uid}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleNext = () => {
    if (!isAnswered && !isFrozen) {
      toast.warning('⏳ Please answer or wait for timeout.', { position: 'top-center' });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setTimerVisible(false);
    clearInterval(timerRef.current);
    toast.info('⏪ Moved to previous question', { position: 'top-center' });

    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let sc = 0;
    questions.forEach((q, idx) => {
      const correct = q.options.findIndex((opt) => opt.isCorrect);
      if (userAnswers[idx] === correct) sc++;
    });
    setScore(sc);
    return sc;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittedRef.current) return;
    submittedRef.current = true;

    const finalScore = score ?? calculateScore();

    try {
      const res = await fetch(`${API_BASE_URL}/tracking/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, score: finalScore }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Tracking failed: ${errText}`);
      }

      localStorage.setItem(`submitted_${uid}`, 'true');
      setSubmitted(true);
    } catch (err) {
      toast.error(`❌ Submission error: ${err.message}`);
    }
  };

  if (!Array.isArray(questions) || questions.length === 0) {
    return <div className="quiz-card"><ToastContainer /><p>Loading quiz...</p></div>;
  }

  if (!q || currentQuestion >= questions.length) {
    return <div className="quiz-card"><ToastContainer /><p>Invalid question index.</p></div>;
  }

  if (submitted) {
    return <Score name={userName} score={score ?? calculateScore()} total={questions.length} />;
  }

  return (
    <div className="quiz-card">
      <ToastContainer />
      <h2>{title}</h2>
      <p className="quiz-description">{description}</p>

      {timerVisible && (
        <div className="timer-bar-container">
          <div className="timer-bar">
            <div className="bar" style={{ width: `${(timeLeft / 60) * 100}%` }} />
          </div>
          <p className="timer-text">⏰ {formatTime(timeLeft)}</p>
        </div>
      )}

      <form id="quiz-form" onSubmit={handleSubmit}>
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

        <div className="nav-buttons">
          {currentQuestion > 0 && (
            <button type="button" onClick={handlePrev} className="btn-secondary">⬅ Prev</button>
          )}
          {currentQuestion < questions.length - 1 && (
            <button type="button" onClick={handleNext} className="btn-primary" style={{ marginLeft: 'auto' }}>
              Next ➡
            </button>
          )}
          {currentQuestion === questions.length - 1 && (isAnswered || isFrozen) && (
            <button type="submit" className="btn-submit" style={{ marginLeft: 'auto' }}>
              ✅ Submit Quiz
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Quiz_question;
