import React, { useState, useEffect, useCallback, useRef } from "react";
import "./HomeMain.css";

import slide1 from "../../assets/AlkalineHome-1.png";
import slide2 from "../../assets/AlkalineHome-2.png";
import slide3 from "../../assets/AlkalineHome-3.png";
import slide4 from "../../assets/AlkalineHome-4.png";

const SLIDE_DURATION = 4000; // 4 seconds

const slides = [
  {
    id: 1,
    image: slide1,
    tag: "pH 8.5+ Alkaline Water",
    title: "Alka Drops",
    highlight: "Pure Mountain Freshness",
    text: "Sourced from pristine glacier springs and enriched with natural minerals for perfectly balanced hydration, every single sip.",
  },
  {
    id: 2,
    image: slide2,
    tag: "Healthy Hydration",
    title: "Not Just Water,",
    highlight: "It's Alkaline",
    text: "Balance your body, boost your energy and stay refreshed all day with premium alkaline water you can trust.",
  },
  {
    id: 3,
    image: slide3,
    tag: "Free Home Delivery",
    title: "Fresh Cans,",
    highlight: "Delivered To Your Door",
    text: "Order 20L cans and bottles online and get them delivered on time, sealed, safe and ready to enjoy.",
  },
  {
    id: 4,
    image: slide4,
    tag: "100% Purity Assured",
    title: "Refreshing.",
    highlight: "Healthy. Trusted.",
    text: "Multi-stage purification, lab-tested quality and eco-friendly packaging, made for families and businesses.",
  },
];

const chips = [
  { icon: "💧", label: "Pure" },
  { icon: "🌿", label: "Healthy" },
  { icon: "❄️", label: "Refreshing" },
];

const stats = [
  { value: "8.5+", label: "pH Level" },
  { value: "100%", label: "Purity" },
  { value: "Free", label: "Delivery" },
];

/* Inline SVG icons for the feature cards */
const IconCertificate = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="8" width="52" height="38" rx="3" />
    <rect x="11" y="13" width="42" height="28" rx="2" />
    <path d="M21 21h22M24 26h16M27 31h10" />
    <circle cx="32" cy="43" r="7" />
    <path d="M28 49l-2 9 6-3 6 3-2-9" />
  </svg>
);

const IconHeart = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 56L9 32C3 25 7 13 18 12c6-.5 10 3 14 8 4-5 8-8.500 14-8 11 1 15 13 9 20L32 56z" />
    <path d="M4 34h14l5-10 8 18 6-12 3 4h20" />
  </svg>
);

const IconMolecule = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8l8 4.500v9L12 26l-8-4.500v-9L12 8z" />
    <path d="M22 32l8 4.500v9L22 50l-8-4.500v-9L22 32z" />
    <path d="M40 32l8 4.500v9L40 50l-8-4.500v-9L40 32z" />
    <circle cx="36" cy="14" r="4" />
    <circle cx="50" cy="8" r="4" />
    <circle cx="46" cy="22" r="3" />
    <path d="M20 20l12-4M40 17l6-6M39 18l5 3M30 36l-6-8" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 6l20 7v16c0 14-8.500 24-20 29C20.500 53 12 43 12 29V13l20-7z" />
    <path d="M22 32l7 7 13-14" />
  </svg>
);

const features = [
  {
    id: 1,
    Icon: IconCertificate,
    title: "Free Home Delivery",
    text: "Fresh, sealed alkaline water cans delivered right to your doorstep on time, every time, at no extra cost.",
  },
  {
    id: 2,
    Icon: IconHeart,
    title: "Healthy pH 8.5+",
    text: "Naturally balanced alkaline water that supports better hydration, digestion and all-day energy.",
  },
  {
    id: 3,
    Icon: IconMolecule,
    title: "Lab-Tested Purity",
    text: "Multi-stage purification and mineral enrichment, tested for quality so every drop is safe and refreshing.",
  },
  {
    id: 4,
    Icon: IconShield,
    title: "Secure Payment",
    text: "Pay safely online with trusted gateways, plus a money-back guarantee if you're not fully satisfied.",
  },
];

