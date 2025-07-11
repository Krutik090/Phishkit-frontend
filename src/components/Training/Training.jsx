import React, {
  useState, useContext, useEffect, useRef, createContext,
} from "react";
import {
  CheckCircle, Circle, ArrowRight, ArrowLeft,
} from "lucide-react";
import "./style.css";

/* ---------- Progress Context ---------- */
const ProgressContext = createContext();
export const useProgress = () => useContext(ProgressContext);

function ProgressProvider({ children }) {
  const [progress, setProgressState] = useState(() => {
    const stored = localStorage.getItem("cyberProgress");
    return stored ? JSON.parse(stored) : { 1: false, 2: false, 3: false };
  });

  const complete = (idx) => {
    setProgressState((prev) => {
      const updated = { ...prev, [idx]: true };
      localStorage.setItem("cyberProgress", JSON.stringify(updated));
      return updated;
    });
  };

  const resetProgress = () => {
    localStorage.removeItem("cyberProgress");
    setProgressState({ 1: false, 2: false, 3: false });
  };

  return (
    <ProgressContext.Provider value={{ progress, complete, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

/* ---------- Generic UI ---------- */
const Divider = () => <div className="sidebar-divider" />;
const Btn = ({ className = "", ...p }) => (
  <button className={`btn ${className}`.trim()} {...p} />
);

function NavButtons({ onBack, onNext, nextDisabled = false }) {
  return (
    <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
      <Btn className="btn-primary btn-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </Btn>
      <Btn
        className={`btn-primary btn-next${nextDisabled ? " btn-disabled" : ""}`}
        onClick={onNext}
        disabled={nextDisabled}
      >
        Next <ArrowRight size={18} />
      </Btn>
    </div>
  );
}


/* ---------- Sidebar ---------- */
function SidebarItem({ id, label, active, done, onClick }) {
  const [hover, setHover] = useState(false);
  const Icon = done ? CheckCircle : Circle;
  return (
    <div
      className={`sidebar-item ${active ? "active" : ""}`}
      style={{ background: hover && !active ? "var(--accent)" : undefined }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {typeof id === "number" && <Icon size={20} color="var(--text)" />}
      <span>{label}</span>
    </div>
  );
}

function Sidebar({ stepIndex, setStepIndex }) {
  const { progress } = useProgress();
  const allDone = Object.values(progress).every(Boolean);
  const jumpTo = {
    start: 0,
    1: 1, // Module1Intro
    2: 2, // Module1Video
    3: 3, // Module2Lesson
    4: 4, // Module2Game
    5: 5, // Module3Lesson
    6: 6, // Module3Game
  };
  return (
    <aside className="sidebar">
      <h2 className="sidebar-h2">Hi username</h2>
      <Divider />
      <p className="center-text" style={{ margin: "0.5rem 1rem 1rem" }}>
        As part of the Cybersecurity awareness program, kindly go through the
        gamified training to strengthen the awareness.
      </p>
      <Divider />
      <nav className="sidebar-nav">
        <SidebarItem id="start" label="Start Here" active={stepIndex === 0} onClick={() => setStepIndex(0)} />
        <SidebarItem id={1} label="Phishing Awareness Training" active={[1, 2].includes(stepIndex)} done={progress[1]} onClick={() => setStepIndex(1)} />
        <SidebarItem id={2} label="Password Hygiene Game" active={[3, 4].includes(stepIndex)} done={progress[2]} onClick={() => setStepIndex(3)} />
        <SidebarItem id={3} label="Phishing Awareness Game" active={[5, 6].includes(stepIndex)} done={progress[3]} onClick={() => setStepIndex(5)} />      </nav>
      <Divider />
      <p className="status">Status: {allDone ? "Completed" : "Not Completed"}</p>
    </aside>
  );
}

/* ---------- Screens ---------- */
const WelcomePage = ({ onNext }) => (
  <section className="section welcome">
    <h1>Phishing Awareness Training</h1>
    <p>Welcome! In this interactive journey you’ll learn how to spot phishing emails and keep your credentials safe.</p>
    <Btn className="btn-accent" onClick={onNext}>Start Training</Btn>
  </section>
);

/* ---------- Module1 ---------- */
const Module1Intro = ({ onNext, onBack }) => (
  <section className="section">
    <h2>What is Phishing ? How to be Safe ?</h2>
    <p>Phishing is a cybercrime in which attackers pose as legitimate institutions like banks, HR departments, or popular services via email or text to steal credentials and personal data.</p>
    <NavButtons onNext={onNext} onBack={onBack} />
  </section>
);

function Module1Video({ onNext, onBack }) {
  const { progress, complete } = useProgress();
  const [watched, setWatched] = useState(Boolean(progress[1]));
  const videoRef = useRef(null);
  const lastRef = useRef(0);

  const handleEnded = () => {
    setWatched(true);
    complete(1);
  };

  const antiSkipProps = !progress[1]
    ? {
      onTimeUpdate: (e) => {
        const v = videoRef.current;
        v && (v.currentTime > lastRef.current + 1
          ? v.currentTime = lastRef.current
          : lastRef.current = v.currentTime);
      }
    }
    : {};


  return (
    <section className="section">
      <h2>What is Phishing ? How to be Safe ?</h2>

      <video
        ref={videoRef}
        src="/videos/phishing.mp4"
        className="video"
        controls
        //{...antiSkipProps} // Apply anti-skip only if needed
        onEnded={handleEnded}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
      />

      <p className="note">NOTE: Watch Full Video to Mark as Complete.</p>
      <NavButtons onNext={onNext} onBack={onBack} nextDisabled={!watched} />
    </section>
  );
}

/* ---------- Module2 ---------- */
const Module2Lesson = ({ onNext, onBack }) => (
  <section className="section">
    <h2>Password Hygiene – Quick Tips</h2>
    <ul style={{ lineHeight: 1.6 }}>
      <li><b>Weak</b>: short, common, or sequential (e.g. <code>123456</code>)</li>
      <li><b>Medium</b>: word + number / capital (e.g. <code>Welcome2024</code>)</li>
      <li><b>Strong</b>: 12+ chars, mix of cases, digits &amp; symbols (<code>T&amp;y9!aB#p8</code>)</li>
    </ul>
    <NavButtons onNext={onNext} onBack={onBack} />
  </section>
);

function Module2Game({ onNext, onBack }) {
  const { complete, progress } = useProgress();
  const storageKey = "module2_password_game";
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState([]);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  const initialCards = [
    { id: 1, text: "123456", strength: "weak" },
    { id: 2, text: "password", strength: "weak" },
    { id: 3, text: "Welcome2025", strength: "medium" },
    { id: 4, text: "Sunshine77", strength: "medium" },
    { id: 5, text: "T&y9!aB#p8", strength: "strong" },
    { id: 6, text: "f4Y@Lz73!", strength: "strong" },
  ];

  // Load game state on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCards(parsed.cards);
      setDone(parsed.done);
      setStarted(true);
    } else {
      setCards(initialCards);
    }
  }, []);

  useEffect(() => {
    if (done) {
      complete(2);
      localStorage.setItem(storageKey, JSON.stringify({ cards, done: true }));
    }
  }, [done]);

  const handleDrop = (e, zone) => {
    const id = Number(e.dataTransfer.getData("text/plain"));
    const card = cards.find((c) => c.id === id);
    const correct = card.strength === zone;

    const updated = cards.map((c) =>
      c.id === id ? { ...c, zone: correct ? zone : undefined } : c
    );
    setCards(updated);

    if (!correct) {
      setMessage(`"${card.text}" is not a ${zone} password`);
      setTimeout(() => setMessage(""), 2000);
    } else {
      const allPlaced = updated.every((c) => c.zone);
      if (allPlaced) setDone(true);
    }
  };

  const handlePlayOrRestart = () => {
    // Reset game fully
    localStorage.removeItem(storageKey); // Clear saved data
    setCards(initialCards.map((c) => ({ ...c })));
    setStarted(true);
    setDone(false);
    setMessage("");
  };


  return (
    <section className="section">
      <h2>Password Hygiene – Drag each password to the right box</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <Btn className="btn-accent" onClick={handlePlayOrRestart}>
          {started ? "Restart Game" : "Play"}
        </Btn>
      </div>

      {started && (
        <>
          <div className="pw-list">
            {cards.filter((c) => !c.zone).map((c) => (
              <div
                key={c.id}
                className="pw-card"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
              >
                {c.text}
              </div>
            ))}
          </div>

          <div className="zones">
            {["weak", "medium", "strong"].map((zone) => (
              <div
                key={zone}
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, zone)}
              >
                <h3 style={{ textTransform: "capitalize" }}>{zone}</h3>
                {cards
                  .filter((c) => c.zone === zone)
                  .map((c) => (
                    <div key={c.id} className="pw-card placed">
                      {c.text}
                    </div>
                  ))}
              </div>
            ))}
          </div>

          <div className="error-wrapper">
            {message && <p className="note">{message}</p>}
          </div>

          {done && (
            <p className="note" style={{ color: "#388e3c", fontWeight: "bold", textAlign: "center" }}>
              All passwords placed correctly! You can proceed to the next module.
            </p>
          )}
        </>
      )}

      <NavButtons onNext={onNext} onBack={onBack} nextDisabled={!done && !progress[2]} />
    </section>
  );
}

/* ---------- Module3 ---------- */
const Module3Lesson = ({ onNext, onBack }) => (
  <section className="section">
    <h2>Phishing Email Red Flags</h2>
    <ul style={{ lineHeight: 1.6 }}>
      <li>Unexpected sender or email address mismatch</li>
      <li>Urgent call to action or threats (e.g., "account locked")</li>
      <li>Poor grammar or formatting issues</li>
      <li>Suspicious links (hover reveals mismatched URLs)</li>
      <li>Attachments you weren’t expecting</li>
    </ul>
    <NavButtons onNext={onNext} onBack={onBack} />
  </section>
);

function Module3Game({ onNext, onBack }) {
  const { complete, progress } = useProgress();

  const correctIndices = [4, 3];
  const initialStatus = Array(7).fill(null);

  const savedStatus = localStorage.getItem("phishingGameStatus");
  const savedCompleted = localStorage.getItem("phishingGameCompleted") === "true";

  const [status, setStatus] = useState(
    savedCompleted && savedStatus ? JSON.parse(savedStatus) : initialStatus
  );
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(() => savedCompleted); // auto-start if already completed
  const timeoutRef = useRef(null);

  const phishingSpots = [
    { top: "20px", left: "70px" },
    { top: "70px", left: "810px" },
    { top: "190px", left: "-55px" },
    { top: "275px", left: "600px" }, // correct
    { top: "360px", left: "-40px" }, // correct
    { top: "370px", left: "400px" },
    { top: "75px", left: "-175px" },
  ];

  useEffect(() => {
    const allCorrect = correctIndices.every((i) => status[i] === "correct");
    if (allCorrect) {
      localStorage.setItem("phishingGameStatus", JSON.stringify(status));
      localStorage.setItem("phishingGameCompleted", "true");
      if (!progress[3]) complete(3);
    }
  }, [status, complete, progress]);

  const handleClick = (index) => {
  if (!started || status[index]) return;

  const newStatus = Array(7).fill(null);

  if (!correctIndices.includes(index)) {
    newStatus[index] = "incorrect";
    setStatus(newStatus);
    setMessage("Oops! Try again.");

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus(initialStatus);
      setMessage("");
    }, 1000);

    return;
  }

  const updatedStatus = [...status];
  updatedStatus[index] = "correct";
  setStatus(updatedStatus);
};

  const allCorrect = correctIndices.every((i) => status[i] === "correct");
  const moduleDone = allCorrect || progress[3];

  return (
    <section className="section">
      <h2>Spot the Phishing Links</h2>
      <p>Your goal is to review and find 2 phishing signs hidden in the email.<br />
        After clicking on 2 correct phishing signs, the module will be marked as completed.
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <Btn className="btn-accent" onClick={() => {
          if (started) {
            // Restart logic
            setStatus(initialStatus);
            setMessage("");
          }
          setStarted(true);
        }}>
          {started ? "Restart Game" : "Play"}
        </Btn>
      </div>

      {started && (
        <>
          <div className="image-container">
            <img src="/email.jpg" alt="Phishing Email" className="phishing-image" />
            {phishingSpots.map((spot, idx) => (
              <div
                key={idx}
                onClick={() => handleClick(idx)}
                className={`phishing-spot ${
                  status[idx] === "correct"
                    ? "correct"
                    : status[idx] === "incorrect"
                      ? "incorrect"
                      : ""
                }`}
                style={{
                  top: spot.top,
                  left: spot.left,
                }}
              />
            ))}
          </div>

          <div className="error-wrapper">
            {message && <p className="note">{message}</p>}
            {allCorrect && (
              <p className="note" style={{ color: "green" }}>
                You found all phishing links correctly. You can finish the training.
              </p>
            )}
          </div>
        </>
      )}

      <NavButtons
        onNext={onNext}
        onBack={onBack}
        nextDisabled={!moduleDone}
      />
    </section>
  );
}

