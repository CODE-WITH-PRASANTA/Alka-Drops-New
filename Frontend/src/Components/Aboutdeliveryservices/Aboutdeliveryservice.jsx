import React, { useEffect, useRef, useState } from "react";
import {
  FiDroplet,
  FiShield,
  FiTruck,
  FiTag,
  FiHome,
  FiPhone,
  FiArrowRight,
} from "react-icons/fi";
import Boylend from "../../assets/boylendwater.jpeg";
import Ladywater from "../../assets/Drinking_water.jpeg";

import "./Aboutservicedelivery.css";

const PHONE = "+91 7327092477";
const PHONE_LINK = `tel:${PHONE.replace(/\s/g, "")}`;
const ORDER_LINK = "#our-products"; // scrolls to your products section

const features = [
  {
    icon: FiShield,
    title: "Pure and safe drinking water",
    text: "pH 8.5+ alkaline water in sealed, hygienic packing.",
  },
  {
    icon: FiTruck,
    title: "Fast and reliable delivery",
    text: "Free doorstep delivery you can count on, every time.",
  },
  {
    icon: FiTag,
    title: "Affordable pricing for everyone",
    text: "Great value on jars, bottles and cans.",
  },
  {
    icon: FiHome,
    title: "Available for homes and businesses",
    text: "From family kitchens to busy offices.",
  },
];

const Aboutdeliveryservice = () => {
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
      className={`delivery-about ${isVisible ? "delivery-about--visible" : ""}`}
      aria-labelledby="delivery-about-title"
    >
      {/* Background decoration */}
      <div className="delivery-about-bg" aria-hidden="true">
        <span className="delivery-about-orb delivery-about-orb-one" />
        <span className="delivery-about-orb delivery-about-orb-two" />
      </div>

      <div className="delivery-about-container">
        {/* Left Image Composition */}
        <div className="delivery-about-visual">
          {/* Dotted decoration */}
          <span className="delivery-dots delivery-dots-top" aria-hidden="true"></span>
          <span className="delivery-dots delivery-dots-bottom" aria-hidden="true"></span>

          {/* Decorative Blue Outlines */}
          <div className="delivery-outline delivery-outline-top"></div>
          <div className="delivery-outline delivery-outline-bottom"></div>

          {/* Top Image */}
          <div className="delivery-image delivery-image-top">
            <img
              src={Ladywater}
              alt="Fresh drinking water in a clear glass"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Bottom Image */}
          <div className="delivery-image delivery-image-bottom">
            <img
              src={Boylend}
              alt="Alka Drops delivery partner handing over a water jar"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Center Water Icon */}
          <div className="delivery-water-icon" role="img" aria-label="Clean water">
            <span className="delivery-water-ring delivery-water-ring-one" aria-hidden="true"></span>
            <span className="delivery-water-ring delivery-water-ring-two" aria-hidden="true"></span>
            <FiDroplet />
          </div>

          {/* Floating pH badge */}
          <div className="delivery-ph-badge">
            <small>pH</small>
            <strong>8.5+</strong>
            <span>Alkaline</span>
          </div>

          {/* Floating delivery chip */}
          <div className="delivery-chip">
            <span className="delivery-chip-icon" aria-hidden="true">
              <FiTruck />
            </span>
            <span className="delivery-chip-text">
              <strong>Free Home Delivery</strong>
              <small>Fresh to your doorstep</small>
            </span>
          </div>
        </div>

        {/* Right Text Content */}
        <div className="delivery-about-content">
          <span className="delivery-eyebrow">
            <span className="delivery-eyebrow-line"></span>
            ABOUT OUR DELIVERY SERVICE
          </span>

          <h2 className="delivery-heading" id="delivery-about-title">
            Pure Water Delivered
            <br />
            <span>Right to Your Door</span>
          </h2>

          <p className="delivery-description">
            At Alka Drops, we believe that clean and safe drinking water
            should be accessible to everyone. Our delivery service brings
            quality pH 8.5+ alkaline water directly to your doorstep with
            care, convenience, and reliability.
          </p>

          {/* Highlight Box */}
          <div className="delivery-highlight">
            <span className="delivery-highlight-line"></span>

            <span className="delivery-highlight-icon" aria-hidden="true">
              <FiDroplet />
            </span>

            <p>
              Enjoy fresh, hygienic drinking water with a dependable
              delivery service designed around your everyday needs.
            </p>
          </div>

          {/* Feature Checklist */}
          <ul className="delivery-feature-list">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <li
                  key={feature.title}
                  className="delivery-feature"
                  style={{ transitionDelay: `${0.45 + index * 0.1}s` }}
                >
                  <span className="delivery-feature-icon" aria-hidden="true">
                    <Icon />
                  </span>

                  <span className="delivery-feature-text">
                    <strong>{feature.title}</strong>
                    <small>{feature.text}</small>
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Call to action */}
          <div className="delivery-actions">
            <a className="delivery-button delivery-button-primary" href={ORDER_LINK}>
              <span>Order Water Now</span>
              <FiArrowRight />
            </a>

            <a className="delivery-button delivery-button-outline" href={PHONE_LINK}>
              <FiPhone />
              <span>{PHONE}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Aboutdeliveryservice;