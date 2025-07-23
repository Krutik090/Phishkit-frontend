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
  const isGuest = !uid;

  const hasShownToastRef = useRef(false);

  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(null);
  const [userName, setUserName] = useState('Guest');
  const [submitted, setSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timedOutQuestions, setTimedOutQuestions] = useState(new Set());
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [showQuizInfo, setShowQuizInfo] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeftMap, setTimeLeftMap] = useState({});

  useEffect(() => {
    hasShownToastRef.current = false;
  }, [currentQuestion]);

  const timerRef = useRef(null);
  const stopTimerRef = useRef(false);
  const autoAdvanceRef = useRef(false);

  const q = Array.isArray(questions) && questions.length > 0 ? questions[currentQuestion] : null;
  const selectedIdx = userAnswers[currentQuestion];
  const correctIdx = q?.options.findIndex((opt) => opt.isCorrect);
  const isAnswered = selectedIdx !== undefined;
  const isQuestionTimedOut = timedOutQuestions.has(currentQuestion);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Storage keys for persistence
  const STORAGE_KEY = `quiz_${uid || 'guest'}_${title?.replace(/\s+/g, '_')}`;
  const TIMER_KEY = `${STORAGE_KEY}_timer`;
  const QUESTION_KEY = `${STORAGE_KEY}_question`;

  // Save quiz state to localStorage
  const saveQuizState = () => {
    const state = {
      userAnswers,
      currentQuestion,
      timeLeftMap, // Save all timers
      timedOutQuestions: Array.from(timedOutQuestions),
      tabSwitchCount,
      quizStarted,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save quiz state:', e);
    }
  };

  // Load quiz state from localStorage
  const loadQuizState = () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState);
        if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          setUserAnswers(state.userAnswers || {});
          setCurrentQuestion(state.currentQuestion || 0);
          setTimeLeftMap(state.timeLeftMap || {});
          setTimeLeft((state.timeLeftMap || {})[state.currentQuestion] || 60);
          setTimedOutQuestions(new Set(state.timedOutQuestions || []));
          setTabSwitchCount(state.tabSwitchCount || 0);
          setQuizStarted(state.quizStarted || false);
          setShowQuizInfo(!state.quizStarted);
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to load quiz state:', e);
    }
    return false;
  };

  // Clear quiz state from localStorage
  const clearQuizState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TIMER_KEY);
      localStorage.removeItem(QUESTION_KEY);
    } catch (e) {
      console.error('Failed to clear quiz state:', e);
    }
  };

  // Handle page visibility changes (tab switching)
  const hasShownTabSwitchToastRef = useRef(false);
  const hasShownAutoSubmitToastRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabActive(isVisible);

      if (isVisible) {
        // Reset warning toast so it can show again next time
        hasShownTabSwitchToastRef.current = false;
        return;
      }

      if (!submitted && !quizCompleted && quizStarted) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;

          if (newCount >= 3) {
            if (!hasShownAutoSubmitToastRef.current) {
              toast.error('⚠️ Too many tab switches! Quiz will be auto-submitted.', {
                position: 'top-center',
                autoClose: 3000
              });
              hasShownAutoSubmitToastRef.current = true;

              setTimeout(() => {
                document.getElementById('quiz-form')?.requestSubmit();
              }, 3000);
            }
          } else {
            if (!hasShownTabSwitchToastRef.current) {
              toast.warn(`⚠️ Tab switching detected! Warning ${newCount}/3`, {
                position: 'top-center'
              });
              hasShownTabSwitchToastRef.current = true;
            }
          }

          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [submitted, quizCompleted, quizStarted]);


  // Handle page refresh/reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted && !quizCompleted && quizStarted) {
        saveQuizState();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userAnswers, currentQuestion, timeLeft, timedOutQuestions, tabSwitchCount, submitted, quizCompleted, quizStarted]);

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.warning('⚠️ Right-click is disabled during quiz', { position: 'top-right' });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Disable F12, Ctrl+Shift+I, etc.
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Disable developer tools shortcuts
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')
      ) {
        e.preventDefault();
        toast.warning('⚠️ Developer tools are disabled during quiz', { position: 'top-right' });
      }

      // Disable refresh shortcuts
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
        toast.warning('⚠️ Page refresh is disabled. Your progress is automatically saved.', { position: 'top-center' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch user details if not a guest
  useEffect(() => {
    // Load saved state first
    const stateLoaded = loadQuizState();

    if (!isGuest) {
      fetch(`${API_BASE_URL}/users/${uid}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
          setUserName(fullName || "Anonymous");
          setQuizCompleted(data.quizCompleted || false);
          if (data.quizCompleted) {
            setScore(data.score || 0);
            setSubmitted(true);
            clearQuizState(); // Clear saved state if quiz already completed
          }
        })
        .catch(err => {
          console.error("Failed to fetch user:", err);
          setUserName("Anonymous");
        })
        .finally(() => setIsLoading(false));
    } else {
      setUserName("Guest");
      setIsLoading(false);
    }

  }, [uid]);

  // Save state whenever it changes
  useEffect(() => {
    if (!isLoading && !submitted && !quizCompleted && quizStarted) {
      saveQuizState();
    }
  }, [userAnswers, currentQuestion, timeLeft, timedOutQuestions, tabSwitchCount, isLoading, submitted, quizCompleted, quizStarted]);

  // Timer per question - Fixed: Only reset timer when moving to new question
  useEffect(() => {
    if (!submitted && q && !quizCompleted && quizStarted) {
      const questionTime = timeLeftMap[currentQuestion] ?? 60;
      setTimeLeft(questionTime);

      stopTimerRef.current = false;
      clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (stopTimerRef.current || timedOutQuestions.has(currentQuestion)) return prev;
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimedOutQuestions(prevSet => {
              const newSet = new Set(prevSet);
              newSet.add(currentQuestion);
              return newSet;
            });
            autoAdvanceRef.current = true;
            setTimeLeftMap(prevMap => ({
              ...prevMap,
              [currentQuestion]: 0
            }));

            if (!hasShownToastRef.current) {
              hasShownToastRef.current = true;
              toast.error('⏰ Time up! Question frozen.', { position: 'top-right' });
            }

            return 0;
          }
          const newTime = prev - 1;
          setTimeLeftMap(prevMap => ({
            ...prevMap,
            [currentQuestion]: newTime
          }));
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [currentQuestion, q, submitted, quizCompleted, quizStarted]);


  // Reset timer when moving to next question
  useEffect(() => {
    if (!quizStarted || timedOutQuestions.has(currentQuestion)) return;

    const savedTime = timeLeftMap[currentQuestion];

    if (typeof savedTime === 'number') {
      setTimeLeft(savedTime); // Use saved time
    } else {
      setTimeLeft(60); // Only set to 60 if visiting for the first time
      setTimeLeftMap(prev => ({
        ...prev,
        [currentQuestion]: 60
      }));
    }

    stopTimerRef.current = false;
  }, [currentQuestion, quizStarted, timedOutQuestions, timeLeftMap]);


  // Auto-advance logic
  useEffect(() => {
    if (autoAdvanceRef.current && !submitted && quizStarted) {
      autoAdvanceRef.current = false;
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion((prev) => prev + 1);
        } else {
          document.getElementById('quiz-form')?.requestSubmit();
        }
      }, 2000); // Wait 2 seconds before auto-advancing
    }
  }, [timeLeft, submitted, quizStarted]);

  const handleAnswerChange = (optionIdx) => {
    if (isAnswered || isQuestionTimedOut) {
      const message = isQuestionTimedOut
        ? '⏰ This question is frozen due to timeout!'
        : '⚠️ You can only answer once!';
      toast.warning(message, { position: 'top-center' });
      return;
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIdx,
    }));

    stopTimerRef.current = true;
  };

  const handleNext = () => {
    if (!isAnswered && !isQuestionTimedOut) {
      toast.warning('⏳ Please answer or wait for timeout.', { position: 'top-center' });
      return;
    }

    // ✅ Save time before leaving current question
    setTimeLeftMap((prevMap) => ({
      ...prevMap,
      [currentQuestion]: timeLeft
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    // ✅ Save time before leaving current question
    setTimeLeftMap((prevMap) => ({
      ...prevMap,
      [currentQuestion]: timeLeft
    }));

    toast.info('⏪ Moved to previous question', { position: 'top-center' });

    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleStartQuiz = () => {
    setShowQuizInfo(false);
    setQuizStarted(true);
    setTimeLeft(60);
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
    if (submitted || quizCompleted) return;

    const finalScore = calculateScore();
    setSubmitted(true);
    setScore(finalScore);
    clearQuizState(); // Clear saved state on submission

    if (isGuest) return;

    try {
      const res = await fetch(`${API_BASE_URL}/tracking/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          score: finalScore,
          tabSwitchCount,
          completedAt: new Date().toISOString()
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Tracking failed: ${errText}`);
      }

      setQuizCompleted(true);
    } catch (err) {
      toast.error(`❌ Submission error: ${err.message}`);
    }
  };

  // UI: Loading or invalid questions
  if (!Array.isArray(questions)) {
    return <div className="quiz-card"><ToastContainer /><p>❌ Invalid quiz data.</p></div>;
  }

  if (isLoading || questions.length === 0) {
    return <div className="quiz-card"><ToastContainer /><p>⏳ Loading quiz...</p></div>;
  }

  if (!q || currentQuestion >= questions.length) {
    return <div className="quiz-card"><ToastContainer /><p>❌ Invalid question index.</p></div>;
  }

  if (submitted || quizCompleted) {
    return <Score name={userName} score={score ?? 0} total={questions.length} />;
  }

  // Quiz Info Card - Show before starting the quiz
  if (showQuizInfo && !quizStarted) {
    return (
      <div className="quiz-card">
        <ToastContainer />
        <div className="quiz-info-header">
          <h2>📋 {title}</h2>
          <p className="quiz-description">{description}</p>
        </div>

        <div className="quiz-instructions">
          <h3>📝 Quiz Instructions</h3>
          <div className="instruction-grid">
            <div className="instruction-item">
              <span className="instruction-icon">⏰</span>
              <div>
                <strong>Time Limit</strong>
                <p>60 seconds per question</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">📊</span>
              <div>
                <strong>Total Questions</strong>
                <p>{questions.length} questions</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">🎯</span>
              <div>
                <strong>Answer Once</strong>
                <p>You can only select one answer per question</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">⚠️</span>
              <div>
                <strong>No Tab Switching</strong>
                <p>Maximum 3 warnings, then auto-submit</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">💾</span>
              <div>
                <strong>Auto-Save</strong>
                <p>Progress saved automatically</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">❄️</span>
              <div>
                <strong>Time Up = Freeze</strong>
                <p>Questions freeze when time expires</p>
              </div>
            </div>
          </div>
        </div>

        <div className="quiz-rules">
          <h3>🔒 Security Rules</h3>
          <ul>
            <li>Right-click is disabled during the quiz</li>
            <li>Developer tools and shortcuts are blocked</li>
            <li>Page refresh will restore your progress</li>
            <li>Leaving and returning is allowed but monitored</li>
            <li>All quiz activity is tracked and logged</li>
          </ul>
        </div>

        <div className="quiz-stats">
          <div className="stat-card">
            <span className="stat-number">{questions.length}</span>
            <span className="stat-label">Questions</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{Math.ceil((questions.length * 60) / 60)}</span>
            <span className="stat-label">Max Minutes</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">100</span>
            <span className="stat-label">Max Score</span>
          </div>
        </div>

        <div className="start-quiz-section">
          <p className="ready-text">🎓 Ready to begin? Click the button below to start your quiz!</p>
          <button
            onClick={handleStartQuiz}
            className="btn-start-quiz"
          >
            🚀 Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-card">
      <ToastContainer />
      <h2>{title}</h2>
      <p className="quiz-description">{description}</p>

      {/* Warning indicators - only show during active quiz */}
      {tabSwitchCount > 0 && quizStarted && (
        <div className="warning-banner" style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '10px',
          borderRadius: '5px',
          margin: '10px 0',
          color: '#856404'
        }}>
          ⚠️ Tab Switch Warnings: {tabSwitchCount}/3 {tabSwitchCount >= 3 && '(Quiz will be auto-submitted)'}
        </div>
      )}

      {!isTabActive && quizStarted && (
        <div className="tab-warning" style={{
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          padding: '10px',
          borderRadius: '5px',
          margin: '10px 0',
          color: '#721c24'
        }}>
          ⚠️ Please return to the quiz tab. Tab switching is being monitored.
        </div>
      )}

      {/* Timer bar - hidden when question is timed out */}
      {!isAnswered && !isQuestionTimedOut && (
        <div className="timer-bar-container">
          <div className="timer-bar">
            <div className="bar" style={{ width: `${(timeLeft / 60) * 100}%` }} />
          </div>
          <p className="timer-text">⏰ {formatTime(timeLeft)}</p>
        </div>
      )}


      {/* Frozen question indicator */}
      {isQuestionTimedOut && (
        <div className="frozen-indicator" style={{
          background: '#e2e3e5',
          border: '1px solid #d6d8db',
          padding: '10px',
          borderRadius: '5px',
          margin: '10px 0',
          color: '#383d41',
          textAlign: 'center'
        }}>
          ❄️ This question is frozen due to timeout
        </div>
      )}

      <form id="quiz-form" onSubmit={handleSubmit}>
        <div className="question-block">
          <p className="question-text"><strong>Q{currentQuestion + 1}:</strong> {q.questionText}</p>
          {q.options.map((opt, oIdx) => (
            <label
              key={opt._id || oIdx}
              className={`option-label ${isQuestionTimedOut ? 'disabled' : ''}`}
              style={{
                opacity: isQuestionTimedOut ? 0.6 : 1,
                cursor: isQuestionTimedOut ? 'not-allowed' : 'pointer'
              }}
            >
              <input
                type="radio"
                name={`q${currentQuestion}`}
                value={oIdx}
                checked={selectedIdx === oIdx}
                onChange={() => handleAnswerChange(oIdx)}
                disabled={isAnswered || isQuestionTimedOut}
              />{' '}
              {opt.text}
            </label>
          ))}
          {(isAnswered || isQuestionTimedOut) && (
            <div className="answer-feedback">
              <p>
                {isQuestionTimedOut
                  ? '⏰ Time expired - No answer recorded'
                  : selectedIdx === correctIdx ? '✅ Correct' : '❌ Incorrect'
                }
              </p>
              {isAnswered && (
                <p><strong>Explanation:</strong> {q.options[selectedIdx]?.explanation || 'No explanation provided.'}</p>
              )}
            </div>
          )}
        </div>

        <div className="nav-buttons">
          {currentQuestion > 0 && (
            <button type="button" onClick={handlePrev} className="btn-secondary">⬅ Prev</button>
          )}
          {currentQuestion < questions.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              style={{ marginLeft: 'auto' }}
              disabled={!isAnswered && !isQuestionTimedOut}
            >
              Next ➡
            </button>
          )}
          {currentQuestion === questions.length - 1 && (isAnswered || isQuestionTimedOut) && (
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