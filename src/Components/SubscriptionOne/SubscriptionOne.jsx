
import React, { useState } from "react";
import {
  FaCheckCircle,
  FaWater,
  FaTruck,
  FaRecycle,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaShieldAlt,
} from "react-icons/fa";

import "./SubscriptionOne.css";

const businessNAP = {
  name: "Alka Drops",
  phone: "+917327092477",
  displayPhone: "+91 7327092477",
  address: {
    street: "Plot-N5/22, Main Street, Block N5, IRC Village, Nayapalli",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
    country: "India",
  },
};

const subscriptionPlans = [
  {
    id: "basic",
    title: "Basic Plan",
    subtitle: "*Home & Small Families",
    price: "1,499",
    period: "MO",
    description:
      "Ideal 20 litre water supply home delivery package designed for small households in Bhubaneswar.",
    features: [
      { text: "Free Doorstep Delivery", icon: <FaTruck /> },
      { text: "Max 10 Bottles / Month (20L)", icon: <FaWater /> },
      { text: "Empty Bottle Pickup", icon: <FaRecycle /> },
      { text: "Max 120 Bottles / Year", icon: <FaWater /> },
      { text: "Mineral Wellness Water", icon: <FaCheckCircle /> },
    ],
    featured: false,
  },
  {
    id: "premium",
    title: "Premium Plan",
    subtitle: "*BEST VALUE ANNUAL SUBSCRIPTION",
    price: "2,999",
    period: "YR",
    description:
      "Premium mineral water supply with enriched alkalinity and essential minerals for total wellness.",
    features: [
      { text: "Free Express Delivery", icon: <FaTruck /> },
      { text: "Max 10 Bottles / Month (20L)", icon: <FaWater /> },
      { text: "Empty Bottle Pickup", icon: <FaRecycle /> },
      { text: "Max 120 Bottles / Year", icon: <FaWater /> },
      { text: "Mineral Wellness Water", icon: <FaCheckCircle /> },
    ],
    featured: true,
  },
  {
    id: "advanced",
    title: "Advanced Plan",
    subtitle: "*Workplaces, Gyms & Studios",
    price: "2,199",
    period: "MO",
    description:
      "High-demand drinking water supply for corporate offices, gyms, and commercial centers across Bhubaneswar.",
    features: [
      { text: "Priority Free Delivery", icon: <FaTruck /> },
      { text: "Max 15 Bottles / Month (20L)", icon: <FaWater /> },
      { text: "Empty Bottle Pickup", icon: <FaRecycle /> },
      { text: "Flexible Bottle Replacements", icon: <FaRecycle /> },
      { text: "Certified Pure Mineral Water", icon: <FaCheckCircle /> },
    ],
    featured: false,
  },
];

