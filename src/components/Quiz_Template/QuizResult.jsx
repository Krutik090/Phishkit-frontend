import React from 'react';
import { useLocation } from 'react-router-dom';

function QuizResult() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-xl text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-6">🎉 Quiz Completed!</h1>
        <p className="text-xl mb-4 text-gray-700">User ID: <span className="font-semibold">{uid}</span></p>
        <p className="text-2xl font-semibold text-green-600">✅ Score: {score}/{total}</p>
        <p className="text-md text-gray-600 mt-4">Great job! You’ve successfully completed the quiz.</p>
      </div>
    </div>
  );
}

export default QuizResult;
