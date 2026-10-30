import React, { useState, useEffect, useRef } from "react";
import "./HomeWhyChoose.css";

import whyChoose1 from "../../assets/whychoose-1.png";
import whyChoose2 from "../../assets/whychoose-2.png";
import whyChoose3 from "../../assets/whychoose-3.jpg";

const features = [
  {
    id: 1,
    number: "01",
    tag: "PURE BY NATURE",
    title: "Quality You Can Trust",
    image: whyChoose1,
    imageAlt: "Family enjoying drinking water together",
    description:
      "At Alka Drops, we believe that every drop matters. Our focus is on delivering bottled drinking water with attention to quality, hygiene, and freshness.",
    details:
      "From careful handling to secure packaging, we aim to make quality drinking water a dependable part of your everyday routine. Always check the product label for applicable quality and safety information.",
    icon: "quality",
  },
  {
    id: 2,
    number: "02",
    tag: "EVERYDAY HYDRATION",
    title: "Discover Alkaline Water",
    image: whyChoose2,
    imageAlt: "Bottled water delivery for everyday use",
    description:
      "Explore Alka Drops alkaline water and make hydration a simple part of your daily lifestyle. Enjoy a refreshing drinking experience at home, at work, or on the go.",
    details:
      "Alkaline water is characterized by a pH above 7. Its mineral composition and pH can vary by product, so refer to the bottle label for the specific details of your Alka Drops water.",
    icon: "water",
  },
  {
    id: 3,
    number: "03",
    tag: "MADE FOR YOUR DAY",
    title: "Refreshment, Anywhere",
    image: whyChoose3,
    imageAlt: "Woman drinking refreshing bottled water outdoors",
    description:
      "Whether you are working, travelling, exercising, or spending time with family, Alka Drops offers a convenient way to keep drinking water close at hand.",
    details:
      "Choose the bottle size that suits your needs, keep drinking water accessible throughout your day, and follow the storage instructions printed on the product packaging.",
    icon: "refresh",
  },
];

const highlights = ["Pure", "Healthy", "Refreshing", "pH 8.5+"];

const renderIcon = (type) => {
  if (type === "quality") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="home-why-choose__icon-svg">
        <path d="M24 4L39 10V21C39 31 32.5 39 24 44C15.5 39 9 31 9 21V10L24 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 23L21.5 28.5L32 17.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "water") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="home-why-choose__icon-svg">
        <path d="M24 4C24 4 12 18 12 27C12 33.63 17.37 39 24 39C30.63 39 36 33.63 36 27C36 18 24 4 24 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 28C18 31.3 20.7 34 24 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 43H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="home-why-choose__icon-svg">
      <path d="M38 17C35 10 27 6 19 8C11 10 6 18 8 26C10 34 18 39 26 37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 8H39V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 18V29M19 24L24 29L29 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 43H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

const HomeWhyChoose = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  // Reveal animation when the section scrolls into view
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const toggleReadMore = (id) => {
    setExpandedCard((current) => (current === id ? null : id));
  };

  return (
    <section
      ref={sectionRef}
      className={`home-why-choose ${visible ? "home-why-choose--visible" : ""}`}
      id="why-choose-us"
      aria-labelledby="home-why-choose-title"
    >
      {/* Decorative background */}
      <div className="home-why-choose__bg" aria-hidden="true">
        <span className="home-why-choose__orb home-why-choose__orb--one" />
        <span className="home-why-choose__orb home-why-choose__orb--two" />
        <span className="home-why-choose__orb home-why-choose__orb--three" />
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className={`home-why-choose__bubble home-why-choose__bubble--${i + 1}`}
          />
        ))}
      </div>

      <div className="home-why-choose__container">
        {/* Section Heading */}
        <div className="home-why-choose__heading">
          <span className="home-why-choose__eyebrow">
            <span className="home-why-choose__eyebrow-line"></span>
            WHY CHOOSE ALKA DROPS
            <span className="home-why-choose__eyebrow-line"></span>
          </span>

          <h2 className="home-why-choose__title" id="home-why-choose-title">
            A Trusted Choice for
            <span> Everyday Hydration</span>
          </h2>

          <p className="home-why-choose__subtitle">
            Discover our approach to drinking water, thoughtful quality
            practices, and refreshing hydration with Alka Drops.
          </p>

          <div className="home-why-choose__pills">
            {highlights.map((item) => (
              <span className="home-why-choose__pill" key={item}>
                <i />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="home-why-choose__grid">
          {features.map((feature, index) => {
            const isExpanded = expandedCard === feature.id;

            return (
              <article
                className={`home-why-choose__card ${
                  isExpanded ? "home-why-choose__card--expanded" : ""
                }`}
                key={feature.id}
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                {/* Image */}
                <div className="home-why-choose__image-wrapper">
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="home-why-choose__image"
                    loading="lazy"
                    decoding="async"
                  />

                  <span className="home-why-choose__number">{feature.number}</span>

                  <span className="home-why-choose__image-tag">
                    <i />
                    {feature.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="home-why-choose__content">
                  <div className="home-why-choose__icon">
                    {renderIcon(feature.icon)}
                  </div>

                  <span className="home-why-choose__card-label">ALKA DROPS</span>

                  <h3 className="home-why-choose__card-title">{feature.title}</h3>

                  <p className="home-why-choose__description">
                    {feature.description}
                  </p>

                  <div
                    className={`home-why-choose__details ${
                      isExpanded ? "home-why-choose__details--visible" : ""
                    }`}
                    id={`why-choose-details-${feature.id}`}
                    aria-hidden={!isExpanded}
                  >
                    <p>{feature.details}</p>
                  </div>

                  <div className="home-why-choose__footer">
                    <span className="home-why-choose__footer-mark">
                      <span></span>
                      Pure. Fresh. Everyday.
                    </span>

                    <button
                      type="button"
                      className={`home-why-choose__read-more ${
                        isExpanded ? "home-why-choose__read-more--active" : ""
                      }`}
                      onClick={() => toggleReadMore(feature.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`why-choose-details-${feature.id}`}
                    >
                      <span>{isExpanded ? "Read Less" : "Read More"}</span>

                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="home-why-choose__arrow">
                        {isExpanded ? (
                          <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <span className="home-why-choose__corner"></span>
                <span className="home-why-choose__card-line"></span>
              </article>
            );
          })}
        </div>

       
      </div>
    </section>
  );
};

export default HomeWhyChoose;