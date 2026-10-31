import React from "react";
import Cleanbottle from "../../assets/clean_bottles.jpeg";
import "./Aboutexperiencework.css";

const Aboutexperiencework = () => {
  const features = [
    "Consectetur adipisicing elit",
    "Eiusmod tempor incididunt",
    "Exercitation ullamco laboris",
    "Aolore magna aliqua",
  ];

  return (
    <section className="experience-section">
      {/* LEFT BLUE CONTENT PANEL */}
      <div className="experience-content">
        <div className="experience-map-pattern" aria-hidden="true" />

        <div className="experience-inner">
          <h2 className="experience-heading">
            Experienced Workers
          </h2>

          <p className="experience-description">
            Aliquam faucibus, odio nec commodo aliquam, neque felis
            placerat dui, a porta ante lectus dapibus est. Aliquam a
            bibendum mi, sed condimentum.
          </p>

          <ul className="experience-features">
            {features.map((feature) => (
              <li key={feature}>
                <span className="experience-check" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="m6.5 10 2.2 2.2 4.8-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <a href="/services" className="experience-read-more">
            Read More
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* RIGHT WATER BOTTLE IMAGE */}
      <div className="experience-image">
        <img
          src={Cleanbottle}
          alt="Bottled drinking water"
          loading="lazy"
        />
      </div>

      {/* BACK TO TOP BUTTON */}
      <button
        className="experience-back-to-top"
        type="button"
        aria-label="Back to top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      >
        ↑
      </button>
    </section>
  );
};

export default Aboutexperiencework;