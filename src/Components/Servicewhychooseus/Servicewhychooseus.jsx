import React, { useEffect, useRef, useState } from "react";
import Card1 from'../../assets/card1.jpg';
import Card2 from'../../assets/card2.jpg';
import Card3 from'../../assets/card3.jpg';
import Card4 from'../../assets/card4.jpg';
import Card5 from'../../assets/card5.jpg';
import Card6 from'../../assets/card6.jpg';

import "./Servicewhychooseus.css";

const services = [
  {
    id: 1,
    title: "Bottled Water Delivery",
    description:
      "Enjoy fresh, purified drinking water delivered directly to your doorstep. Our reliable service makes staying hydrated simple and convenient.",
    image:
      Card1,
    icon: "drop",
  },
  {
    id: 2,
    title: "Water Dispenser Solutions",
    description:
      "Discover convenient water dispenser solutions for homes and offices, designed to make accessing clean drinking water easier every day.",
    image:
      Card2,
    icon: "drop",
  },
  {
    id: 3,
    title: "Fast Home Delivery",
    description:
      "Get your drinking water when you need it. Our delivery team focuses on dependable service, convenient scheduling, and timely arrivals.",
    image:
      Card3,
    icon: "truck",
  },
  {
    id: 4,
    title: "Water Quality Testing",
    description:
      "Water quality matters. Explore our water quality testing service to learn more about water safety and the importance of regular checks.",
    image:
      Card4,
    icon: "shield",
  },
  {
    id: 5,
    title: "Water Purification",
    description:
      "Discover purification solutions designed to help improve drinking water quality and support cleaner, better-tasting water for everyday use.",
    image:
      Card5,
    icon: "check",
  },
  {
    id: 6,
    title: "Bottle Refill Service",
    description:
      "Choose a convenient bottle refill service that helps reduce single-use plastic waste while keeping your drinking water supply replenished.",
    image:
      Card6,
    icon: "refresh",
  },
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

    if (!section) return;

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
      <div className="service-why-header">
        <div className="service-why-eyebrow">
          <ServiceIcon type="drop" />
          <span>OUR WATER SERVICES</span>
        </div>

        <h2 className="service-why-heading">
          Pure Water, <span>Better Living</span>
        </h2>

        <p className="service-why-subtitle">
          Discover reliable water solutions designed to bring freshness,
          <br className="service-why-desktop-break" />
          convenience, and quality to your everyday life.
        </p>

        <div className="service-why-divider">
          <span></span>
          <ServiceIcon type="drop" />
          <span></span>
        </div>
      </div>

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

              <div className="service-why-image-icon">
                <ServiceIcon type={service.icon} />
              </div>
            </div>

            <div className="service-why-card-content">
              <div className="service-why-card-heading">
                <div className="service-why-small-icon">
                  <ServiceIcon type={service.icon} />
                </div>

                <h3>{service.title}</h3>
              </div>

              <p className="service-why-description">
                {service.description}
              </p>

              <a className="service-why-read-more" href="/about">
                Read More
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>

              <div className="service-why-watermark" aria-hidden="true">
                <ServiceIcon type="drop" />
              </div>
            </div>
          </article>
        ))}
      </div>


    </section>
  );
}