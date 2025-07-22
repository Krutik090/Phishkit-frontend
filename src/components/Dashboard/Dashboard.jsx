import React, { useEffect, useContext, useState } from "react";
import CategoryBar from "./CategoryBar";
import ShieldBlock from "./ShieldBlock";
import ScoreCard from './ScoreCard';
import AnalyticsWebsiteVisits from './AnalyticsWebsiteVisits';
import AnalyticsUserAction from "./AnalyticsUserAction";
import StatsRow from "./StateRow";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext"; // ✅ Context for darkMode

const API_BASE_URL = import.meta.env.VITE_API_URL;
const calculateGrade = (score, total) => {
  if (total === 0 || score === null || score === undefined) return "N/A";
  const percent = (score / total) * 100;
  if (percent <= 10) return "A+";
  if (percent <= 20) return "A";
  if (percent <= 30) return "B";
  if (percent <= 40) return "C+";
  if (percent <= 50) return "C";
  if (percent <= 60) return "D";
  return "F";
};

export default function Dashboard() {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/graph/graph-data`, {
      params: {
        projectName: 'All'
      },
      withCredentials: true
    })
      .then(response => {
        setGraphData(response.data);
      })
      .catch(error => {
        console.error('API Error:', error);
      });
  }, []);

  // Log updated graphData after it's been set
  useEffect(() => {
    if (graphData !== null) {
      console.log('Updated graphData:', graphData);
    }
  }, [graphData]);

  const { darkMode } = useTheme();
  const primaryColor = localStorage.getItem('primaryColor') || (darkMode ? "#90caf9" : "#1976d2");

  const statsData = [
    { id: 1, value: graphData ? graphData.emailOpened : "Loading...", description: 'Users Clicked on Phishing Email',  icon: '📊'  },
    { id: 2, value: graphData ? graphData.submitted_data : "Loading...", description: 'Submitted Data on Phishing Page', icon: '📈' },
    { id: 3, value: graphData ? graphData.emailSent : "Loading...", description: 'Total Phishing email Sent', icon: '📉' },
    { id: 4, value: graphData ? graphData.trainingCompleted : "Loading...", description: 'Completed all Trainings', icon: '🥧'  }
    // { id: 1, value: 1, description: 'Users Clicked on Phishing Email', icon: '' },
    // { id: 2, value: 1, description: 'Submitted Data on Phishing Page', icon: '' },
    // { id: 3, value: 1, description: 'Total Phishing email Sent', icon: '' },
    // { id: 4, value: 1, description: 'Completed all Trainings', icon: '不' }
  ];

  return (
    <div className={`dashboard ${darkMode ? "dashboard--dark" : "dashboard--light"}`}>
      {/* Row 1: Stats */}
      <div className="dashboard__row">
        <div className="dashboard__col--quarter">
          <StatsRow stats={statsData} darkMode={darkMode} />
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="dashboard__row">
        <div className="dashboard__col--half">
          <AnalyticsWebsiteVisits
            title="Total Phished User"
            subheader="Department wise"
            chart={{
              colors: [primaryColor],
              categories: ['Account', 'HR', 'VAPT', 'ASM', 'CIDR', 'IT', 'OT', 'Development', 'Sales'],
              series: [
                { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] }
              ],
            }}
            darkMode={darkMode}
          />
        </div>
        <div className="dashboard__col--half">
          <AnalyticsUserAction darkMode={darkMode} />
        </div>
      </div>

      {/* Row 3: Score Cards */}
      <div className="dashboard__row">
        <div className="dashboard__col--half">
          {graphData ? (
            <ScoreCard
              title="Risky user"
              score={graphData.emailOpened}
              grade={calculateGrade(graphData.emailOpened, graphData.emailSent)}
              final={graphData.emailOpened}
              darkMode={darkMode}
            />
          ) : (
            <ScoreCard
              title="Risky user"
              score="Loading..."
              grade="Loading..."
              final="Loading..."
              darkMode={darkMode}
            />
          )}
        </div>
        <div className="dashboard__col--half">
          {graphData ? (
            <ScoreCard
              title="Compromised user"
              score={graphData.submitted_data}
              grade={calculateGrade(graphData.submitted_data,graphData.emailSent)}
              final={graphData.submitted_data}
              darkMode={darkMode}
            />
          ) : (
            <ScoreCard
              title="Compromised user"
              score="Loading..."
              grade="Loading..."
              final="Loading..."
              darkMode={darkMode}
            />
          )}
        </div>
      </div>

      {/* Row 4: Organization Score */}
      <div className="dashboard__row">
        <div className="dashboard__col--half">
          {graphData ? (
            <ScoreCard
              title="Organization Score"
              score={graphData.ogScore}
              grade={calculateGrade(graphData.ogScore,graphData.emailSent)}
              final={graphData.ogScore}
              darkMode={darkMode}
            />
          ) : (
            <ScoreCard
              title="Organization Score"
              score="Loading..."
              grade="Loading..."
              final="Loading..."
              darkMode={darkMode}
            />
          )}
        </div>
      </div>

      {/* Optional: Shield Blocks */}
      {/* <div className="dashboard__row">
        <div className="dashboard__col--third">
          <ShieldBlock title="Web Findings" critical={4} high={9} medium={13} low={23} darkMode={darkMode} />
        </div>
        <div className="dashboard__col--third">
          <ShieldBlock title="Mobile Security" critical={3} high={6} medium={7} low={15} darkMode={darkMode} />
        </div>
      </div> */}
    </div>
  );
}
