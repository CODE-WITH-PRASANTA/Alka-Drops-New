import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./HomeWhoWeAre.css";

import whoWeAreImage from "../../assets/whoweare.png";

/* Replace with your own YouTube video ID
   (the part after "v=" in https://www.youtube.com/watch?v=XXXXXXXXXXX) */
const YOUTUBE_VIDEO_ID = "M7lc1UVf-VE";

const MODAL_CLOSE_DELAY = 450; // ms, must match the CSS transition
const COUNT_DURATION = 2200; // ms

/* ---------- Data ---------- */

const features = [
  {
    id: 1,
    title: "Maximum Purity",
    text: "Every drop is purified and mineral-balanced to give you clean, great-tasting alkaline water with a pH of 8.5+.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M22 5C22 5 9 19.5 9 28.5C9 35.9 14.8 42 22 42" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 5C22 5 30 14 33.5 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="34" cy="33" r="5" stroke="currentColor" strokeWidth="2.2" />
        <path d="M34 25.5V27.5M34 38.5V40.5M26.5 33H28.5M39.5 33H41.5M28.7 27.7L30.1 29.1M37.9 36.9L39.3 38.3M39.3 27.7L37.9 29.1M30.1 36.9L28.7 38.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Multi-Step Filtration",
    text: "Water passes through several stages of filtration and UV treatment, so what reaches your glass is safe and refreshing.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M11 12L14.5 41H33.5L37 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12H39" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12.5 21C15 19 17.5 23 20 21C22.5 19 25 23 27.5 21C30 19 32.5 23 35.5 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 28V33M24 36.5V37" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Chlorine Free",
    text: "No chlorine smell and no harsh aftertaste, just smooth, natural-tasting water that is gentle for the whole family.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24 13C24 13 16.5 21 16.5 26.5C16.5 30.6 19.9 34 24 34C28.1 34 31.5 30.6 31.5 26.5C31.5 21 24 13 24 13Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M21 27C21 28.7 22.3 30 24 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 24C8 15.2 15.2 8 24 8C28.4 8 32.4 9.8 35.3 12.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M31 12.5H36V7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 24C40 32.8 32.8 40 24 40C19.6 40 15.6 38.2 12.7 35.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M17 35.5H12V40.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* Replace these with your real numbers */
const achievements = [
  {
    id: 1,
    value: 35000,
    decimals: 0,
    suffix: "+",
    label: "Happy Customers",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="16" r="7" stroke="currentColor" strokeWidth="2.2" />
        <path d="M10 41C10 33.3 16.3 28 24 28C31.7 28 38 33.3 38 41" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20.5 16.5C21.5 18 22.6 18.7 24 18.7C25.4 18.7 26.5 18 27.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 2,
    value: 541,
    decimals: 0,
    suffix: "+",
    label: "Daily Deliveries",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M6 14H28V32H6V14Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M28 20H35L42 27V32H28V20Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="15" cy="34" r="4" fill="#0a3fb8" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="35" cy="34" r="4" fill="#0a3fb8" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    ),
  },
  {
    id: 3,
    value: 40,
    decimals: 0,
    suffix: "+",
    label: "Quality Awards",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M14 7H34L42 18L24 41L6 18L14 7Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M6 18H42M18 18L24 41L30 18M14 7L18 18L24 7L30 18L34 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 4,
    value: 8.5,
    decimals: 1,
    suffix: "+",
    label: "Alkaline pH Level",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24 6C24 6 11 20 11 29C11 36.2 16.8 42 24 42C31.2 42 37 36.2 37 29C37 20 24 6 24 6Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M18.5 31.5C19.5 34 21.5 35.5 24 35.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const formatCount = (value, decimals) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/* ---------- Component ---------- */

const HomeWhoWeAre = () => {
  const sectionRef = useRef(null);
  const achievementsRef = useRef(null);
  const triggerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const closeTimerRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(() => achievements.map(() => 0));

  const [modalMounted, setModalMounted] = useState(false);
  const [modalActive, setModalActive] = useState(false);

  /* Reveal section on scroll */
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
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* Count up once when achievements enter the screen, then stop at the final value */
  useEffect(() => {
    const node = achievementsRef.current;
    if (!node) return undefined;

    let frameId = 0;
    let started = false;

    const finalValues = achievements.map((item) => item.value);
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const startCounting = () => {
      if (started) return;
      started = true;

      if (reducedMotion) {
        setCounts(finalValues);
        return;
      }

      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / COUNT_DURATION, 1);
        const eased = easeOutCubic(progress);

        setCounts(
          achievements.map((item) =>
            progress >= 1 ? item.value : item.value * eased
          )
        );

        if (progress < 1) frameId = requestAnimationFrame(tick);
      };

      frameId = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      startCounting();
      return () => cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCounting();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, []);

  /* Modal open / close (smooth in and out) */
  const openModal = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    setModalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setModalActive(true));
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalActive(false);
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setModalMounted(false); // removes the iframe, so the video stops
      if (triggerRef.current) triggerRef.current.focus();
    }, MODAL_CLOSE_DELAY);
  }, []);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  /* Lock page scroll, close with Esc, keep focus inside while open */
  useEffect(() => {
    if (!modalMounted) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(() => {
      if (closeButtonRef.current) closeButtonRef.current.focus();
    }, 50);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      } else if (event.key === "Tab") {
        event.preventDefault();
        if (closeButtonRef.current) closeButtonRef.current.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalMounted, closeModal]);

  return (
    <section
      ref={sectionRef}
      className={`home-who-we-are ${isVisible ? "home-who-we-are--visible" : ""}`}
      id="who-we-are"
      aria-labelledby="home-who-we-are-title"
    >
      {/* Heading */}
      <div className="home-who-we-are__heading">
        <span className="home-who-we-are__eyebrow">
          <span className="home-who-we-are__eyebrow-line"></span>
          WHO WE ARE
          <span className="home-who-we-are__eyebrow-line"></span>
        </span>

        <h2 className="home-who-we-are__title" id="home-who-we-are-title">
          A Trusted Name In <span>Alkaline Water</span> Delivery
        </h2>

        <p className="home-who-we-are__subtitle">
          From our plant to your doorstep, we deliver pure pH 8.5+ alkaline
          water in jars and bottles that families and offices rely on every day.
        </p>
      </div>

      {/* Video image */}
      <div className="home-who-we-are__media-wrap">
        <div className="home-who-we-are__media">
          <img
            src={whoWeAreImage}
            alt="A family enjoying glasses of pure drinking water"
            className="home-who-we-are__image"
            loading="lazy"
            decoding="async"
          />
          <span className="home-who-we-are__media-overlay" aria-hidden="true"></span>

          <span className="home-who-we-are__media-chip">
            <span className="home-who-we-are__media-chip-dot"></span>
            Our Story in 2 Minutes
          </span>

          <button
            ref={triggerRef}
            type="button"
            className="home-who-we-are__play"
            onClick={openModal}
            aria-label="Play company video"
            aria-haspopup="dialog"
          >
            <span className="home-who-we-are__play-ring home-who-we-are__play-ring--one" aria-hidden="true"></span>
            <span className="home-who-we-are__play-ring home-who-we-are__play-ring--two" aria-hidden="true"></span>
            <span className="home-who-we-are__play-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5V18.5C8 19.3 8.9 19.8 9.6 19.4L19.6 13C20.2 12.6 20.2 11.4 19.6 11L9.6 4.6C8.9 4.2 8 4.7 8 5.5Z" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Dark band: features + achievements */}
      <div className="home-who-we-are__band">
        <span className="home-who-we-are__band-circle home-who-we-are__band-circle--one" aria-hidden="true"></span>
        <span className="home-who-we-are__band-circle home-who-we-are__band-circle--two" aria-hidden="true"></span>

        <div className="home-who-we-are__container">
          {/* Feature cards */}
          <div className="home-who-we-are__features">
            {features.map((feature, index) => (
              <article
                className="home-who-we-are__feature"
                key={feature.id}
                style={{ transitionDelay: `${0.15 + index * 0.15}s` }}
              >
                <div className="home-who-we-are__feature-head">
                  <span className="home-who-we-are__feature-icon">{feature.icon}</span>
                  <h3 className="home-who-we-are__feature-title">{feature.title}</h3>
                </div>
                <p className="home-who-we-are__feature-text">{feature.text}</p>
              </article>
            ))}
          </div>

          {/* Achievements */}
          <div className="home-who-we-are__achievements" ref={achievementsRef}>
            <div className="home-who-we-are__achievements-heading">
              <span className="home-who-we-are__achievements-line"></span>
              <h3 className="home-who-we-are__achievements-title">Our Achievements</h3>
              <span className="home-who-we-are__achievements-line"></span>
            </div>

            <div className="home-who-we-are__stats">
              {achievements.map((item, index) => (
                <div
                  className="home-who-we-are__stat"
                  key={item.id}
                  style={{ transitionDelay: `${0.1 + index * 0.12}s` }}
                >
                  <span className="home-who-we-are__stat-icon">{item.icon}</span>
                  <div className="home-who-we-are__stat-content">
                    <strong
                      className="home-who-we-are__stat-number"
                      aria-label={`${formatCount(item.value, item.decimals)}${item.suffix}`}
                    >
                      <span aria-hidden="true">
                        {formatCount(counts[index], item.decimals)}
                        {item.suffix}
                      </span>
                    </strong>
                    <span className="home-who-we-are__stat-label">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video popup */}
      {modalMounted &&
        createPortal(
          <div
            className={`home-who-we-are__modal ${
              modalActive ? "home-who-we-are__modal--active" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Company video"
            onClick={closeModal}
          >
            <div className="home-who-we-are__modal-backdrop" aria-hidden="true"></div>

            <div
              className="home-who-we-are__modal-dialog"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                ref={closeButtonRef}
                type="button"
                className="home-who-we-are__modal-close"
                onClick={closeModal}
                aria-label="Close video"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>

              <div className="home-who-we-are__modal-frame">
                <iframe
                  className="home-who-we-are__modal-iframe"
                  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title="Company video"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default HomeWhoWeAre;