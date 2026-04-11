import { useNavigate } from "react-router-dom";
import "./Industries.css";

const INDUSTRIES = [
  { label: "Technology", keyword: "software", icon: "💻", description: "Software, engineering, data, and IT roles" },
  { label: "Healthcare", keyword: "healthcare", icon: "🏥", description: "Medical, nursing, pharmacy, and clinical positions" },
  { label: "Finance", keyword: "finance", icon: "📊", description: "Accounting, banking, and financial analysis" },
  { label: "Marketing", keyword: "marketing", icon: "📣", description: "Digital marketing, SEO, branding, and growth" },
  { label: "Design", keyword: "designer", icon: "🎨", description: "UX, UI, graphic design, and creative roles" },
  { label: "Engineering", keyword: "engineer", icon: "⚙️", description: "Mechanical, electrical, and civil engineering" },
  { label: "Education", keyword: "education", icon: "📚", description: "Teaching, tutoring, and curriculum development" },
  { label: "Sales", keyword: "sales", icon: "🤝", description: "Account management, business development, retail" },
  { label: "Operations", keyword: "operations", icon: "🏭", description: "Logistics, supply chain, and project management" },
  { label: "Legal", keyword: "legal", icon: "⚖️", description: "Legal counsel, compliance, and paralegal roles" },
  { label: "Human Resources", keyword: "HR", icon: "👥", description: "Recruiting, talent management, and people ops" },
  { label: "Customer Support", keyword: "support", icon: "🎧", description: "Customer service, success, and helpdesk roles" },
];

const Industries = () => {
  const navigate = useNavigate();

  return (
    <div className="ind-page">
      <div className="ind-header">
        <h1 className="ind-title">Browse by Industry</h1>
        <p className="ind-subtitle">Explore opportunities across {INDUSTRIES.length} industries</p>
      </div>

      <div className="ind-grid">
        {INDUSTRIES.map(({ label, keyword, icon, description }) => (
          <button
            key={label}
            className="ind-card"
            onClick={() => navigate(`/search?q=${encodeURIComponent(keyword)}`)}
          >
            <span className="ind-icon" aria-hidden="true">{icon}</span>
            <h3 className="ind-card-title">{label}</h3>
            <p className="ind-card-desc">{description}</p>
            <span className="ind-card-cta">View jobs →</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Industries;
