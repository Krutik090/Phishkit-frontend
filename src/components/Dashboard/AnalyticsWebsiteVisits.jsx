import Chart from 'react-apexcharts';
import './AnalyticsWebsiteVisits.css'; // Import the CSS

const AnalyticsWebsiteVisits = ({ title, subheader, chart }) => {
  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
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
    },
    legend: {
      position: 'top',
    },
  };

  return (
    <div className="analytics-website-visits">
      <h3>{title}</h3>
      <p>{subheader}</p>
      <Chart options={chartOptions} series={chart.series} type="bar" />
    </div>
  );
};

export default AnalyticsWebsiteVisits;
