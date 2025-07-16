import { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios';

const margin = { right: 24 };
const uData = [0, 1, 2, 3, 4, 5, 6]; // Line 1
const pData = [0, 3, 1, 2, 4, 5, 2]; // Line 2
const xLabels = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL'
];

export default function AnalyticsUserAction() {
  const [quizCompletedData, setQuizCompletedData] = useState([]);
  const [qData, setQData] = useState([0, 200, 400, 600, 898, 1800, 2500]); // Initial qData
  const clientId = '685d3dc25385364ddde63c34'; // Example ID, this should come from somewhere dynamic
  let ymin=0,ymax=6;
  // Function to fetch the data from the API
  const fetchQuizCompletedData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clients/${clientId}`);
      const quizCompleted = response.data.quizCompleted;
      
      // Dynamically update qData based on quizCompleted
      const updatedQData = new Array(7).fill(quizCompleted);  // Repeating the quizCompleted count for all 7 months
      setQData(updatedQData);  // Update qData state
      
      // Optionally, if you want to use the same value for chart plotting (as you mentioned)
      setQuizCompletedData(updatedQData);  // Update state for quiz completion line chart
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    }
  };

  // Use effect to fetch data on component mount
  useEffect(() => {
    fetchQuizCompletedData();
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px' }}>
      <div>
        <h2>Quiz and Training Tracking</h2>
        <h3>(+43%) than last year</h3>
      </div>
      
      <LineChart
        height={300}
        series={[
          { data: pData, label: 'Mails Sent', color: localStorage.getItem("primaryColor") },
          { data: uData, label: 'Trainings Done', color: localStorage.getItem("secondaryColor") },
          { data: qData, label: 'Quizzes Completed', color: '#ffc0cb' },
        ]}
        xAxis={[{ scaleType: 'point', data: xLabels }]}
        yAxis={[{ width: 50, min: ymin, max: ymax }]} 
        margin={margin}
      />
    </div>
  );
}
  