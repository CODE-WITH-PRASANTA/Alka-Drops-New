import React, { useState, useEffect } from "react";
import "./Team_whywechose.css";
import teamImage from "../../assets/waterbottle_carry_man.jpg";

const progressData = [
  { title: "Nullam est", percentage: 76 },
  { title: "Mattis dictum nunc", percentage: 63 },
  { title: "Malesuada dictum neque", percentage: 86 },
  { title: "Tempor commodo", percentage: 72 },
];

// ANIMATED PROGRESS COMPONENT
const AnimatedProgress = ({ percentage, title }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = null;
    const duration = 1500;
    let animationFrame;

    const animate = (timestamp) => {
      if (!start) start = timestamp;

      const elapsed = timestamp - start;
      const progressValue = Math.min(elapsed / duration, 1);

      // Smooth animation
      const eased = 1 - Math.pow(1 - progressValue, 3);

      setProgress(Math.round(eased * percentage));

      if (progressValue < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [percentage]);

  return (
    <>
      <div className="team-progress-info">
        <span>{title}</span>
        <span>{progress}%</span>
      </div>

      <div className="team-progress-track">
        <div
          className="team-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
};

const Team_whywechose = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="team-why-section">
      <div className="team-why-container">

        {/* LEFT IMAGE */}
        <div className="team-why-image-wrapper">
          <img
            src={teamImage}
            alt="Water delivery professional"
            className="team-why-image"
          />

          {/* EXPERIENCE BADGE */}
          <div className="team-experience-badge">
            <span className="team-experience-number">25</span>

            <span className="team-experience-text">
              Years Of
              <br />
              experience
            </span>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="team-why-content">

          <span className="team-why-subtitle">
            WHY CHOOSE US
          </span>

          <h2 className="team-why-heading">
            A Trusted Name In
            <br className="team-desktop-break" />
            Bottled Water Industry
          </h2>

          <p className="team-why-description">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo. Nemo enim ipsam
          </p>

          {/* ANIMATED PROGRESS BARS */}
          <div className="team-progress-list">
            {progressData.map((item, index) => (
              <div
                className="team-progress-item"
                key={index}
              >
                <AnimatedProgress
                  title={item.title}
                  percentage={item.percentage}
                />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* SCROLL TO TOP BUTTON */}
      <button
        className="team-scroll-top"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </section>
  );
};

export default Team_whywechose;