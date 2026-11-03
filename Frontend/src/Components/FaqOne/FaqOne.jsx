import React, { useState } from "react";
import "./FaqOne.css";

const PHONE_DISPLAY = "+91 7327092477";
const PHONE_LINK = "tel:+917327092477";
const WHATSAPP_LINK =
  "https://wa.me/917327092477?text=Hi%20Alka%20Drops%2C%20I%20want%20to%20enquire%20about%20water%20jar%20delivery.";

/* ---------- Small inline icons ---------- */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconDrop = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2.7s6.5 6.6 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 9.3 12 2.7 12 2.7z" />
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h11v10H3z" />
    <path d="M14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />
  </svg>
);
const IconTag = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </svg>
);
const IconHome = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.4A8.4 8.4 0 1 1 21 11.5z" />
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

/* ---------- Data ---------- */
const generalFaqs = [
  {
    q: "Which are the best water suppliers in Bhubaneswar for home delivery?",
    a: "Alka Drops provides convenient drinking water delivery in Bhubaneswar for homes, offices, shops, and other regular-use locations. We focus on hygienic 20 litre water jars of pH 8.5+ alkaline water, dependable delivery schedules, and convenient doorstep service for customers in and around Bhubaneswar.",
  },
  {
    q: "Do you provide 20 litre water bottle delivery in Bhubaneswar?",
    a: "Yes. Alka Drops supplies 20 litre drinking water jars for homes and offices. Customers can contact us to know the current 20 litre water bottle price in Bhubaneswar, availability, delivery areas, and subscription options.",
  },
  {
    q: "Do you provide drinking water supply in Bhubaneswar?",
    a: "Yes. We provide drinking water supply for residential and commercial requirements. Whether you need a regular water jar for your home or multiple jars for an office, shop, event, or workplace, our team can help with suitable delivery arrangements.",
  },
  {
    q: "Can I get 20 litre water supply near me with home delivery?",
    a: "Customers looking for 20 litre water supply near me or drinking water supply near me can contact Alka Drops to check service availability in their Bhubaneswar location. We aim to make regular water jar delivery simple and convenient for local customers.",
  },
  {
    q: "Where is Alka Drops located in Bhubaneswar?",
    a: "Alka Drops is located at Plot-N5/22, Main Street, Block N5, IRC Village, Nayapalli, Bhubaneswar, Odisha 751012. Customers can contact us for drinking water supply, 20 litre water jars, delivery availability, and pricing information.",
  },
];

const pricingFaqs = [
  {
    q: "What is the price of a 20 litre water bottle in Bhubaneswar?",
    a: "The 20 litre water bottle price in Bhubaneswar can vary depending on the order type, quantity, delivery location, and applicable jar or service charges. Contact Alka Drops at +91 7327092477 for the latest price and delivery details.",
  },
  {
    q: "Do you offer wholesale mineral water prices for bulk orders?",
    a: "Yes. Customers requiring larger quantities of drinking water can contact Alka Drops for bulk and regular supply requirements. Wholesale pricing may depend on quantity, delivery location, and order frequency.",
  },
  {
    q: "Is there a deposit or additional charge for a 20 litre water jar?",
    a: "Any applicable jar deposit, replacement charge, or delivery-related fee may depend on the order and service arrangement. Please contact our team before placing your order so you can get the latest and most accurate information.",
  },
  {
    q: "How can I start regular drinking water delivery for my home or office?",
    a: "Starting regular water supply is simple. Contact Alka Drops on +91 7327092477, share your location and required quantity, and our team can guide you regarding available delivery schedules, jar requirements, pricing, and subscription arrangements.",
  },
  {
    q: "How can I contact the Bhubaneswar water supply helpline?",
    a: "For Alka Drops drinking water supply enquiries, 20 litre water jar orders, pricing, availability, and delivery support, call +91 7327092477. Our address is Plot-N5/22, Main Street, Block N5, IRC Village, Nayapalli, Bhubaneswar, Odisha 751012.",
  },
];

