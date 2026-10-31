import React, { useEffect, useRef, useState } from "react";
import "./Servicereview.css";

const statistics = [
  {
    value: 35000,
    suffix: "",
    label: "Happy Customers",
    icon: "customer",
  },
  {
    value: 541,
    suffix: "+",
    label: "Projects Done",
    icon: "project",
  },
  {
    value: 40,
    suffix: "+",
    label: "Awards Win",
    icon: "award",
  },
  {
    value: 678,
    suffix: "",
    label: "Client Works",
    icon: "chart",
  },
];

const features = [
  {
    title: "Maximum Purity",
    description:
      "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog MTV quiz graced.",
    icon: "purity",
  },
  {
    title: "5 Steps Filtration",
    description:
      "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog MTV quiz graced.",
    icon: "filtration",
  },
];

function FeatureIcon({ type, className = "" }) {
  const common = {
    className,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (type) {
    case "customer":
      return (
        <svg {...common}>
          <circle cx="24" cy="12" r="7" />
          <path d="M17 10h14M19 17l-2 3h14l-2-3" />
          <path d="M10 39c0-8 5-13 14-13s14 5 14 13" />
          <path d="m19 29 5 5 5-5M24 34v5" />
        </svg>
      );

    case "project":
      return (
        <svg {...common}>
          <path d="M12 6h24v36H12z" />
          <path d="M16 12h16M16 17h16M16 22h16M16 27h16M16 32h11" />
          <path d="M9 9v32M39 9v32" />
        </svg>
      );

    case "award":
      return (
        <svg {...common}>
          <path d="m24 5 7 9 12 2-8 9 2 13-13-6-13 6 2-13-8-9 12-2z" />
          <path d="m15 14 9 18 9-18M5 16h8M35 16h8" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          <path d="M24 5a19 19 0 1 0 19 19H24z" />
          <path d="M29 5v14h14A19 19 0 0 0 29 5z" />
          <path d="M24 10v14" />
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

    case "purity":
    default:
      return (
        <svg {...common}>
          <path d="M23 5S10 21 10 29a13 13 0 0 0 26 0C36 21 23 5 23 5Z" />
          <path d="M18 30a6 6 0 0 0 6 6" />
          <circle cx="34" cy="34" r="8" fill="#e5f2fa" />
          <path d="m31 34 2 2 4-5" />
        </svg>
      );
  }
}

function AnimatedNumber({ value, suffix, active }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame;
    const duration = 1800;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Smooth ease-out counting animation
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

    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!videoOpen) return;

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
      className={`water-experience ${
        isVisible ? "water-experience-visible" : ""
      }`}
    >
      {/* Top blue statistics strip */}
      <div className="water-experience-stats">
        <div className="water-experience-stats-inner">
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

                <div className="water-experience-stat-label">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main feature and video section */}
      <div className="water-experience-main">
        <div className="water-experience-features">
          {features.map((feature, index) => (
            <article
              className="water-experience-feature-card"
              key={feature.title}
              style={{ "--feature-index": index }}
            >
              <div className="water-experience-feature-heading">
                <div className="water-experience-feature-icon">
                  <FeatureIcon type={feature.icon} />
                </div>

                <h3>{feature.title}</h3>
              </div>

              <p>{feature.description}</p>
            </article>
          ))}
        </div>

        {/* Video preview */}
        <div className="water-experience-video">
          <img
            src="https://images.unsplash.com/photo-1532634896-26909d0d4b25?w=1200&auto=format&fit=crop&q=85"
            alt="A person enjoying clean drinking water"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src =
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&auto=format&fit=crop&q=85";
            }}
          />

          <div className="water-experience-video-overlay" />

          <button
            type="button"
            className="water-experience-play"
            onClick={() => setVideoOpen(true)}
            aria-label="Play water purification video"
          >
            <FeatureIcon type="play" />
          </button>
        </div>
      </div>

      {/* Video modal */}
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