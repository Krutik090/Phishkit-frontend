import React from "react";

export default function CategoryBar({ title, score, grade }) {
  return (
    <div className="category-bar">
      <h3>{title}</h3>
      <div className="bar-score">{score}/100</div>
      <div className="bar-grade">Grade {grade}</div>
    </div>
  );
}