const SubscriptionOne = () => {
  const [flippedCards, setFlippedCards] = useState({});

  const toggleCardFlip = (id, featured) => {
    if (featured) return;

    setFlippedCards((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const handleCardKeyDown = (event, id, featured) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCardFlip(id, featured);
    }
  };

  return (
    <section className="SubscriptionOne-section">

      {/* HEADER */}
      <header className="SubscriptionOne-header">
        <span className="SubscriptionOne-tagline">
          Pure • Mineral-Rich • Doorstep Delivery
        </span>

        <h1 className="SubscriptionOne-main-title">
          <span className="SubscriptionOne-title-primary">
            Best Water Suppliers in Bhubaneswar
          </span>

          <span className="SubscriptionOne-title-secondary">
            20 Litre Water Bottle Subscription Plans & Pricing
          </span>
        </h1>

        <p className="SubscriptionOne-lead-text">
          Looking for a dependable drinking water supply with home delivery?
          Alka Drops provides quality mineral wellness water directly to homes,
          gyms, and workplaces at transparent prices.
        </p>
      </header>

      {/* SUBSCRIPTION PLANS */}
      <div className="SubscriptionOne-container">

        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`SubscriptionOne-card ${
              plan.featured
                ? "SubscriptionOne-featured-card"
                : "SubscriptionOne-standard-card"
            } ${flippedCards[plan.id] ? "is-flipped" : ""}`}
            onClick={() =>
              toggleCardFlip(plan.id, plan.featured)
            }
            onKeyDown={(event) =>
              handleCardKeyDown(event, plan.id, plan.featured)
            }
            role={plan.featured ? undefined : "button"}
            tabIndex={plan.featured ? undefined : 0}
            aria-label={
              plan.featured
                ? plan.title
                : `${plan.title}. Activate to see plan features.`
            }
            aria-pressed={
              plan.featured ? undefined : !!flippedCards[plan.id]
            }
          >
            <div className="SubscriptionOne-card-inner">

              {/* FRONT SIDE */}
              <div className="SubscriptionOne-card-front">

                <div className="SubscriptionOne-price-ring-container">
                  <div className="SubscriptionOne-price-outer-ring">
                    <div className="SubscriptionOne-price-bubble">
                      <span className="SubscriptionOne-currency-symbol">
                        ₹
                      </span>

                      <span className="SubscriptionOne-price-amount">
                        {plan.price}
                      </span>

                      <div className="SubscriptionOne-period-badge">
                        {plan.period}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="SubscriptionOne-card-heading">
                  <h3 className="SubscriptionOne-card-title">
                    {plan.title}
                  </h3>

                  <span className="SubscriptionOne-card-subtitle">
                    {plan.subtitle}
                  </span>
                </div>

                {plan.featured ? (
                  <ul className="SubscriptionOne-feature-list">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="SubscriptionOne-feature-item"
                      >
                        <span className="SubscriptionOne-feat-icon">
                          {feature.icon}
                        </span>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="SubscriptionOne-card-middle">
                    <p className="SubscriptionOne-card-description">
                      {plan.description}
                    </p>

                    <span className="SubscriptionOne-flip-hint">
                      Hover or tap to explore features
                    </span>
                  </div>
                )}

                <a
                  href={`tel:${businessNAP.phone}`}
                  className="SubscriptionOne-order-btn"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span>Order Now</span>
                  <span className="SubscriptionOne-order-btn-accent">
                    <FaPhoneAlt />
                  </span>
                </a>

              </div>

              {/* BACK SIDE - STANDARD CARDS */}
              {!plan.featured && (
                <div className="SubscriptionOne-card-back">

                  <div className="SubscriptionOne-price-ring-container">
                    <div className="SubscriptionOne-price-outer-ring variant-blue">
                      <div className="SubscriptionOne-price-bubble variant-blue">
                        <span className="SubscriptionOne-currency-symbol">
                          ₹
                        </span>

                        <span className="SubscriptionOne-price-amount">
                          {plan.price}
                        </span>

                        <div className="SubscriptionOne-period-badge">
                          {plan.period}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="SubscriptionOne-card-heading">
                    <h3 className="SubscriptionOne-card-title text-white">
                      {plan.title}
                    </h3>

                    <span className="SubscriptionOne-card-subtitle text-lightblue">
                      {plan.subtitle}
                    </span>
                  </div>

                  <ul className="SubscriptionOne-feature-list">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="SubscriptionOne-feature-item"
                      >
                        <span className="SubscriptionOne-feat-icon text-white">
                          {feature.icon}
                        </span>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`tel:${businessNAP.phone}`}
                    className="SubscriptionOne-order-btn variant-light"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <span>Order Now</span>
                    <span className="SubscriptionOne-order-btn-accent">
                      <FaPhoneAlt />
                    </span>
                  </a>

                </div>
              )}

            </div>
          </div>
        ))}

      </div>

      {/* INFORMATION SECTION */}
      <div className="SubscriptionOne-info-block">

        <div className="SubscriptionOne-info-heading">
          <span>WHY CHOOSE US</span>
          <h2>Pure Water. Better Living.</h2>
          <p>
            Enjoy convenient water delivery with quality, reliability,
            and customer-focused service.
          </p>
        </div>

        <div className="SubscriptionOne-info-grid">

          <div className="SubscriptionOne-info-box">
            <FaShieldAlt className="SubscriptionOne-info-icon" />

            <h2 className="SubscriptionOne-info-heading-box">
              Quality Mineral Drinking Water
            </h2>

            <p>
              We focus on delivering quality drinking water through
              careful purification and quality checks for your everyday
              hydration needs.
            </p>
          </div>

          <div className="SubscriptionOne-info-box">
            <FaTruck className="SubscriptionOne-info-icon" />

            <h2 className="SubscriptionOne-info-heading-box">
              Prompt 20 Litre Water Jar Delivery
            </h2>

            <p>
              Get convenient scheduled and on-demand doorstep delivery
              across Nayapalli, IRC Village, and surrounding areas
              of Bhubaneswar.
            </p>
          </div>

        </div>

        {/* BUSINESS CONTACT */}
        <footer className="SubscriptionOne-nap-container">

          <div className="SubscriptionOne-nap-item">
            <span className="SubscriptionOne-nap-label">
              Business:
            </span>
            <span>{businessNAP.name}</span>
          </div>

          <div className="SubscriptionOne-nap-item">
            <FaMapMarkerAlt />

            <span>
              {businessNAP.address.street},{" "}
              {businessNAP.address.city},{" "}
              {businessNAP.address.state} -{" "}
              {businessNAP.address.postalCode}
            </span>
          </div>

          <div className="SubscriptionOne-nap-item">
            <FaPhoneAlt />

            <span>
              Helpline:{" "}
              <a href={`tel:${businessNAP.phone}`}>
                {businessNAP.displayPhone}
              </a>
            </span>
          </div>

        </footer>

      </div>

    </section>
  );
};

export default SubscriptionOne;
