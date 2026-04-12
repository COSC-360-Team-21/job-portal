import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./JobCard.css";

const JobCard = ({
  id,
  title,
  company,
  location,
  workType,
  salary,
  postedDate,
  skills = [],
  onApply,
  onSave,
}) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved((prev) => !prev);
    onSave?.();
  };

  return (
    <article className="jc-card">
      <div className="jc-top">
        <div className="jc-company-logo" aria-hidden="true">
          {company.charAt(0).toUpperCase()}
        </div>

        <div className="jc-meta">
          <h3 className="jc-title">
            <Link to={`/jobs/${id}`} className="jc-title-link">{title}</Link>
          </h3>
          <p className="jc-company">{company}</p>
          <p className="jc-location">{location}</p>
          <div className="jc-badges">
            <span className="jc-badge jc-badge-type">{workType}</span>
          </div>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="jc-skills">
          {skills.map((skill) => (
            <span key={skill} className="jc-skill">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="jc-footer">
        <div className="jc-footer-left">
          {salary && <span className="jc-salary">{salary}</span>}
          {postedDate && <span className="jc-posted">Posted {postedDate}</span>}
        </div>

        <div className="jc-actions">
          <button
            className={`jc-btn-save${saved ? " jc-btn-save--active" : ""}`}
            onClick={handleSave}
            aria-label={saved ? "Unsave job" : "Save job"}
            aria-pressed={saved}
          >
            {saved ? "Saved" : "Save"}
          </button>
          <button className="jc-btn-apply" onClick={onApply}>
            Apply Now
          </button>
        </div>
      </div>

    </article>
  );
};

JobCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  workType: PropTypes.string.isRequired,
  salary: PropTypes.string,
  postedDate: PropTypes.string,
  skills: PropTypes.arrayOf(PropTypes.string),
  onApply: PropTypes.func,
  onSave: PropTypes.func,
};

export default JobCard;
