import React, { useEffect, useRef, useState } from "react";
import "./ShieldGauge.css";

export default function ShieldGauge({ score = 55, grade = "Good" }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const requestRef = useRef();

  useEffect(() => {
    let start = null;
    const duration = 1200;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      setAnimatedScore(Math.round(percentage * score));
      if (percentage < 1) requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [score]);

  const degree = (animatedScore / 100) * 180;

  return (
    <div className="shield-gauge-container">
      <div className="shield-wrapper">
        <div className="shield-border">
          <img src={/assets/shieldNew.png} alt="Shield" className="shield-img" />
        </div>
        <div className="needle-container" style={{ transform: `rotate(${degree - 90}deg)` }}>
          <div className="needle" />
        </div>
      </div>
      <p className="shield-grade">{grade}</p>
      <p className="shield-score">{animatedScore}/100</p>
    </div>
  );
}
