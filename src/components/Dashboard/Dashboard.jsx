import React,{useEffect} from "react";
import CategoryBar from "./CategoryBar";
import ShieldBlock from "./ShieldBlock";
import ScoreCard from './ScoreCard';
import AnalyticsWebsiteVisits from './AnalyticsWebsiteVisits';
import AnalyticsUserAction from "./AnalyticsUserAction";
import StatsRow from "./StateRow";
import axios from "axios"; // ✅ Import axios

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
  useEffect(() => {
    const fetchThemeColors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/theme-color`,{ withCredentials: true });
        const { primaryColor, secondaryColor } = response.data;

        if (primaryColor) {
          localStorage.setItem("primaryColor", primaryColor);
        }
        if (secondaryColor) {
          localStorage.setItem("secondaryColor", secondaryColor);
        }
      } catch (error) {
        console.error("Error fetching theme colors:", error);
      }
    };

    fetchThemeColors();
  }, []);
  const statsData = [
    { id: 1, value: 2915, description: 'Users Clicked on Phishing Email', icon: '📊' },
    { id: 2, value: 1012, description: 'Submitted Data on Phishing Page', icon: '📈' },
    { id: 3, value: 6684, description: 'Total Phishing email Sent', icon: '📉' },
    { id: 4, value: 940, description: 'Completed all Trainings', icon: '🥧' }
  ];
  return (
    <div className="dashboard">

      {/* Row 1: Score Cards */}
      <div className="dashboard__row">
        <div className="dashboard__col--quarter">
          <StatsRow stats={statsData} />
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="dashboard__row">
        <div className="dashboard__col--half">
          <AnalyticsWebsiteVisits
            title="Total Phished User"
            subheader="Depaetment wise"
            chart={{
              colors: [localStorage.getItem('primaryColor')],
              categories: ['Account', 'HR', 'VAPT', 'ASM', 'CIDR', 'IT', 'OT', 'Devlopment', 'Sales'],
              series: [
                { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] }
              ],
            }}
          />
        </div>
        <div className="dashboard__col--half">
          <AnalyticsUserAction />
        </div>
      </div>

      {/* Row 3: Organization Score */}
      <div className="dashboard__row">
        <div className="dashboard__col--half">
          <ScoreCard title="Risky user" score={75} grade={calculateGrade(75)}  final="100"/>
        </div>
        <div className="dashboard__col--half">
          <ScoreCard title="Compromized user" score={75} grade={calculateGrade(75)} final="100"/>
        </div>
      </div>
      {/* Row 4: Organization Score */}
      <div className="dashboard__row">
        <div className="dashboard__col--half">
          <ScoreCard title="Organization Score" score={75} grade={calculateGrade(75)} final="100" />
        </div>
      </div>
      {/* Row 5: Shield Cards */}
      {/* <div className="dashboard__row">
        <div className="dashboard__col--third">
          <ShieldBlock title="Web Findings" critical={4} high={9} medium={13} low={23} />
        </div>
        <div className="dashboard__col--third">
          <ShieldBlock title="Mobile Security" critical={3} high={6} medium={7} low={15} />
        </div>
      </div> */}
    </div>

  );
}
