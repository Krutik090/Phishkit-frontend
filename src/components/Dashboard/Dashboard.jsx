import React, { useEffect, useState } from "react";
import CategoryBar from "./CategoryBar";
import ShieldBlock from "./ShieldBlock";
import ScoreCard from './ScoreCard';
import AnalyticsWebsiteVisits from './AnalyticsWebsiteVisits';
import AnalyticsUserAction from "./AnalyticsUserAction";
import StatsRow from "./StateRow";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

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
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState("All");
  const { darkMode } = useTheme();

  const primaryColor = localStorage.getItem('primaryColor') || (darkMode ? "#90caf9" : "#1976d2");

  // Fetch project list
  useEffect(() => {
    axios.get(`${API_BASE_URL}/projects`, { withCredentials: true })
      .then((res) => {
        const projects = res.data;
        setProjectList(projects);
        projects.forEach((project) => {
          const projectId = project._id;
          axios.post(`${API_BASE_URL}/projects/sync-stats/${projectId}`, null, {
            withCredentials: true
          })
            .then(syncRes => {
              console.log(`Synced stats for project ${project.name}`);
            })
            .catch(syncErr => {
              console.error(`Failed to sync stats for project ${project.name}:`, syncErr);
            });
        });
        // Initialize selected project from localStorage or default to first one
        const storedProject = localStorage.getItem("selectedProject");
        if (storedProject) {
          setSelectedProject(storedProject);
        } else if (projects.length > 0) {
          setSelectedProject(projects[0].name);
          localStorage.setItem("selectedProject", projects[0].name);
        }
      })
      .catch((err) => {
        console.error("Error fetching project list:", err);
      });
  }, []);

  // Fetch graph data when project changes
  useEffect(() => {
    if (!selectedProject) return;

    localStorage.setItem("selectedProject", selectedProject);

    axios.get(`${API_BASE_URL}/graph/graph-data`, {
      params: { projectName: selectedProject },
      withCredentials: true
    })
      .then((response) => {
        console.log(localStorage.getItem("selectedProject"))
        setGraphData(response.data);
      })
      .catch((error) => {
        console.error('API Error:', error);
      });
  }, [selectedProject]);

  const statsData = [
    { id: 1, value: graphData ? graphData.emailOpened : "Loading...", description: 'Users Clicked on Phishing Email', icon: '📊' },
    { id: 2, value: graphData ? graphData.submitted_data : "Loading...", description: 'Submitted Data on Phishing Page', icon: '📈' },
    { id: 3, value: graphData ? graphData.emailSent : "Loading...", description: 'Total Phishing email Sent', icon: '📉' },
    { id: 4, value: graphData ? graphData.trainingCompleted : "Loading...", description: 'Completed all Trainings', icon: '🥧' }
  ];

  return (
    <div className={`dashboard ${darkMode ? "dashboard--dark" : "dashboard--light"}`}>

      {/* Project Selector - Top Right */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
        <select
          value={selectedProject}
          onChange={(e) => {
            setSelectedProject(e.target.value);
            localStorage.setItem("selectedProject", e.target.value);
          }}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
            background: darkMode ? "#333" : "#fff",
            color: darkMode ? "#fff" : "#000"
          }}
        >
          <option value="All">All</option>
          {projectList.map((project) => (
            <option key={project._id} value={project.name}>{project.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="dashboard__row">
        <div className="dashboard__col--quarter">
          <StatsRow stats={statsData} darkMode={darkMode} />
        </div>
      </div>

      {/* Charts */}
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

      {/* Score Cards */}
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
            <ScoreCard title="Risky user" score="Loading..." grade="Loading..." final="Loading..." darkMode={darkMode} />
          )}
        </div>
        <div className="dashboard__col--half">
          {graphData ? (
            <ScoreCard
              title="Compromised user"
              score={graphData.submitted_data}
              grade={calculateGrade(graphData.submitted_data, graphData.emailSent)}
              final={graphData.submitted_data}
              darkMode={darkMode}
            />
          ) : (
            <ScoreCard title="Compromised user" score="Loading..." grade="Loading..." final="Loading..." darkMode={darkMode} />
          )}
        </div>
      </div>

      {/* Organization Score */}
      <div className="dashboard__row">
        <div className="dashboard__col--half">
          {graphData ? (
            <ScoreCard
              title="Organization Score"
              score={graphData.ogScore}
              grade={calculateGrade(graphData.ogScore, graphData.emailSent)}
              final={graphData.ogScore}
              darkMode={darkMode}
            />
          ) : (
            <ScoreCard title="Organization Score" score="Loading..." grade="Loading..." final="Loading..." darkMode={darkMode} />
          )}
        </div>
      </div>
    </div>
  );
}
