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
  const [progress, setProgress] = useState({ 1: false, 2: false, 3: false });
  const complete = (idx) => setProgress((p) => ({ ...p, [idx]: true }));
  return (
    <ProgressContext.Provider value={{ progress, complete }}>
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
        //{...antiSkipProps} // ✅ Apply anti-skip only if needed
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
  const { complete } = useProgress();
  const [cards, setCards] = useState([
    { id: 1, text: "123456", strength: "weak" },
    { id: 2, text: "password", strength: "weak" },
    { id: 3, text: "Welcome2025", strength: "medium" },
    { id: 4, text: "Sunshine77", strength: "medium" },
    { id: 5, text: "T&y9!aB#p8", strength: "strong" },
    { id: 6, text: "f4Y@Lz73!", strength: "strong" },
  ]);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const handleDrop = (e, zone) => {
    const id = Number(e.dataTransfer.getData("text/plain"));
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, zone: c.strength === zone ? zone : c.zone } : c))
    );
    const card = cards.find((c) => c.id === id);
    if (card.strength !== zone) {
      setMessage(`"${card.text}" is not a ${zone} password`);
      setTimeout(() => setMessage(""), 2500);
    } else {
      const allPlaced = cards.every((c) => c.zone || c.id === id);
      if (allPlaced) {
        setDone(true);
        complete(2);
      }
    }
  };

  return (
    <section className="section">
      <h2>Password Hygiene – Drag each password to the right box</h2>
      <div className="pw-list">
        {cards.filter((c) => !c.zone).map((c) => (
          <div key={c.id} className="pw-card" draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}>
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
            {cards.filter((c) => c.zone === zone).map((c) => (
              <div key={c.id} className="pw-card placed">{c.text}</div>
            ))}
          </div>
        ))}
      </div>
      {message && <p className="note">{message}</p>}
      <NavButtons onNext={onNext} onBack={onBack} nextDisabled={!done} />
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
  const { complete } = useProgress();
  const [clicked, setClicked] = useState(Array(7).fill(false));

  const handleClick = (index) => {
    const newClicked = [...clicked];
    newClicked[index] = true;
    setClicked(newClicked);

    // Mark complete if all 7 spots are clicked
    if (newClicked.every(Boolean)) complete(3);
  };

  const phishingSpots = [
    { top: "20px", left: "70px" },
    { top: "70px", left: "810px" },
    { top: "190px", left: "-55px" },
    { top: "275px", left: "600px" }, //correct
    { top: "360px", left: "-40px" }, //correct
    { top: "370px", left: "400px" },
    { top: "75px", left: "-175px" },
  ];

  return (
    <section className="section">
      <h2>Spot the Phishing Links</h2>
      <p>Click on the areas you think are suspicious or phishing-related.</p>
      <div className="image-container">
        <img src="/email.jpg" alt="Phishing Email" className="phishing-image" />
        {phishingSpots.map((spot, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className={`phishing-spot ${clicked[idx] ? "clicked" : ""}`}
            style={{
              top: spot.top,
              left: spot.left,
            }}
          />
        ))}
      </div>

      <NavButtons onNext={onNext} onBack={onBack} nextDisabled={!clicked.every(Boolean)} />
    </section>
  );
}

/* ---------- Layout ---------- */
function Layout() {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    <WelcomePage onNext={() => setStepIndex(1)} />,
    <Module1Intro onNext={() => setStepIndex(2)} onBack={() => setStepIndex(0)} />,
    <Module1Video onNext={() => setStepIndex(3)} onBack={() => setStepIndex(1)} />,
    <Module2Lesson onNext={() => setStepIndex(4)} onBack={() => setStepIndex(2)} />,
    <Module2Game onNext={() => setStepIndex(5)} onBack={() => setStepIndex(3)} />,
    <Module3Lesson onNext={() => setStepIndex(6)} onBack={() => setStepIndex(4)} />,
    <Module3Game onBack={() => setStepIndex(5)} />,
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
