import React, { useEffect, useState } from "react";

export default function ScoreCard({ title, score, grade, final = 100 }) {
  const [displayedScore, setDisplayedScore] = useState(0);
  const [gaugeColor, setGaugeColor] = useState("#ff69b4"); // fallback to pink
  useEffect(() => {
    // Read color from localStorage
    const color = localStorage.getItem("primaryColor");
    if (color) {
      setGaugeColor(color);
    }
  }, []);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current <= score) {
        setDisplayedScore(current);
      } else {
        clearInterval(interval);
      }
    }, 20); // Adjust speed if needed
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="score-card">
      <div className="gauge-container">
        <div
          className="gauge-border"
          style={{ borderColor: gaugeColor }}
        >
          <div
            className="gauge-inner"
            style={{
              transform: `rotate(${(displayedScore / final) * 180 - 90}deg)`,
              backgroundColor: gaugeColor,
              transition: "transform 0.2s linear", // Smooth needle animation
            }}
          ></div>
        </div>
        <div className="gauge-label">{displayedScore}/{final}</div>
        <div className="gauge-grade">Grade {grade}</div>
      </div>
      <h2>{title}</h2>
    </div>
  );
}
