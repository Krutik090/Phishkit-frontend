import React, {
  useState, useContext, useEffect, useRef, createContext,
} from "react";
import {
  CheckCircle, Circle, ArrowRight, ArrowLeft,
} from "lucide-react";
import "./style.css";
import { useTheme } from "../../context/ThemeContext"; // ✅ Context for darkMode
import { toast } from "react-toastify"; // For notifications

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

function NavButtons({ onBack, onNext, nextDisabled = false, nextLabel = "Next" }) {
  return (
    <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
      <Btn className="btn-primary btn-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </Btn>
      <Btn
        className={`btn-primary btn-next${nextDisabled ? " btn-disabled" : ""}`}
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel} <ArrowRight size={18} />
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

function Sidebar({ stepIndex, setStepIndex, userName }) {
  const { progress } = useProgress();
  const allDone = Object.values(progress).every(Boolean);
  
  return (
    <aside className="sidebar">
      <h2 className="sidebar-h2">Hi {userName || 'User'}</h2>
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
        <SidebarItem id={3} label="Phishing Awareness Game" active={[5, 6].includes(stepIndex)} done={progress[3]} onClick={() => setStepIndex(5)} />
      </nav>
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

/* ---------- API Call Helper ---------- */
const updateTrainingTracker = async (uid, moduleCompleted) => {
    if (!uid) {
        console.warn("Cannot update tracker: UID is missing.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/training/update-tracker`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, moduleCompleted })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API Error');
        }
        const data = await response.json();
        console.log(`Module ${moduleCompleted} completion tracked for UID ${uid}.`, data);
        if (data.trainingCompleted) {
            toast.success("Training complete! Your certificate has been sent.");
        }
    } catch (error) {
        console.error(`Failed to update tracker for module ${moduleCompleted}:`, error);
        toast.error(`Could not save progress for module ${moduleCompleted}.`);
    }
};


/* ---------- Module1 ---------- */
const Module1Intro = ({ onNext, onBack }) => (
  <section className="section">
    <h2>What is Phishing ? How to be Safe ?</h2>
    <p>Phishing is a cybercrime in which attackers pose as legitimate institutions like banks, HR departments, or popular services via email or text to steal credentials and personal data.</p>
    <NavButtons onNext={onNext} onBack={onBack} />
  </section>
);

function Module1Video({ onNext, onBack, uid }) {
  const { progress, complete } = useProgress();
  const [watched, setWatched] = useState(Boolean(progress[1]));
  const videoRef = useRef(null);

  const handleEnded = async () => {
    setWatched(true);
    if (!progress[1]) { // Only call API if not already completed
        await updateTrainingTracker(uid, 1);
        complete(1);
    }
  };

  return (
    <section className="section">
      <h2>What is Phishing ? How to be Safe ?</h2>
      <video
        ref={videoRef}
        src="/videos/phishing.mp4"
        className="video"
        controls
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

function Module2Game({ onNext, onBack, uid }) {
  const { complete, progress } = useProgress();
  const storageKey = "module2_password_game";
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState([]);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  const initialCards = [
    { id: 1, text: "123456", strength: "weak" }, { id: 2, text: "password", strength: "weak" },
    { id: 3, text: "Welcome2025", strength: "medium" }, { id: 4, text: "Sunshine77", strength: "medium" },
    { id: 5, text: "T&y9!aB#p8", strength: "strong" }, { id: 6, text: "f4Y@Lz73!", strength: "strong" },
  ];

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
    const trackCompletion = async () => {
        if (done && !progress[2]) { // Only call API if not already completed
            await updateTrainingTracker(uid, 2);
            complete(2);
            localStorage.setItem(storageKey, JSON.stringify({ cards, done: true }));
        }
    };
    trackCompletion();
  }, [done, progress, complete, uid, cards]);

  const handleDrop = (e, zone) => {
    const id = Number(e.dataTransfer.getData("text/plain"));
    const card = cards.find((c) => c.id === id);
    const correct = card.strength === zone;
    const updated = cards.map((c) => c.id === id ? { ...c, zone: correct ? zone : undefined } : c);
    setCards(updated);
    if (!correct) {
      setMessage(`"${card.text}" is not a ${zone} password`);
      setTimeout(() => setMessage(""), 2000);
    } else {
      if (updated.every((c) => c.zone)) setDone(true);
    }
  };

  const handlePlayOrRestart = () => {
    localStorage.removeItem(storageKey);
    setCards(initialCards.map((c) => ({ ...c })));
    setStarted(true);
    setDone(false);
    setMessage("");
  };

  return (
    <section className="section">
      <h2>Password Hygiene – Drag each password to the right box</h2>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <Btn className="btn-accent" onClick={handlePlayOrRestart}>{started ? "Restart Game" : "Play"}</Btn>
      </div>
      {started && (
        <>
          <div className="pw-list">{cards.filter((c) => !c.zone).map((c) => (<div key={c.id} className="pw-card" draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}>{c.text}</div>))}</div>
          <div className="zones">
            {["weak", "medium", "strong"].map((zone) => (
              <div key={zone} className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, zone)}>
                <h3 style={{ textTransform: "capitalize" }}>{zone}</h3>
                {cards.filter((c) => c.zone === zone).map((c) => (<div key={c.id} className="pw-card placed">{c.text}</div>))}
              </div>
            ))}
          </div>
          <div className="error-wrapper">{message && <p className="note">{message}</p>}</div>
          {done && <p className="note" style={{ color: "#388e3c", fontWeight: "bold", textAlign: "center" }}>All passwords placed correctly! You can proceed.</p>}
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
    </ul>
    <NavButtons onNext={onNext} onBack={onBack} />
  </section>
);

function Module3Game({ onNext, onBack, uid }) {
  const { complete, progress } = useProgress();
  const correctIndices = [3, 4]; // Corrected indices from your code
  const initialStatus = Array(7).fill(null);
  const savedStatus = localStorage.getItem("phishingGameStatus");
  const savedCompleted = localStorage.getItem("phishingGameCompleted") === "true";
  const [status, setStatus] = useState(savedCompleted && savedStatus ? JSON.parse(savedStatus) : initialStatus);
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(savedCompleted);
  const timeoutRef = useRef(null);

  const phishingSpots = [
    { top: "20px", left: "70px" }, { top: "70px", left: "810px" },
    { top: "190px", left: "-55px" }, { top: "275px", left: "600px" }, // correct
    { top: "360px", left: "-40px" }, // correct
    { top: "370px", left: "400px" }, { top: "75px", left: "-175px" },
  ];
  
  const allCorrect = correctIndices.every((i) => status[i] === "correct");

  useEffect(() => {
    const trackCompletion = async () => {
        if (allCorrect && !progress[3]) { // Only call API if not already completed
            await updateTrainingTracker(uid, 3);
            complete(3);
            localStorage.setItem("phishingGameStatus", JSON.stringify(status));
            localStorage.setItem("phishingGameCompleted", "true");
        }
    };
    trackCompletion();
  }, [allCorrect, status, complete, progress, uid]);

  const handleClick = (index) => {
    if (!started || status[index]) return;
    const isCorrect = correctIndices.includes(index);
    const updatedStatus = [...status];
    updatedStatus[index] = isCorrect ? "correct" : "incorrect";
    setStatus(updatedStatus);
    if (!isCorrect) {
        setMessage("Oops! That's not a phishing sign. Try again.");
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setStatus(prev => prev.map((s, i) => i === index ? null : s)); // Reset only the incorrect one
            setMessage("");
        }, 1500);
    }
  };
  
  const moduleDone = allCorrect || progress[3];

  return (
    <section className="section">
      <h2>Spot the Phishing Signs</h2>
      <p>Find the 2 phishing signs hidden in the email to complete the module.</p>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <Btn className="btn-accent" onClick={() => { setStatus(initialStatus); setMessage(""); setStarted(true); }}>
          {started ? "Restart Game" : "Play"}
        </Btn>
      </div>
      {started && (
        <>
          <div className="image-container">
            <img src="/email.jpg" alt="Phishing Email" className="phishing-image" />
            {phishingSpots.map((spot, idx) => (<div key={idx} onClick={() => handleClick(idx)} className={`phishing-spot ${status[idx] || ""}`} style={{ top: spot.top, left: spot.left }} />))}
          </div>
          <div className="error-wrapper">
            {message && <p className="note">{message}</p>}
            {allCorrect && <p className="note" style={{ color: "green" }}>You found all phishing signs! You can finish the training.</p>}
          </div>
        </>
      )}
      <NavButtons onNext={onNext} onBack={onBack} nextDisabled={!moduleDone} nextLabel="Start Quiz" />
    </section>
  );
}

/* ---------- Completion Page (Now a fallback) ---------- */
const CompletionPage = ({ onRestart }) => (
  <section className="section welcome">
    <h1>Training Completed!</h1>
    <p>You've successfully completed all modules. Your certificate has been sent to your email.</p>
    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
      <Btn className="btn-primary" onClick={() => window.close()}>Close</Btn>
      <Btn className="btn-accent" onClick={onRestart}>Restart Training</Btn>
    </div>
  </section>
);


/* ---------- Layout ---------- */
function Layout({ uid, userName }) {
  const [stepIndex, setStepIndex] = useState(() => {
    const saved = localStorage.getItem("stepIndex");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("stepIndex", stepIndex);
  }, [stepIndex]);

  const handleTrainingComplete = () => {
    if (uid) {
      // Redirect to the quiz start endpoint
      window.location.href = `${API_BASE_URL}/tracking/start?uid=${uid}`;
    } else {
      toast.error("Cannot proceed to quiz: User ID is missing.");
    }
  };

  const steps = [
    <WelcomePage onNext={() => setStepIndex(1)} />,
    <Module1Intro onNext={() => setStepIndex(2)} onBack={() => setStepIndex(0)} />,
    <Module1Video uid={uid} onNext={() => setStepIndex(3)} onBack={() => setStepIndex(1)} />,
    <Module2Lesson onNext={() => setStepIndex(4)} onBack={() => setStepIndex(2)} />,
    <Module2Game uid={uid} onNext={() => setStepIndex(5)} onBack={() => setStepIndex(3)} />,
    <Module3Lesson onNext={() => setStepIndex(6)} onBack={() => setStepIndex(4)} />,
    <Module3Game uid={uid} onNext={handleTrainingComplete} onBack={() => setStepIndex(5)} />,
    <CompletionPage onRestart={() => setStepIndex(0)} />, // This page is now a fallback
  ];
  return (
    <div className="app-shell">
      <Sidebar stepIndex={stepIndex} setStepIndex={setStepIndex} userName={userName} />
      <main className="main-area">{steps[stepIndex]}</main>
    </div>
  );
}

/* ---------- App Root ---------- */
export default function Training() {
  const [user, setUser] = useState({ uid: null, name: null });

  useEffect(() => {
    // Get UID and Name from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    const name = params.get('name'); // Name is already decoded by the browser
    setUser({ uid, name });
  }, []);

  useEffect(() => {
    document.body.style.margin = "0";
    const root = document.documentElement;
    root.style.setProperty('--primary', localStorage.getItem('primaryColor') || '#ec008c');
    root.style.setProperty('--accent', '#0055cc');
    root.style.setProperty('--active', '#66b2ff');
    root.style.setProperty('--text', '#ffffff');
  }, []);   

  return (
    <ProgressProvider>
      <Layout uid={user.uid} userName={user.name} />
    </ProgressProvider>
  );
}
