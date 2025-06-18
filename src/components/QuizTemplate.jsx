import React from 'react';
import '../assets/style.css';
import Quiz_question from './Quiz_question';

function QuizTemplate() {
  return (
    <div>
      <div className="header">
        <h1 style={{ color: 'black' }}>Cybersecurity Awareness Quiz</h1>
        <img
          src="https://www.jindalstainless.com/wp-content/themes/jsl/assets/images/Logo-Dark.png"
          alt="JSL Logo"
        />
      </div>

      <div className="animated-bg"></div>
      <div className="quiz-container">
        <Quiz_question></Quiz_question>
      </div>
    </div>
  );
}

export default QuizTemplate;