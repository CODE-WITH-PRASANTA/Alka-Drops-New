import React, { useEffect, useState } from "react";
import { Droplet, Mail, RefreshCw, AlertCircle } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import API from "../../services/api";
import "./Team_Meet.css";

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Team_Meet = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await API.get("/team?status=active");
      if (res.data?.success && Array.isArray(res.data.members)) {
        setTeamMembers(res.data.members);
      } else {
        setTeamMembers([]);
      }
    } catch (err) {
      console.error("Error fetching team members via Axios:", err);
      setError("Unable to load team members right now. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return (
    <section className="team-meet-section">
      {/* Decorative background */}
      <div className="team-meet-dots" aria-hidden="true" />
      <div className="team-meet-glow team-meet-glow-1" aria-hidden="true" />
      <div className="team-meet-glow team-meet-glow-2" aria-hidden="true" />

      <div className="team-meet-container">
        {/* Section heading */}
        <div className="team-meet-heading">
          <span className="team-meet-badge">
            <span className="team-meet-badge-dot" aria-hidden="true" />
            MEET OUR TEAM
          </span>

          <h2>
            The People Behind
            <br />
            <em>Alka Drops</em>
          </h2>

          <p>
            A dedicated team working every day to bring clean, safe pH 8.5+
            alkaline drinking water to your doorstep with care, convenience,
            and reliability.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                display: "inline-block",
                width: "48px",
                height: "48px",
                border: "4px solid rgba(11, 95, 196, 0.15)",
                borderTopColor: "#0b5fc4",
                borderRadius: "50%",
                animation: "teamSpin 0.8s linear infinite",
              }}
            />
            <p style={{ marginTop: "16px", color: "#4a5a78", fontWeight: 600 }}>
              Loading Alka Drops team members...
            </p>
            <style>{`@keyframes teamSpin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 24px",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #fee2e2",
              maxWidth: "500px",
              margin: "20px auto 40px",
              boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
            }}
          >
            <AlertCircle size={36} color="#dc2626" style={{ margin: "0 auto 12px" }} />
            <h4 style={{ color: "#1e293b", margin: "0 0 6px", fontSize: "17px" }}>
              Connection Issue
            </h4>
            <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 16px" }}>
              {error}
            </p>
            <button
              type="button"
              onClick={fetchTeam}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                backgroundColor: "#0b5fc4",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && teamMembers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "500px",
              margin: "20px auto 40px",
              boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
            }}
          >
            <p style={{ color: "#4a5a78", fontSize: "15px", margin: 0 }}>
              No team members published yet. Add active team members in the Admin Panel.
            </p>
          </div>
        )}

        {/* Team members Grid */}
        {!isLoading && !error && teamMembers.length > 0 && (
          <div className="team-meet-grid">
            {teamMembers.map((member, index) => {
              const social = member.socialLinks || {};

              return (
                <article
                  className="team-meet-card"
                  key={member._id || member.id || index}
                  style={{ "--card-index": index }}
                >
                  {/* Profile image */}
                  <div className="team-meet-image-wrapper">
                    <div className="team-meet-image-ring">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="team-meet-image"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #0b5fc4, #1e88e5)",
                            color: "#ffffff",
                            fontSize: "36px",
                            fontWeight: "bold",
                          }}
                        >
                          {(member.name || "A").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <span className="team-meet-drop" aria-hidden="true">
                      <Droplet size={16} strokeWidth={2.4} />
                    </span>
                  </div>

                  {/* Member information */}
                  <div className="team-meet-info">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                    {member.department && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#0b5fc4",
                          background: "#eef6ff",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          marginTop: "4px",
                          letterSpacing: "0.4px",
                          textTransform: "uppercase",
                        }}
                      >
                        {member.department}
                      </span>
                    )}
                  </div>

                  {/* Social media links */}
                  <div className="team-meet-social">
                    {social.linkedin && (
                      <a
                        href={social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        title="LinkedIn"
                      >
                        <FontAwesomeIcon icon={faLinkedinIn} />
                      </a>
                    )}

                    {social.instagram && (
                      <a
                        href={social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on Instagram`}
                        title="Instagram"
                      >
                        <FontAwesomeIcon icon={faInstagram} />
                      </a>
                    )}

                    {social.facebook && (
                      <a
                        href={social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on Facebook`}
                        title="Facebook"
                      >
                        <FontAwesomeIcon icon={faFacebookF} />
                      </a>
                    )}

                    {social.twitter && (
                      <a
                        href={social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on Twitter`}
                        title="Twitter / X"
                      >
                        <XIcon />
                      </a>
                    )}

                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        aria-label={`Email ${member.name}`}
                        title={member.email}
                      >
                        <Mail size={16} />
                      </a>
                    )}

                    {/* Fallback default icons if no specific social link provided */}
                    {!social.linkedin && !social.instagram && !social.facebook && !social.twitter && !member.email && (
                      <>
                        <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                          <FontAwesomeIcon icon={faLinkedinIn} />
                        </a>
                        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram">
                          <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" title="Facebook">
                          <FontAwesomeIcon icon={faFacebookF} />
                        </a>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom message */}
        <div className="team-meet-footer">
          <span className="team-meet-footer-icon" aria-hidden="true">
            <Droplet size={20} />
          </span>

          <p>
            <strong>Every drop matters.</strong> Every customer matters.
            That is the Alka Drops promise.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Team_Meet;
