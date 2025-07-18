// import React from 'react';
// import shieldBackground from '../../assets/shieldNew.png'; // ✅ Import local image

// const StatsRow = ({ stats = [], darkMode = false }) => {
//   const containerStyle = {
//     display: 'flex',
//     justifyContent: 'space-around',
//     padding: '20px',
//     flexWrap: 'wrap',
//     gap: '20px',
//   };

//   const cardStyle = {
//     padding: '20px',
//     borderRadius: '12px',
//     textAlign: 'center',
//     width: '220px',
//     backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
//     color: darkMode ? '#f5f5f5' : '#000000',
//     boxShadow: darkMode
//       ? '0 2px 6px rgba(255, 255, 255, 0.1)'
//       : '0 2px 6px rgba(0, 0, 0, 0.1)',
//     transition: 'background-color 0.3s ease, color 0.3s ease',
//   };

//   const valueWrapperStyle = {
//     backgroundImage: `url(${shieldBackground})`,
//     backgroundSize: 'contain',
//     backgroundRepeat: 'no-repeat',
//     backgroundPosition: 'center',
//     width: '100px',
//     height: '100px',
//     margin: '0 auto 10px',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//   };

//   const iconStyle = {
//     fontSize: '24px',
//     marginBottom: '4px',
//   };

//   const numberStyle = {
//     fontSize: '20px',
//     fontWeight: 'bold',
//   };

//   return (
//     <div style={containerStyle}>
//       {stats.map((stat) => (
//         <div key={stat.id} style={cardStyle}>
//           {/* Icon + Number inside shield */}
//           <div style={valueWrapperStyle}>
//             <div style={iconStyle}>{stat.icon}</div>
//             <div style={numberStyle}>{stat.value}</div>
//           </div>

//           {/* Description */}
//           <p>{stat.description}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default StatsRow;




import React from 'react';

const StatsRow = ({ stats = [], darkMode = false }) => {
  const primaryColor = localStorage.getItem('primaryColor') || '#007bff';

  // Inline SVG with dynamic fill, encoded for CSS background
  const encodedShieldSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
    </svg>
  `);

  const backgroundImage = `url("data:image/svg+xml,${encodedShieldSvg}")`;

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px',
    flexWrap: 'wrap',
    gap: '20px',
  };

  const cardStyle = {
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    width: '220px',
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    color: darkMode ? '#f5f5f5' : '#000000',
    boxShadow: darkMode
      ? '0 2px 6px rgba(255, 255, 255, 0.1)'
      : '0 2px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const valueWrapperStyle = {
    backgroundImage,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100px',
    height: '100px',
    margin: '0 auto 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const iconStyle = {
    fontSize: '24px',
    marginBottom: '4px',
  };

  const numberStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>
      {stats.map((stat) => (
        <div key={stat.id} style={cardStyle}>
          <div style={valueWrapperStyle}>
            <div style={iconStyle}>{stat.icon}</div>
            <div style={numberStyle}>{stat.value}</div>
          </div>
          <p>{stat.description}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;
