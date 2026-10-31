import React from "react";
import { FiDroplet, FiCheckCircle } from "react-icons/fi";
import Boylend from '../../assets/boylendwater.jpeg';
import Ladywater from '../../assets/Drinking_water.jpeg';

import "./Aboutservicedelivery.css";

const Aboutdeliveryservice = () => {
  const features = [
    "Pure and safe drinking water",
    "Fast and reliable delivery",
    "Affordable pricing for everyone",
    "Available for homes and businesses",
  ];

  return (
    <section className="delivery-about">
      <div className="delivery-about-container">
        {/* Left Image Composition */}
        <div className="delivery-about-visual">
          {/* Decorative Blue Outlines */}
          <div className="delivery-outline delivery-outline-top"></div>
          <div className="delivery-outline delivery-outline-bottom"></div>

          {/* Top Image */}
          <div className="delivery-image delivery-image-top">
            <img
              src={Ladywater}
              alt="Fresh drinking water in a clear glass"
              loading="lazy"
            />
          </div>

          {/* Bottom Image */}
          <div className="delivery-image delivery-image-bottom">
            <img
              src={Boylend}
              alt="Clean water delivery service"
              loading="lazy"
            />
          </div>

          {/* Center Water Icon */}
          <div className="delivery-water-icon" aria-label="Clean water">
            <FiDroplet />
          </div>
        </div>

        {/* Right Text Content */}
        <div className="delivery-about-content">
          <span className="delivery-eyebrow">
            ABOUT OUR DELIVERY SERVICE
          </span>

          <h2 className="delivery-heading">
            Pure Water Delivered
            <br />
            Right to Your Door
          </h2>

          <p className="delivery-description">
            At Alka Drops, we believe that clean and safe drinking water
            should be accessible to everyone. Our delivery service brings
            quality drinking water directly to your doorstep with care,
            convenience, and reliability.
          </p>

          {/* Highlight Box */}
          <div className="delivery-highlight">
            <span className="delivery-highlight-line"></span>

            <p>
              Enjoy fresh, hygienic drinking water with a dependable
              delivery service designed around your everyday needs.
            </p>
          </div>

          {/* Feature Checklist */}
          <ul className="delivery-feature-list">
            {features.map((feature, index) => (
              <li key={index}>
                <FiCheckCircle className="delivery-check-icon" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Aboutdeliveryservice;