/* ---------- Completion Page ---------- */
const CompletionPage = ({ onBack, onRestart }) => (
  <section className="section welcome">
    <h1>Training Completed!</h1>
    <p>You've successfully completed all modules of the Cybersecurity Awareness Training.</p>
    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
      <Btn className="btn-primary" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </Btn>
      <Btn className="btn-accent" onClick={onRestart}>
        Restart Training
      </Btn>
    </div>
  </section>
);


/* ---------- Layout ---------- */
function Layout() {
  const [stepIndex, setStepIndex] = useState(() => {
    const saved = localStorage.getItem("stepIndex");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("stepIndex", stepIndex);
  }, [stepIndex]);


  const steps = [
    <WelcomePage onNext={() => setStepIndex(1)} />,
    <Module1Intro onNext={() => setStepIndex(2)} onBack={() => setStepIndex(0)} />,
    <Module1Video onNext={() => setStepIndex(3)} onBack={() => setStepIndex(1)} />,
    <Module2Lesson onNext={() => setStepIndex(4)} onBack={() => setStepIndex(2)} />,
    <Module2Game onNext={() => setStepIndex(5)} onBack={() => setStepIndex(3)} />,
    <Module3Lesson onNext={() => setStepIndex(6)} onBack={() => setStepIndex(4)} />,
    <Module3Game onNext={() => setStepIndex(7)} onBack={() => setStepIndex(5)} />,
    <CompletionPage
      onBack={() => setStepIndex(6)}
      onRestart={() => setStepIndex(0)}
    />,
  ];
  return (
    <div className="app-shell">
      <Sidebar stepIndex={stepIndex} setStepIndex={setStepIndex} />
      <main className="main-area">{steps[stepIndex]}</main>
    </div>
  );
}

/* ---------- App Root ---------- */
export default function Training() {
  useEffect(() => {
    document.body.style.margin = "0";
  }, []);
  return (
    <ProgressProvider>
      <Layout />
    </ProgressProvider>
  );
}
