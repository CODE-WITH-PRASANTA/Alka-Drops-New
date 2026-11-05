import React, { useEffect, useRef, useState } from "react";
import "./HomeExperienced.css";

import experiencedImage from "../../assets/expericenced.png";
import experiencedBackground from "../../assets/expbackground.png";

const CUSTOMER_TARGET = 5000;
const COUNT_DURATION = 2400; // ms

const features = [
  "Dedicated Delivery Team",
  "Convenient Water Delivery",
  "Quality-Focused Practices",
  "Customer-First Service",
];

const HomeExperienced = () => {
  const sectionRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [count, setCount] = useState(0);

  // Reveal when the section scrolls into view
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
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Count 0 -> 5000, then stop
  useEffect(() => {
    if (!isVisible) return undefined;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setCount(CUSTOMER_TARGET);
      return undefined;
    }

    let frameId;
    let startTime = null;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / COUNT_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      setCount(Math.floor(eased * CUSTOMER_TARGET));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(CUSTOMER_TARGET);
      }
    };

    const startTimer = setTimeout(() => {
      frameId = requestAnimationFrame(step);
    }, 500);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(frameId);
    };
  }, [isVisible]);

  return (
    <section
      className={`home-experienced ${
        isVisible ? "home-experienced--visible" : ""
      }`}
      id="experienced-team"
      ref={sectionRef}
      aria-labelledby="home-experienced-title"
    >
      <div className="home-experienced__container">
        {/* ================= LEFT IMAGE ================= */}
        <div className="home-experienced__visual">
          <div className="home-experienced__image-wrapper">
            <img
              src={experiencedImage}
              alt="Alka Drops water delivery professional"
              className="home-experienced__image"
              loading="lazy"
              decoding="async"
            />

            <div className="home-experienced__image-overlay"></div>

            {/* Floating pH badge */}
            <div className="home-experienced__badge" aria-hidden="true">
              <small>pH</small>
              <strong>8.5+</strong>
              <span>Alkaline</span>
            </div>

            {/* Floating delivery chip */}
            <div className="home-experienced__chip">
              <span className="home-experienced__chip-dot"></span>
              Free Home Delivery
            </div>
          </div>

          {/* Statistics card with running counter */}
          <div className="home-experienced__stats">
            <div className="home-experienced__stats-icon">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <circle cx="24" cy="14" r="7" stroke="currentColor" strokeWidth="2.5" />
                <path d="M11 36V32C11 26.477 15.477 22 21 22H27C32.523 22 37 26.477 37 32V36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M5 33V30C5 26.686 7.686 24 11 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M43 33V30C43 26.686 40.314 24 37 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="11" cy="17" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="37" cy="17" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className="home-experienced__stats-content">
              <strong
                className="home-experienced__stats-number"
                aria-label={`${CUSTOMER_TARGET}+ satisfied customers`}
              >
                <span aria-hidden="true">{count}</span>
                <em aria-hidden="true">+</em>
              </strong>

              <span className="home-experienced__stats-label">
                Satisfied Customers
              </span>
            </div>

            <span className="home-experienced__stats-decoration"></span>
          </div>
        </div>

        {/* ================= RIGHT CONTENT ================= */}
        <div
          className="home-experienced__content"
          style={{ "--home-experienced-bg": `url("${experiencedBackground}")` }}
        >
          <div className="home-experienced__content-inner">
            <div className="home-experienced__eyebrow">
              <span className="home-experienced__eyebrow-line"></span>
              <span>THE ALKA DROPS DIFFERENCE</span>
            </div>

            <h2 className="home-experienced__title" id="home-experienced-title">
              Refreshing Water.
              <span>Reliable Service.</span>
            </h2>

            <p className="home-experienced__description">
              At Alka Drops, we believe that great hydration starts with
              dependable service and attention to quality. Our goal is to make
              bottled drinking water a convenient part of your everyday life,
              at home, at work, and wherever your day takes you.
            </p>

            {/* Features */}
            <div className="home-experienced__features">
              {features.map((feature, index) => (
                <div
                  className="home-experienced__feature"
                  key={feature}
                  style={{ "--home-experienced-delay": `${0.7 + index * 0.12}s` }}
                >
                  <span className="home-experienced__check">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="home-experienced__feature-text">{feature}</span>
                </div>
              ))}
            </div>

            {/* Expandable content */}
            <div
              className={`home-experienced__more ${
                showMore ? "home-experienced__more--open" : ""
              }`}
              id="home-experienced-more"
              aria-hidden={!showMore}
            >
              <div className="home-experienced__more-inner">
                <h3 className="home-experienced__more-title">
                  Hydration That Fits Your Lifestyle
                </h3>

                <p className="home-experienced__more-description">
                  From everyday drinking water to alkaline water options, Alka
                  Drops is focused on helping customers find a convenient
                  hydration choice. Explore our products and contact our team
                  to learn more about availability, packaging, and delivery
                  options.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="home-experienced__actions">
              <button
                type="button"
                className={`home-experienced__button ${
                  showMore ? "home-experienced__button--active" : ""
                }`}
                onClick={() => setShowMore((previous) => !previous)}
                aria-expanded={showMore}
                aria-controls="home-experienced-more"
              >
                <span>{showMore ? "Read Less" : "Read More"}</span>

                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="home-experienced__button-arrow">
                  {showMore ? (
                    <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </button>

              <a href="/contact" className="home-experienced__link">
                Order Now
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div
            className="home-experienced__background-circle home-experienced__background-circle--one"
            aria-hidden="true"
          ></div>
          <div
            className="home-experienced__background-circle home-experienced__background-circle--two"
            aria-hidden="true"
          ></div>
        </div>
      </div>
    </section>
  );
};

export default HomeExperienced;