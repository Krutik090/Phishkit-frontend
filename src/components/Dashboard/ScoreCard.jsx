import React, { useEffect, useState } from "react";

export default function ScoreCard({ title, score, grade,final }) {
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
    <div className="score-card">
      <div className="gauge-container">
        <div className="gauge-border">
          <div className="gauge-inner" style={{ transform: `rotate(${(displayedScore / final) * 180 - 90}deg)` }}></div>
        </div>
        <div className="gauge-label">{displayedScore}/final</div>
        <div className="gauge-grade">Grade {grade}</div>
      </div>
      <h2>{title}</h2>
    </div>
  );
}