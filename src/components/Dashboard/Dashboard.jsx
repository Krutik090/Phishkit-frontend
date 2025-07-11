import React from "react";
import CategoryBar from "./CategoryBar";
import ShieldBlock from "./ShieldBlock";
import ScoreCard from './ScoreCard';
import AnalyticsWebsiteVisits from './AnalyticsWebsiteVisits';
import AnalyticsUserAction from "./AnalyticsUserAction";

export default function Dashboard() {
  return (
    <div className="dashboard">
  {/* Row 1: Charts */}
  <div className="dashboard__row">
    <div className="dashboard__col--half">
      <AnalyticsWebsiteVisits
        title="Website Visits"
        subheader="(+43%) than last year"
        chart={{
          colors: ['#FF69B4', '#FFC0CB'],
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          series: [
            { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
            { name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
          ],
        }}
      />
    </div>
    <div className="dashboard__col--half">
      <AnalyticsUserAction />
    </div>
  </div>

  {/* Row 2: Score Cards */}
  <div className="dashboard__row">
    <div className="dashboard__col--half">
      <ScoreCard title="Risky User" score={50} grade="C+" />
    </div>
    <div className="dashboard__col--half">
      <ScoreCard title="Compromised User Count" score={66} grade="C+" />
    </div>
  </div>

  {/* Row 3: Organization Score */}
  <div className="dashboard__row">
    <div className="dashboard__col--half">
      <ScoreCard title="Organization Score" score={75} grade="C+" />
    </div>
  </div>

  {/* Row 4: Shield Cards */}
  <div className="dashboard__row">
    <div className="dashboard__col--third">
      <ShieldBlock title="Web Findings" critical={4} high={9} medium={13} low={23} />
    </div>
    <div className="dashboard__col--third">
      <ShieldBlock title="Mobile Security" critical={3} high={6} medium={7} low={15} />
    </div>
  </div>
</div>

  );
}