const highlights = [
  { icon: <IconShield />, title: "Pure & safe drinking water", text: "pH 8.5+ alkaline water in sealed, hygienic packing." },
  { icon: <IconTruck />, title: "Fast & reliable delivery", text: "Doorstep delivery you can count on, every time." },
  { icon: <IconTag />, title: "Affordable pricing", text: "Great value on jars, bottles and cans for every budget." },
  { icon: <IconHome />, title: "Homes & businesses", text: "From family kitchens to busy offices, shops and events." },
];

const stats = [
  { value: "8.5+", label: "Alkaline pH" },
  { value: "20 L", label: "Hygienic jars" },
  { value: "Free", label: "Home delivery" },
];

const FaqOne = () => {
  const [openFaq, setOpenFaq] = useState({ section: null, index: null });

  const toggleAccordion = (section, index) => {
    setOpenFaq((prev) =>
      prev.section === section && prev.index === index
        ? { section: null, index: null }
        : { section, index }
    );
  };

  const renderFaqs = (faqs, section) => (
    <div className="FaqOne-accordion-group">
      {faqs.map((item, index) => {
        const isOpen = openFaq.section === section && openFaq.index === index;
        const id = `${section}-${index}`;

        return (
          <div
            className={`FaqOne-accordion-item ${isOpen ? "FaqOne-open" : ""}`}
            key={id}
          >
            <button
              type="button"
              className="FaqOne-accordion-header"
              onClick={() => toggleAccordion(section, index)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${id}`}
              id={`faq-btn-${id}`}
            >
              <span className="FaqOne-faq-question">{item.q}</span>
              <span
                className={`FaqOne-toggle-icon ${isOpen ? "FaqOne-active" : ""}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <div
              className="FaqOne-accordion-content"
              id={`faq-panel-${id}`}
              role="region"
              aria-labelledby={`faq-btn-${id}`}
            >
              <div className="FaqOne-accordion-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="FaqOne-section">
      {/* ================= SECTION 1: GENERAL ================= */}
      <section className="FaqOne-info-section">
        <div className="FaqOne-info-left-panel">
          <span className="FaqOne-info-eyebrow">
            <span className="FaqOne-eyebrow-dot" />
            Alka Drops • Drinking Water Supply in Bhubaneswar
          </span>

          <h1 className="FaqOne-info-main-heading">
            Best Water Suppliers in Bhubaneswar
            <span className="FaqOne-heading-accent">
              20 Litre Water Jars, Delivered to Your Door
            </span>
          </h1>

          <p className="FaqOne-info-description">
            Looking for reliable drinking water supply in Bhubaneswar? Alka
            Drops provides convenient drinking water and 20 litre water jar
            delivery for homes, offices, shops, workplaces, and regular
            commercial requirements. Our focus is on hygienic pH 8.5+ alkaline
            water, convenient doorstep service, and dependable local delivery.
          </p>

          <p className="FaqOne-info-description">
            If you are searching for water suppliers in Bhubaneswar, 20 litre
            water bottle suppliers in Bhubaneswar, or drinking water supply
            near me home delivery, Alka Drops is available to help you check
            current availability, pricing, and delivery options.
          </p>

          <div className="FaqOne-stats">
            {stats.map((s) => (
              <div className="FaqOne-stat" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          <ul className="FaqOne-info-features-list">
            {[
              "20 Litre Water Jar Supply for Homes & Offices",
              "Convenient Drinking Water Delivery in Bhubaneswar",
              "Regular & Bulk Water Supply Options",
              "Local Customer Support for Orders & Enquiries",
              "Delivery Availability Across Selected Bhubaneswar Locations",
            ].map((f) => (
              <li key={f}>
                <span className="FaqOne-checkmark">
                  <IconCheck />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="FaqOne-btn-row">
            <a href={PHONE_LINK} className="FaqOne-btn FaqOne-btn-primary">
              <IconPhone /> Call Now
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="FaqOne-btn FaqOne-btn-outline"
            >
              <IconChat /> WhatsApp Us
            </a>
          </div>

        </div>

        <div className="FaqOne-info-right-panel">
          <div className="FaqOne-panel-badge" aria-hidden="true">
            <span>pH</span>
            <strong>8.5+</strong>
            <small>ALKALINE</small>
          </div>
          <h2 className="FaqOne-section-title">
            Drinking Water Supply FAQs in Bhubaneswar
          </h2>
          <p className="FaqOne-panel-subtitle">
            Quick answers about our water jars, delivery areas and local
            service.
          </p>
          {renderFaqs(generalFaqs, "general")}
        </div>
      </section>

      <section className="FaqOne-about-band">
        <div className="FaqOne-about-text">
          <h2 className="FaqOne-info-sub-heading">
            Reliable 20 Litre Water Jar Supplier in Bhubaneswar
          </h2>

          <p className="FaqOne-info-sub-description">
            Alka Drops makes it easier for families and businesses to arrange
            regular drinking water supply without the hassle of carrying heavy
            water jars. Our 20 litre jars are suitable for everyday hydration
            requirements at homes, offices, shops, and workplaces.
          </p>

          <p className="FaqOne-info-sub-description">
            For customers searching for a{" "}
            <strong>20 litre water jar supplier near Bhubaneswar</strong>, we
            provide local order support and can help you understand delivery
            availability, pricing, and quantity requirements before placing
            your order.
          </p>

        </div>
          <div className="FaqOne-business-contact-box">
            <h3>Alka Drops – Drinking Water Supply in Bhubaneswar</h3>
            <p>
              <IconPin />
              <span>
                <strong>Address:</strong> Plot-N5/22, Main Street, Block N5, IRC
                Village, Nayapalli, Bhubaneswar, Odisha 751012
              </span>
            </p>
            <p>
              <IconPhone />
              <span>
                <strong>Phone:</strong> <a href={PHONE_LINK}>{PHONE_DISPLAY}</a>
              </span>
            </p>
            <p>
              <IconDrop />
              <span>
                <strong>Service:</strong> 20 Litre Water Jars, Drinking Water
                Supply, Home Delivery &amp; Bulk Water Supply
              </span>
            </p>
          </div>
      </section>

      {/* ================= HIGHLIGHT CARDS ================= */}
      <section className="FaqOne-highlights">
        <div className="FaqOne-highlights-head">
          <span className="FaqOne-info-eyebrow">
            <span className="FaqOne-eyebrow-dot" />
            Why Choose Alka Drops
          </span>
          <h2>Pure Water, Delivered with Care</h2>
          <p>
            Enjoy fresh, hygienic drinking water with a dependable delivery
            service designed around your everyday needs.
          </p>
        </div>

        <div className="FaqOne-highlight-grid">
          {highlights.map((h) => (
            <div className="FaqOne-highlight-card" key={h.title}>
              <span className="FaqOne-highlight-icon">{h.icon}</span>
              <div>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 2: PRICING ================= */}
      <section className="FaqOne-info-section FaqOne-pricing-section">
        <div className="FaqOne-info-left-panel FaqOne-center-btn-panel">
          <span className="FaqOne-info-eyebrow">
            <span className="FaqOne-eyebrow-dot" />
            20 Litre Water Bottle Price in Bhubaneswar
          </span>

          <h2 className="FaqOne-info-main-heading FaqOne-h2-size">
            Affordable Water Jar Supply for{" "}
            <span className="FaqOne-inline-accent">Homes &amp; Businesses</span>
          </h2>

          <p className="FaqOne-info-description">
            Need regular water jars for your home or workplace? Alka Drops
            offers convenient drinking water supply with options suitable for
            individual and bulk requirements. Pricing can vary according to
            quantity, delivery location, and order arrangement.
          </p>

          <p className="FaqOne-info-description">
            If you are comparing the{" "}
            <strong>20 litre water bottle suppliers in Bhubaneswar price</strong>
            , contact our team directly for the latest available rate instead of
            relying on outdated online pricing.
          </p>

          <h3 className="FaqOne-info-sub-heading">
            Water Supply for Homes, Offices &amp; Bulk Requirements
          </h3>

          <p className="FaqOne-info-sub-description">
            From a single household jar to regular office requirements, we can
            help you understand the available supply options. Businesses and
            event organisers can also enquire about bulk drinking water
            requirements and wholesale pricing.
          </p>

          <div className="FaqOne-pricing-contact-card">
            <h3>Order or Enquire About Water Supply</h3>
            <p>
              Call Alka Drops for current pricing, delivery availability, and
              water jar requirements in Bhubaneswar.
            </p>
            <div className="FaqOne-btn-row">
              <a href={PHONE_LINK} className="FaqOne-btn FaqOne-btn-primary">
                <IconPhone /> Call {PHONE_DISPLAY}
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="FaqOne-btn FaqOne-btn-outline"
              >
                <IconChat /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="FaqOne-info-right-panel">
          <h2 className="FaqOne-section-title">
            Pricing, Delivery &amp; Payment FAQs
          </h2>
          <p className="FaqOne-panel-subtitle">
            Everything you need to know before placing your first order.
          </p>
          {renderFaqs(pricingFaqs, "pricing")}
        </div>
      </section>

      {/* ================= SECTION 3: LOCAL SEO ================= */}
      <section className="FaqOne-local-seo-section">
        <h2>Drinking Water &amp; 20 Litre Water Jar Delivery in Bhubaneswar</h2>

        <p>
          Alka Drops serves customers looking for dependable drinking water
          supply in Bhubaneswar. If you need a convenient source of packaged
          drinking water for your home, office, shop, workplace, or regular
          business requirement, our team can help you check suitable delivery
          options.
        </p>

        <p>
          Customers searching online for{" "}
          <strong>packaged drinking water manufacturers in Bhubaneswar</strong>,{" "}
          <strong>packaged drinking water manufacturers in Odisha</strong>, or a{" "}
          <strong>mineral water dealer in Bhubaneswar</strong> can contact Alka
          Drops to understand our available products and local supply
          arrangements.
        </p>

        <p>
          We also cater to customers searching for{" "}
          <strong>wellness best water in Bhubaneswar</strong>,{" "}
          <strong>wellness best drinking water in Bhubaneswar</strong>, and
          dependable drinking water for everyday use. Rather than choosing a
          supplier only on search results, customers can contact us directly to
          confirm current availability, pricing, and delivery coverage.
        </p>

        <p>
          For regular requirements, Alka Drops can also discuss bulk water
          supply and recurring orders. Whether you need a single 20 litre jar
          for your home or multiple jars for an office or event, our team is
          available to assist with your enquiry.
        </p>

        <div className="FaqOne-local-business-details">
          <h3>Contact Alka Drops</h3>
          <p>
            <strong>Alka Drops</strong>
          </p>
          <p>
            Plot-N5/22, Main Street, Block N5, IRC Village, Nayapalli,
            Bhubaneswar, Odisha 751012
          </p>
          <p>
            <strong>Phone:</strong> <a href={PHONE_LINK}>{PHONE_DISPLAY}</a>
          </p>
        </div>
      </section>

      {/* ================= CTA BAND ================= */}
      <section className="FaqOne-cta">
        <div className="FaqOne-cta-text">
          <h2>Ready for Fresh Alkaline Water at Your Door?</h2>
          <p>
            Call or message Alka Drops today to start your regular water jar
            delivery in Bhubaneswar.
          </p>
        </div>
        <div className="FaqOne-cta-actions">
          <a href={PHONE_LINK} className="FaqOne-btn FaqOne-btn-gold">
            <IconPhone /> {PHONE_DISPLAY}
          </a>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="FaqOne-btn FaqOne-btn-ghost"
          >
            <IconChat /> WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default FaqOne;