import React, {
  useState, useContext, useEffect, useRef, createContext,
} from "react";
import {
  CheckCircle, Circle, ArrowRight, ArrowLeft,
} from "lucide-react";
import "./style.css";

/* ---------- Progress Context ---------- */
const ProgressContext = createContext();

function ProgressProvider({ children }) {
  const [progress, setProgress] = useState({ 1: false, 2: false, 3: false });
  const complete = (idx) => setProgress((p) => ({ ...p, [idx]: true }));
  return (
    <ProgressContext.Provider value={{ progress, complete }}>
      {children}
    </ProgressContext.Provider>
  );
}

const useProgress = () => useContext(ProgressContext);

/* ---------- Generic UI ---------- */
const Divider = () => <div className="sidebar-divider" />;
const Btn = ({ className = "", ...p }) => (
  <button className={`btn ${className}`.trim()} {...p} />
);

/** Reusable Back / Next bar */
function NavButtons({ onBack, onNext, nextDisabled = false }) {
  return (
    <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
      {onBack && (
        <Btn className="btn-primary btn-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </Btn>
      )}
      {onNext && (
        <Btn
          className={`btn-primary btn-next${nextDisabled ? " btn-disabled" : ""}`}
          onClick={onNext}
          disabled={nextDisabled}
        >
          Next <ArrowRight size={18} />
        </Btn>
      )}
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

function Sidebar({ activeId, onSelect }) {
  const { progress } = useProgress();
  const items = [
    { id: "start", label: "Start Here" },
    { id: 1, label: "Phishing Awareness Training" },
    { id: 2, label: "Password Hygiene Game" },
    { id: 3, label: "Phishing Awareness Game" },
  ];
  const allDone = Object.values(progress).every(Boolean);

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
        {items.map((itm) => (
          <SidebarItem
            key={itm.id}
            {...itm}
            active={itm.id === activeId}
            done={progress[itm.id]}
            onClick={() => onSelect(itm.id)}
          />
        ))}
      </nav>
      <Divider />
      <p className="status">Status: {allDone ? "Completed" : "Not Completed"}</p>
    </aside>
  );
}

/* ---------- Pages ---------- */
const WelcomePage = ({ onNext }) => (
  <section className="section welcome">
    <h1>Phishing Awareness Training</h1>
    <p>
      Welcome! In this interactive journey you’ll learn how to spot phishing
      emails and keep your credentials safe.
    </p>
    <Btn className="btn-accent" onClick={onNext}>
      Start Training
    </Btn>
  </section>
);

const IntroText =
  "Phishing is a cybercrime in which attackers pose as legitimate " +
  "institutions—like banks, HR departments, or popular services—via email, " +
  "text message, or other communication channels to trick users into " +
  "revealing sensitive data such as passwords, credit card numbers, or " +
  "personal information.";

const Module1Intro = ({ onNext, onBack }) => (
  <section className="section">
    <h2>What is Phishing ? How to be Safe ?</h2>
    <p>{IntroText}</p>
    <NavButtons onBack={onBack} onNext={onNext} />
  </section>
);

function Module1Video({ onNext, onBack }) {
  const { complete } = useProgress();
  const [watched, setWatched] = useState(false);
  const videoRef = useRef(null);
  const lastRef = useRef(0);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.currentTime > lastRef.current + 1) v.currentTime = lastRef.current;
    else lastRef.current = v.currentTime;
  };

  const handleEnded = () => {
    setWatched(true);
    complete(1);
  };

  return (
    <section className="section">
      <h2>What is Phishing ? How to be Safe ?</h2>

      <video
        ref={videoRef}
        src="/videos/phishing.mp4"
        controls
        className="video"
        //onTimeUpdate={handleTimeUpdate}   /* ← anti‑skip */
        onEnded={handleEnded}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
      />

      <p className="note">NOTE: Watch Full Video to Mark as Complete.</p>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!watched} />
    </section>
  );
}

/* ---------- Module 1 controller ---------- */
function Module1({ onNextRoot, onBackRoot }) {
  const [stage, setStage] = useState("intro");
  return stage === "intro" ? (
    <Module1Intro onNext={() => setStage("video")} onBack={onBackRoot} />
  ) : (
    <Module1Video onNext={onNextRoot} onBack={() => setStage("intro")} />
  );
}

const Placeholder = ({ onBack }) => (
  <section className="section">
    <p style={{ margin: "auto" }}>Module 2 coming next…</p>
    <NavButtons onBack={onBack} />
  </section>
);

/* ---------- Layout ---------- */
function Layout() {
  const [screen, setScreen] = useState("start");
  const activeId = screen === "module1" ? 1 : screen === "module2" ? 2 : "start";

  return (
    <div className="app-shell">
      <Sidebar activeId={activeId} onSelect={setScreen} />
      <main className="main-area">
        {screen === "start" && (
          <WelcomePage onNext={() => setScreen("module1")} />
        )}
        {screen === "module1" && (
          <Module1
            onNextRoot={() => setScreen("module2")}
            onBackRoot={() => setScreen("start")}
          />
        )}
        {screen === "module2" && (
          <Placeholder onBack={() => setScreen("module1")} />
        )}
      </main>
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

