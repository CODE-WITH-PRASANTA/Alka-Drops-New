import React, { useState, useEffect } from "react";
import "./Team_whywechose.css";
import teamImage from "../../assets/waterbottle_carry_man.png";

const PHONE_LINK = "tel:+917327092477";
const WHATSAPP_LINK =
  "https://wa.me/917327092477?text=Hi%20Alka%20Drops%2C%20I%20want%20to%20enquire%20about%20water%20jar%20delivery.";

/* ---------- Icons ---------- */
const Svg = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const IconShield = () => (
  <Svg>
    <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />
  </Svg>
);
const IconTruck = () => (
  <Svg>
    <path d="M3 6h11v10H3z" />
    <path d="M14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Svg>
);
const IconTag = () => (
  <Svg>
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </Svg>
);
const IconHome = () => (
  <Svg>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </Svg>
);
const IconDrop = () => (
  <Svg>
    <path d="M12 2.7s6.5 6.6 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 9.3 12 2.7 12 2.7z" />
  </Svg>
);

const features = [
  {
    icon: <IconShield />,
    title: "Pure & Safe Water",
    text: "pH 8.5+ alkaline drinking water in sealed, hygienic 20 litre jars.",
  },
  {
    icon: <IconTruck />,
    title: "Reliable Doorstep Delivery",
    text: "Dependable delivery schedules for homes, offices and shops.",
  },
  {
    icon: <IconTag />,
    title: "Affordable for Everyone",
    text: "Great value on regular and bulk water supply in Bhubaneswar.",
  },
  {
    icon: <IconHome />,
    title: "Homes & Businesses",
    text: "From family kitchens to busy offices, events and workplaces.",
  },
];

const Team_whywechose = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="team-why-section">
      <div className="team-why-container">
        {/* LEFT IMAGE */}
        <div className="team-why-image-wrapper">
          <div className="team-why-image-frame">
            <img
              src={teamImage}
              alt="Alka Drops water delivery professional carrying a 20 litre water jar"
              className="team-why-image"
              loading="lazy"
            />
          </div>

          {/* pH BADGE */}
          <div className="team-ph-badge" aria-hidden="true">
            <span>pH</span>
            <strong>8.5+</strong>
            <small>ALKALINE</small>
          </div>

          {/* INFO BADGE */}
          <div className="team-experience-badge">
            <span className="team-experience-icon">
              <IconDrop />
            </span>
            <span className="team-experience-text">
              <strong>Free Home Delivery</strong>
              <small>Fresh to your doorstep</small>
            </span>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="team-why-content">
          <span className="team-why-subtitle">
            <span className="team-why-dot" />
            Why Choose Alka Drops
          </span>

          <h2 className="team-why-heading">
            A Trusted Name In
            <br className="team-desktop-break" />
            <span className="team-why-accent">Drinking Water Supply</span>
          </h2>

          <p className="team-why-description">
            At Alka Drops, we believe that clean and safe drinking water should
            be accessible to everyone. Our delivery service brings quality pH
            8.5+ alkaline water directly to your doorstep with care,
            convenience, and reliability.
          </p>

          <p className="team-why-description">
            Whether you need a single 20 litre jar for your home or regular
            supply for an office, shop or event in Bhubaneswar, our local team
            is ready to help.
          </p>

          {/* FEATURE CARDS */}
          <div className="team-feature-grid">
            {features.map((item) => (
              <div className="team-feature-card" key={item.title}>
                <span className="team-feature-icon">{item.icon}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="team-why-actions">
            <a href={PHONE_LINK} className="team-btn team-btn-primary">
              Call Now
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="team-btn team-btn-outline"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

     
    </section>
  );
};

export default Team_whywechose;