import React from 'react';

const StatsRow = ({ stats = [] }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
      {stats.map(stat => (
        <div key={stat.id} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center', width: '200px' }}>
          <div style={{ fontSize: '32px' }}>{stat.icon}</div>
          <h2>{stat.value}</h2>
          <p>{stat.description}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;
