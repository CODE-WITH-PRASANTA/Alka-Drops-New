import React, { useEffect, useRef, useState } from "react";
import Card1 from "../../assets/card1.jpg";
import Card2 from "../../assets/card2.jpg";
import Card3 from "../../assets/card3.jpg";
import Card4 from "../../assets/card4.jpg";
import Card5 from "../../assets/card5.jpg";
import Card6 from "../../assets/card6.jpg";

import "./Servicewhychooseus.css";

const services = [
  {
    id: 1,
    title: "Bottled Water Delivery",
    tag: "Most popular",
    description:
      "Fresh pH 8.5+ alkaline drinking water delivered to your doorstep in sealed, hygienic jars and bottles. Simple, reliable and always on time.",
    image: Card1,
    icon: "drop",
  },
  {
    id: 2,
    title: "Water Dispenser Solutions",
    tag: "Home & office",
    description:
      "Convenient dispenser solutions for homes and offices, designed to make clean drinking water easy to reach every single day.",
    image: Card2,
    icon: "drop",
  },
  {
    id: 3,
    title: "Fast Home Delivery",
    tag: "Free delivery",
    description:
      "Get your water exactly when you need it. Our delivery team focuses on dependable service, flexible scheduling and timely arrivals.",
    image: Card3,
    icon: "truck",
  },
  {
    id: 4,
    title: "Water Quality Testing",
    tag: "Safe & tested",
    description:
      "Water quality matters. Learn about our testing service and why regular checks are important for safe, healthy drinking water.",
    image: Card4,
    icon: "shield",
  },
  {
    id: 5,
    title: "Water Purification",
    tag: "Cleaner taste",
    description:
      "Purification solutions that help improve drinking water quality and support cleaner, better-tasting water for everyday use.",
    image: Card5,
    icon: "check",
  },
  {
    id: 6,
    title: "Bottle Refill Service",
    tag: "Eco friendly",
    description:
      "A convenient refill service that reduces single-use plastic waste while keeping your Alka Drops supply topped up.",
    image: Card6,
    icon: "refresh",
  },
];

const highlights = [
  { id: 1, icon: "drop", label: "pH 8.5+ alkaline" },
  { id: 2, icon: "shield", label: "Sealed & hygienic" },
  { id: 3, icon: "truck", label: "Free home delivery" },
];

function ServiceIcon({ type, className = "" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (type) {
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 6h11v11H3z" />
          <path d="M14 10h4l3 3v4h-7z" />
          <circle cx="7.5" cy="18" r="2" />
          <circle cx="17.5" cy="18" r="2" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 7v5h-5" />
          <path d="M4 17v-5h5" />
          <path d="M5.6 9a7 7 0 0 1 12-2L20 12" />
          <path d="M18.4 15a7 7 0 0 1-12 2L4 12" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z" />
          <path d="M9 15a3 3 0 0 0 3 3" />
        </svg>
      );
  }
}

export default function Servicewhychooseus() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`service-why-section ${visible ? "service-why-visible" : ""}`}
      ref={sectionRef}
    >
      <span className="service-why-bg service-why-bg-left" aria-hidden="true"></span>
      <span className="service-why-bg service-why-bg-right" aria-hidden="true"></span>

      {/* ================= HEADER ================= */}
      <div className="service-why-header">
        <div className="service-why-eyebrow">
          <ServiceIcon type="drop" />
          <span>Alka Drops Services</span>
        </div>

        <h2 className="service-why-heading">
          Pure Alkaline Water,
          <span> Better Living</span>
        </h2>

        <p className="service-why-subtitle">
          From doorstep delivery to dispensers and refills, Alka Drops brings
          <br className="service-why-desktop-break" />
          freshness, convenience and quality to your everyday life.
        </p>

        <ul className="service-why-highlights">
          {highlights.map((item) => (
            <li key={item.id}>
              <span>
                <ServiceIcon type={item.icon} />
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* ================= CARDS ================= */}
      <div className="service-why-grid">
        {services.map((service, index) => (
          <article
            className="service-why-card"
            key={service.id}
            style={{ "--card-index": index }}
          >
            <div className="service-why-image-wrap">
              <img
                className="service-why-image"
                src={service.image}
                alt={service.title}
                loading="lazy"
              />

              <span className="service-why-tag">{service.tag}</span>

              <div className="service-why-image-icon">
                <ServiceIcon type={service.icon} />
              </div>
            </div>

            <div className="service-why-card-content">
              <h3>{service.title}</h3>

              <p className="service-why-description">{service.description}</p>

              <a className="service-why-read-more" href="/about">
                <span>Read More</span>
                <i>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </i>
              </a>

              <div className="service-why-watermark" aria-hidden="true">
                <ServiceIcon type="drop" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ================= CTA BAND ================= */}
      <div className="service-why-cta">
        <span className="service-why-cta-glow" aria-hidden="true"></span>

        <div className="service-why-cta-badge" aria-hidden="true">
          <small>pH</small>
          <strong>8.5+</strong>
        </div>

        <div className="service-why-cta-text">
          <h3>Ready for fresh Alka Drops at your door?</h3>
          <p>
            Order today and enjoy pure alkaline water with free home delivery.
          </p>
        </div>

        <div className="service-why-cta-actions">
          <a className="service-why-cta-primary" href="/shop">
            Shop Now
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a className="service-why-cta-secondary" href="/contact">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}