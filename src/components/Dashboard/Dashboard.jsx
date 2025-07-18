import React, { useEffect, useContext } from "react";
import CategoryBar from "./CategoryBar";
import ShieldBlock from "./ShieldBlock";
import ScoreCard from './ScoreCard';
import AnalyticsWebsiteVisits from './AnalyticsWebsiteVisits';
import AnalyticsUserAction from "./AnalyticsUserAction";
import StatsRow from "./StateRow";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext"; // ✅ Context for darkMode

const calculateGrade = (score) => {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C+";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
};

export default function Dashboard() {

const { darkMode } = useTheme();
  const primaryColor = localStorage.getItem('primaryColor') || (darkMode ? "#90caf9" : "#1976d2");

  const statsData = [
    { id: 1, value: 2915, description: 'Users Clicked on Phishing Email', icon: '📊' },
    { id: 2, value: 1012, description: 'Submitted Data on Phishing Page', icon: '📈' },
    { id: 3, value: 6684, description: 'Total Phishing email Sent', icon: '📉' },
    { id: 4, value: 940, description: 'Completed all Trainings', icon: '🥧' }
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
          <ScoreCard title="Risky user" score={75} grade={calculateGrade(75)} final="100" darkMode={darkMode} />
        </div>
        <div className="dashboard__col--half">
          <ScoreCard title="Compromised user" score={75} grade={calculateGrade(75)} final="100" darkMode={darkMode} />
        </div>
      </div>

      {/* Row 4: Organization Score */}
      <div className="dashboard__row">
        <div className="dashboard__col--half">
          <ScoreCard title="Organization Score" score={75} grade={calculateGrade(75)} final="100" darkMode={darkMode} />
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
