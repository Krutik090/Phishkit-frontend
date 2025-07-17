import React from 'react';

const StatsRow = ({ stats = [], darkMode = false }) => {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px',
    flexWrap: 'wrap',
    gap: '20px',
  };

  const cardStyle = {
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    width: '200px',
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    color: darkMode ? '#f5f5f5' : '#000000',
    boxShadow: darkMode
      ? '0 2px 6px rgba(255, 255, 255, 0.1)'
      : '0 2px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const iconStyle = {
    fontSize: '32px',
    marginBottom: '10px',
  };

  return (
    <div style={containerStyle}>
      {stats.map((stat) => (
        <div key={stat.id} style={cardStyle}>
          <div style={iconStyle}>{stat.icon}</div>
          <h2 style={{ margin: '10px 0' }}>{stat.value}</h2>
          <p>{stat.description}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;
