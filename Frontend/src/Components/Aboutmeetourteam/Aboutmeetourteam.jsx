import React, { useEffect, useRef, useState } from "react";
import API from "../../services/api";
import "./Aboutmeetourteam.css";

const TeamCard = ({ member, hidden }) => (
  <article className="about-team-card" aria-hidden={hidden ? "true" : undefined}>
    <div className="about-team-image-wrapper">
      <span className="about-team-ring" aria-hidden="true" />

      <div className="about-team-photo">
        {member.image ? (
          <img
            className="about-team-image"
            src={member.image}
            alt={hidden ? "" : member.name}
            loading="lazy"
            decoding="async"
            draggable="false"
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
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            {(member.name || "A").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <span className="about-team-drop" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3C12 3 6 10 6 14.5C6 17.81 8.69 20.5 12 20.5C15.31 20.5 18 17.81 18 14.5C18 10 12 3 12 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>

    <div className="about-team-info">
      <h3>{member.name}</h3>
      <p>{member.role}</p>
    </div>
  </article>
);

const Aboutmeetourteam = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  /* Fetch live team members from database via Axios */
  useEffect(() => {
    let isMounted = true;
    API.get("/team?status=active")
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data.members)) {
          setTeamMembers(res.data.members);
        }
      })
      .catch((err) => {
        console.error("Aboutmeetourteam fetch error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /* Reveal on scroll */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (teamMembers.length === 0) {
    return null; // hide carousel until loaded with live team
  }

  return (
    <section
      ref={sectionRef}
      className={`about-team-section ${
        isVisible ? "about-team-section--visible" : ""
      }`}
      aria-labelledby="about-team-title"
    >
      {/* Background decoration */}
      <div className="about-team-bg" aria-hidden="true">
        <span className="about-team-orb about-team-orb-one" />
        <span className="about-team-orb about-team-orb-two" />
      </div>

      <div className="about-team-container">
        {/* Section Heading */}
        <div className="about-team-heading">
          <span className="about-team-subtitle">
            <span className="about-team-subtitle-line" />
            MEET OUR TEAM
          </span>

          <h2 id="about-team-title" className="about-team-title">
            The Experts Behind <br /> Every Drop
          </h2>

          <p className="about-team-lead">
            From water quality specialists to delivery leads, our team works
            together daily to ensure your alkaline water is fresh, pure, and on
            time.
          </p>
        </div>

        {/* Endless Marquee Slider */}
        <div
          className="about-team-marquee"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          tabIndex={0}
          role="region"
          aria-label="Meet our team members"
        >
          <div
            className={`about-team-track ${
              isPaused ? "about-team-track--paused" : ""
            }`}
          >
            {teamMembers.map((member) => (
              <TeamCard key={member._id || member.id} member={member} />
            ))}

            {/* Cloned set for smooth continuous marquee loop */}
            {teamMembers.map((member) => (
              <TeamCard
                key={`clone-${member._id || member.id}`}
                member={member}
                hidden
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Aboutmeetourteam;