const HomeMain = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const touchStartX = useRef(null);
  const featuresRef = useRef(null);

  const next = useCallback(
    () => setCurrent((p) => (p + 1) % slides.length),
    []
  );
  const prev = useCallback(
    () => setCurrent((p) => (p - 1 + slides.length) % slides.length),
    []
  );

  // Auto slide every 4 seconds (restarts whenever the slide changes)
  useEffect(() => {
    if (paused) return undefined;
    const timer = setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [current, paused, next]);

  // Reveal feature cards when they scroll into view
  useEffect(() => {
    const node = featuresRef.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setFeaturesVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  const active = slides[current];

  return (
    <section className="HomeMain">
      {/* Decorative background */}
      <div className="HomeMain-bg" aria-hidden="true">
        <span className="HomeMain-orb HomeMain-orb-1" />
        <span className="HomeMain-orb HomeMain-orb-2" />
        <span className="HomeMain-orb HomeMain-orb-3" />
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className={`HomeMain-bubble HomeMain-bubble-${i + 1}`} />
        ))}
      </div>

      <div className="HomeMain-container">
        {/* ================= SLIDER ================= */}
        <div
          className="HomeMain-slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="HomeMain-images">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`HomeMain-image ${
                  index === current ? "HomeMain-image-active" : ""
                }`}
                style={{ backgroundImage: `url(${slide.image})` }}
                role="img"
                aria-label={`${slide.title} ${slide.highlight}`}
              />
            ))}
            <div className="HomeMain-overlay" />
          </div>

          {/* Left content (re-animates on every slide using key) */}
          <div className="HomeMain-content" key={active.id}>
            <div className="HomeMain-brand HomeMain-anim HomeMain-anim-1">
              <span className="HomeMain-brandDrop" />
              <span className="HomeMain-brandName">Alka Drops</span>
              <span className="HomeMain-brandLine" />
            </div>

            <span className="HomeMain-tag HomeMain-anim HomeMain-anim-2">
              <i className="HomeMain-tagDot" />
              {active.tag}
            </span>

            <h1 className="HomeMain-title HomeMain-anim HomeMain-anim-3">
              {active.title}
              <span className="HomeMain-highlight">{active.highlight}</span>
            </h1>

            <p className="HomeMain-text HomeMain-anim HomeMain-anim-4">
              {active.text}
            </p>

            <div className="HomeMain-chips HomeMain-anim HomeMain-anim-5">
              {chips.map((c) => (
                <span className="HomeMain-chip" key={c.label}>
                  <em>{c.icon}</em> {c.label}
                </span>
              ))}
            </div>

            <div className="HomeMain-actions HomeMain-anim HomeMain-anim-6">
              <a href="#shop" className="HomeMain-btn HomeMain-btnPrimary">
                Order Now
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a href="#about" className="HomeMain-btn HomeMain-btnGhost">
                Explore Products
              </a>
            </div>

            <div className="HomeMain-stats HomeMain-anim HomeMain-anim-7">
              {stats.map((s) => (
                <div className="HomeMain-stat" key={s.label}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating pH badge */}
          <div className="HomeMain-badge" aria-hidden="true">
            <small>pH</small>
            <strong>8.5+</strong>
            <span>Alkaline</span>
          </div>

          {/* Arrows */}
          <button
            type="button"
            className="HomeMain-arrow HomeMain-arrowPrev"
            onClick={prev}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="HomeMain-arrow HomeMain-arrowNext"
            onClick={next}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          {/* Dots with progress */}
          <div className="HomeMain-dots">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                className={`HomeMain-dot ${
                  index === current ? "HomeMain-dot-active" : ""
                }`}
                onClick={() => setCurrent(index)}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === current && (
                  <span
                    className="HomeMain-dotProgress"
                    style={{
                      animationDuration: `${SLIDE_DURATION}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="HomeMain-counter">
            0{current + 1}
            <span> / 0{slides.length}</span>
          </div>
        </div>

        {/* ================= FEATURES ================= */}
        <div
          ref={featuresRef}
          className={`HomeMain-features ${
            featuresVisible ? "HomeMain-features-show" : ""
          }`}
        >
          <div className="HomeMain-featuresHead">
            <span className="HomeMain-featuresKicker">Why Alka Drops</span>
            <h2 className="HomeMain-featuresTitle">
              Not Just Water, <b>It's Alkaline</b>
            </h2>
            <p className="HomeMain-featuresSub">
              Premium quality you can taste, delivered with care and trusted by
              thousands of families.
            </p>
          </div>

          <div className="HomeMain-featuresGrid">
            {features.map(({ id, Icon, title, text }, i) => (
              <article
                className="HomeMain-card"
                key={id}
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <span className="HomeMain-cardNum">0{id}</span>
                <div className="HomeMain-cardIcon">
                  <Icon />
                </div>
                <h3 className="HomeMain-cardTitle">{title}</h3>
                <p className="HomeMain-cardText">{text}</p>
                <span className="HomeMain-cardLine" />
              </article>
            ))}
          </div>

          
        </div>

      
      </div>
    </section>
  );
};

export default HomeMain;