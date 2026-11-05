import React, { useEffect, useRef, useState } from "react";
import Cleanbottle from "../../assets/clean_bottles.png";
import "./Aboutexperiencework.css";

const features = [
  "Trained purification team",
  "Hygienic, sealed packing",
  "Careful doorstep delivery",
  "Friendly customer support",
];

const Aboutexperiencework = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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
      className={`experience-section ${
        isVisible ? "experience-section--visible" : ""
      }`}
      aria-labelledby="experience-title"
    >
      {/* LEFT BLUE CONTENT PANEL */}
      <div className="experience-content">
        <div className="experience-map-pattern" aria-hidden="true" />
        <span className="experience-circle experience-circle-one" aria-hidden="true" />
        <span className="experience-circle experience-circle-two" aria-hidden="true" />

        <div className="experience-inner">
          <span className="experience-eyebrow">
            <span className="experience-eyebrow-line"></span>
            OUR TEAM
          </span>

          <h2 className="experience-heading" id="experience-title">
            Experienced Workers
            <br />
            <span>Behind Every Drop</span>
          </h2>

          <p className="experience-description">
            Every Alka Drops bottle and jar passes through the hands of a
            trained, dedicated team. From purification and quality checks to
            hygienic packing and careful delivery, our experienced workers
            make sure pure pH 8.5+ alkaline water reaches you fresh and safe.
          </p>

          <ul className="experience-features">
            {features.map((feature, index) => (
              <li
                key={feature}
                style={{ transitionDelay: `${0.5 + index * 0.1}s` }}
              >
                <span className="experience-check" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle
                      cx="10"
                      cy="10"
                      r="8.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="m6.5 10 2.2 2.2 4.8-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span className="experience-feature-text">{feature}</span>
              </li>
            ))}
          </ul>

          <a href="/services" className="experience-read-more">
            <span>Read More</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12H19M12 5L19 12L12 19"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* RIGHT WATER BOTTLE IMAGE */}
      <div className="experience-image">
        <img
          src={Cleanbottle}
          alt="Alka Drops bottled drinking water"
          loading="lazy"
          decoding="async"
        />
        <span className="experience-image-overlay" aria-hidden="true"></span>

        {/* Floating pH badge */}
        <div className="experience-ph-badge">
          <small>pH</small>
          <strong>8.5+</strong>
          <span>Alkaline</span>
        </div>

        {/* Floating info card */}
        <div className="experience-info-card">
          <span className="experience-info-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C12 3 6 10 6 14.5C6 17.81 8.69 20.5 12 20.5C15.31 20.5 18 17.81 18 14.5C18 10 12 3 12 3Z"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="experience-info-text">
            <strong>Sealed &amp; Hygienic Packing</strong>
            <small>Pure alkaline water, every time</small>
          </span>
        </div>
      </div>
    </section>
  );
};

export default Aboutexperiencework;