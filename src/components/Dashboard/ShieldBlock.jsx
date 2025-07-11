import "./Shieldblock.css";
import shieldBg from "../../assets/shieldNew.png"; // ✅ Ensure correct path

export default function ShieldBlock({ title, critical, high, medium, low }) {
  return (
    <div className="shield-block">
      <div className="shield-block__content">
        <h3>{title}</h3>
        <ul>
          <li><strong>Critical:</strong> {critical}</li>
          <li><strong>High:</strong> {high}</li>
          <li><strong>Medium:</strong> {medium}</li>
          <li><strong>Low:</strong> {low}</li>
        </ul>
      </div>
    </div>
  );
}

