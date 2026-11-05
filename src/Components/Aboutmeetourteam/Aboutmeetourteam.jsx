import React, { useEffect, useRef, useState } from "react";
import "./Aboutmeetourteam.css";

import team1 from "../../assets/meetourteam-1.png";
import team2 from "../../assets/meetourteam-2.jpeg";
import team3 from "../../assets/meetourteam-3.jpg";
import team4 from "../../assets/meetourteam-4.webp";
import team5 from "../../assets/meetourteam-5.jpg";
import team6 from "../../assets/meetourteam-6.jpg";

/* Replace names, roles and photos with your real team */
const teamMembers = [
  {
    id: 1,
    name: "Doris Jordan",
    role: "Plant Manager",
    image: team1,
    alt: "Portrait of Doris Jordan, Plant Manager",
  },
  {
    id: 2,
    name: "Johnny Ramirez",
    role: "Quality Control Head",
    image: team2,
    alt: "Portrait of Johnny Ramirez, Quality Control Head",
  },
  {
    id: 3,
    name: "Diana Wagner",
    role: "Purification Specialist",
    image: team3,
    alt: "Portrait of Diana Wagner, Purification Specialist",
  },
  {
    id: 4,
    name: "Harry Garrett",
    role: "Packaging Supervisor",
    image: team4,
    alt: "Portrait of Harry Garrett, Packaging Supervisor",
  },
  {
    id: 5,
    name: "Priya Nair",
    role: "Delivery Team Lead",
    image: team5,
    alt: "Portrait of Priya Nair, Delivery Team Lead",
  },
  {
    id: 6,
    name: "Arjun Mehta",
    role: "Customer Support Lead",
    image: team6,
    alt: "Portrait of Arjun Mehta, Customer Support Lead",
  },
];

const TeamCard = ({ member, hidden }) => (
  <article className="about-team-card" aria-hidden={hidden ? "true" : undefined}>
    <div className="about-team-image-wrapper">
      <span className="about-team-ring" aria-hidden="true"></span>

      <div className="about-team-photo">
        <img
          className="about-team-image"
          src={member.image}
          alt={hidden ? "" : member.alt}
          loading="lazy"
          decoding="async"
          draggable="false"
        />
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
            <span className="about-team-subtitle-line"></span>
            MEET OUR TEAM
            <span className="about-team-subtitle-line"></span>
          </span>

          <h2 id="about-team-title">
            The People Behind <span>Alka Drops</span>
          </h2>

          <p className="about-team-description">
            From purification and quality checks to packing and doorstep
            delivery, our dedicated team works every day to bring you pure
            pH 8.5+ alkaline water.
          </p>
        </div>
      </div>

      {/* Continuously running team members (right to left) */}
      <div
        className="about-team-marquee"
        role="region"
        aria-label="Alka Drops team members"
        tabIndex={0}
      >
        <div
          className={`about-team-track ${
            isPaused ? "about-team-track--paused" : ""
          }`}
        >
          <div className="about-team-group">
            {teamMembers.map((member) => (
              <TeamCard member={member} key={member.id} />
            ))}
          </div>

          {/* Duplicate group for a seamless loop */}
          <div className="about-team-group about-team-group-clone" aria-hidden="true">
            {teamMembers.map((member) => (
              <TeamCard member={member} key={`clone-${member.id}`} hidden />
            ))}
          </div>
        </div>
      </div>

      {/* Pause / play */}
      <div className="about-team-controls">
        <button
          type="button"
          className="about-team-toggle"
          onClick={() => setIsPaused((current) => !current)}
          aria-pressed={isPaused}
        >
          {isPaused ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5V18.5C8 19.3 8.9 19.8 9.6 19.4L19.6 13C20.2 12.6 20.2 11.4 19.6 11L9.6 4.6C8.9 4.2 8 4.7 8 5.5Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4.2" height="14" rx="1.4" />
              <rect x="13.8" y="5" width="4.2" height="14" rx="1.4" />
            </svg>
          )}
          <span>{isPaused ? "Play slideshow" : "Pause slideshow"}</span>
        </button>
      </div>
    </section>
  );
};

export default Aboutmeetourteam;