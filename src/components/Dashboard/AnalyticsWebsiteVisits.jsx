import Chart from 'react-apexcharts';

const AnalyticsWebsiteVisits = ({ title, subheader, chart, darkMode = false }) => {
  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: chart.colors,
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        endingShape: 'rounded',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chart.categories,
      labels: {
        style: {
          colors: darkMode ? '#f5f5f5' : '#000000',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: darkMode ? '#f5f5f5' : '#000000',
        },
      },
    },
    legend: {
      position: 'top',
      labels: {
        colors: darkMode ? '#f5f5f5' : '#000000',
      },
    },
    grid: {
      borderColor: darkMode ? '#444' : '#e0e0e0',
    },
    tooltip: {
      theme: darkMode ? 'dark' : 'light',
    },
  };

  const containerStyle = {
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    color: darkMode ? '#f5f5f5' : '#000000',
    boxShadow: darkMode
      ? '0 2px 6px rgba(255, 255, 255, 0.05)'
      : '0 2px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const titleStyle = {
    marginBottom: '8px',
    fontSize: '18px',
  };

  const subheaderStyle = {
    marginBottom: '16px',
    color: darkMode ? '#bbbbbb' : '#666666',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <p style={subheaderStyle}>{subheader}</p>
      <Chart options={chartOptions} series={chart.series} type="bar" height={300} />
    </div>
  );
};

export default AnalyticsWebsiteVisits;
