import React, { useEffect, useState } from "react";

export default function ScoreCard({ title, score, grade, final, darkMode = false }) {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedScore((prev) => {
        if (prev < score) return prev + 1;
        clearInterval(interval);
        return score;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
        color: darkMode ? '#f5f5f5' : '#000000',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <div className="gauge-container">
        <div className="gauge-border">
          <div className="gauge-inner" style={{ backgroundColor: localStorage.getItem('primaryColor'), transform: `rotate(${(displayedScore / final) * 180 - 90}deg)` }}></div>
        </div>
        <div style={{ marginTop: '8px', color: darkMode ? '#cccccc' : '#444444' }}>
          {displayedScore} / {final}
        </div>
        <div style={{ marginTop: '4px', fontWeight: 'bold', color: darkMode ? '#ffffff' : '#222222' }}>
          Grade {grade}
        </div>
      </div>
      <h2>{title}</h2>
    </div>
  );
}