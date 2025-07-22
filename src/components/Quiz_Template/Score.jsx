import React from 'react';

function Score({ name, score, total }) {
  const percentage = ((score / total) * 100).toFixed(2);
  const message =
    percentage < 50
      ? '🔁 Keep learning! Try again!'
      : percentage < 80
        ? '👍 Well done! You can do even better!'
        : '🌟 Great job!';

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12 bg-white">
      <div className="mt-10 w-[600px] bg-gradient-to-br from-[#ffe0ef] to-[#f5f5ff] border-2 border-[#ec008c] rounded-xl shadow-2xl px-6 py-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#ec008c] mb-4">🎉 Quiz Completed!</h1>
        <p className="text-lg text-gray-700 mb-2">👤 <b>{name}</b></p>
        <p className="text-2xl text-green-600 font-semibold">
          ✅ {score}/{total} ({percentage}%)
        </p>
        <p className="text-gray-700 mt-4">{message}</p>
      </div>
    </div>
  );
}

export default Score;
