import React, { useEffect, useRef, useState } from "react";
import "./Servicereview.css";

/* ---------------------------------------------------------
   Edit these numbers and labels to match your real figures
--------------------------------------------------------- */
const statistics = [
  {
    value: 35000,
    suffix: "+",
    label: "Happy Customers",
    icon: "customer",
  },
  {
    value: 541,
    suffix: "+",
    label: "Daily Deliveries",
    icon: "truck",
  },
  {
    value: 40,
    suffix: "+",
    label: "Areas Served",
    icon: "location",
  },
  {
    value: 678,
    suffix: "+",
    label: "Business Clients",
    icon: "business",
  },
];

const features = [
  {
    title: "Maximum Purity",
    description:
      "Every drop of Alka Drops is carefully treated and tested, so you and your family get clean, safe and refreshing drinking water.",
    icon: "purity",
  },
  {
    title: "5 Steps Filtration",
    description:
      "Our five-step filtration process removes impurities while keeping the natural freshness and smooth taste of your water.",
    icon: "filtration",
  },
  {
    title: "pH 8.5+ Alkaline",
    description:
      "Naturally balanced alkaline water for everyday hydration, sealed hygienically and delivered free to your doorstep.",
    icon: "alkaline",
  },
];

function FeatureIcon({ type, className = "" }) {
  const common = {
    className,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (type) {
    case "customer":
      return (
        <svg {...common}>
          <circle cx="24" cy="15" r="7" />
          <path d="M10 41c0-8.5 6-14 14-14s14 5.5 14 14" />
          <path d="m19 15 3.5 3.5L29 12" />
        </svg>
      );

    case "truck":
      return (
        <svg {...common}>
          <path d="M5 12h22v21H5z" />
          <path d="M27 19h8l7 7v7H27z" />
          <circle cx="14" cy="35" r="4" />
          <circle cx="34" cy="35" r="4" />
        </svg>
      );

    case "location":
      return (
        <svg {...common}>
          <path d="M24 43S11 30 11 20a13 13 0 0 1 26 0c0 10-13 23-13 23Z" />
          <circle cx="24" cy="20" r="5" />
        </svg>
      );

    case "business":
      return (
        <svg {...common}>
          <path d="M8 42V14h18v28" />
          <path d="M26 42V24h14v18" />
          <path d="M13 20h8M13 26h8M13 32h8M31 30h4M31 36h4" />
          <path d="M5 42h38" />
        </svg>
      );

    case "filtration":
      return (
        <svg {...common}>
          <path d="M10 7 14 40h20L38 7" />
          <path d="M15 12c2 4 4 4 6 0 2 4 4 4 6 0 2 4 4 4 6 0" />
          <path d="M24 22v10M21 29l3 3 3-3" />
        </svg>
      );

    case "alkaline":
      return (
        <svg {...common}>
          <path d="M24 5S11 21 11 29a13 13 0 0 0 26 0C37 21 24 5 24 5Z" />
          <path d="M19 30a6 6 0 0 0 6 6" />
          <path d="M20 23h8M24 19v8" />
        </svg>
      );

    case "play":
      return (
        <svg {...common}>
          <path
            d="M17 11.5c0-1.5 1.7-2.4 3-1.6l17 12.2a2.3 2.3 0 0 1 0 3.8L20 38.1c-1.3.9-3 0-3-1.6z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );

    case "drop":
      return (
        <svg {...common}>
          <path d="M24 5S11 21 11 29a13 13 0 0 0 26 0C37 21 24 5 24 5Z" />
          <path d="M19 30a6 6 0 0 0 6 6" />
        </svg>
      );

    case "purity":
    default:
      return (
        <svg {...common}>
          <path d="M23 5S10 21 10 29a13 13 0 0 0 26 0C36 21 23 5 23 5Z" />
          <path d="M18 30a6 6 0 0 0 6 6" />
          <circle cx="34" cy="34" r="8" fill="#e8f1ff" />
          <path d="m31 34 2 2 4-5" />
        </svg>
      );
  }
}

function AnimatedNumber({ value, suffix, active }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    let frame;
    const duration = 1800;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(value * easedProgress));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return (
    <span>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function Servicereview() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) {
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
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!videoOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setVideoOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [videoOpen]);

  return (
    <section
      ref={sectionRef}
      className={`water-experience ${isVisible ? "water-experience-visible" : ""}`}
    >
      <span className="water-experience-bg water-experience-bg-left" aria-hidden="true"></span>
      <span className="water-experience-bg water-experience-bg-right" aria-hidden="true"></span>

      <div className="water-experience-inner">
        {/* ================= HEADING ================= */}
        <div className="water-experience-heading">
          <div className="water-experience-eyebrow">
            <FeatureIcon type="drop" />
            <span>Why Alka Drops</span>
          </div>

          <h2>
            Purity You Can Taste,
            <span> Trust You Can Feel</span>
          </h2>

          <p>
            From the first filter to your front door, every step is designed to
            give your family safe, fresh and healthy alkaline water.
          </p>
        </div>

        {/* ================= MAIN ================= */}
        <div className="water-experience-main">
          {/* Video preview */}
          <div className="water-experience-video">
            <img
              src="https://images.unsplash.com/photo-1532634896-26909d0d4b25?w=1400&auto=format&fit=crop&q=85"
              alt="A person enjoying clean drinking water"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src =
                  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1400&auto=format&fit=crop&q=85";
              }}
            />

            <div className="water-experience-video-overlay" />

            <div className="water-experience-video-chip">
              <FeatureIcon type="drop" />
              pH 8.5+ Alkaline Water
            </div>

            <button
              type="button"
              className="water-experience-play"
              onClick={() => setVideoOpen(true)}
              aria-label="Play water purification video"
            >
              <FeatureIcon type="play" />
            </button>

            <div className="water-experience-video-caption">
              <strong>See how Alka Drops is purified</strong>
              <span>Watch the video</span>
            </div>
          </div>

          {/* Feature cards */}
          <div className="water-experience-features">
            {features.map((feature, index) => (
              <article
                className="water-experience-feature-card"
                key={feature.title}
                style={{ "--feature-index": index }}
              >
                <div className="water-experience-feature-icon">
                  <FeatureIcon type={feature.icon} />
                </div>

                <div className="water-experience-feature-body">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="water-experience-stats">
          <span className="water-experience-stats-glow" aria-hidden="true"></span>

          {statistics.map((item, index) => (
            <div
              className="water-experience-stat"
              key={item.label}
              style={{ "--stat-index": index }}
            >
              <div className="water-experience-stat-icon">
                <FeatureIcon type={item.icon} />
              </div>

              <div className="water-experience-stat-info">
                <div className="water-experience-stat-number">
                  <AnimatedNumber
                    value={item.value}
                    suffix={item.suffix}
                    active={isVisible}
                  />
                </div>

                <div className="water-experience-stat-label">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= VIDEO MODAL ================= */}
      {videoOpen && (
        <div
          className="water-experience-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Water purification video"
          onClick={() => setVideoOpen(false)}
        >
          <button
            type="button"
            className="water-experience-modal-close"
            onClick={() => setVideoOpen(false)}
            aria-label="Close video"
          >
            &times;
          </button>

          <div
            className="water-experience-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <iframe
              src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?autoplay=1"
              title="Water and purification video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}