import React, { useEffect, useRef, useState } from "react";
import "./ContactMain.css";

const CONTACT_INFO = {
  company: "Alka Drops",
  phone: "+91 7327092477",
  email: "support@alkadrops.com",
  address:
    "Plot-N5/22, Main Street, Block N5, IRC Village, Nayapalli, Bhubaneswar, Odisha 751012",
};

const PHONE_LINK = `tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`;
const WHATSAPP_LINK = `https://wa.me/${CONTACT_INFO.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
  "Hello Alka Drops, I would like to know more about your alkaline water."
)}`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACT_INFO.address
)}`;

const INTERESTS = [
  "20L Water Jar",
  "1L Alkaline Bottles",
  "5L Water Can",
  "Something else",
];

const HIGHLIGHTS = [
  "Free home delivery",
  "pH 8.5+ alkaline water",
  "Sealed and hygienic packing",
  "Jars, bottles and cans for homes and offices",
];

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ContactMain = () => {
  const sectionRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    subject: "",
    message: "",
  });

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
      { threshold: 0.05 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const clearStatus = () => {
    if (formStatus.message) setFormStatus({ type: "", message: "" });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    clearStatus();
  };

  const handleInterest = (value) => {
    setFormData((previous) => ({
      ...previous,
      interest: previous.interest === value ? "" : value,
    }));
    clearStatus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormStatus({ type: "", message: "" });

    try {
      /*
       * Frontend-only behavior: opens the visitor's email app with the
       * enquiry filled in. Connect your backend API here to store enquiries.
       */
      const subject = encodeURIComponent(
        formData.subject.trim() || `Website enquiry from ${formData.name.trim()}`
      );

      const body = encodeURIComponent(
        `Name: ${formData.name.trim()}\n` +
          `Email: ${formData.email.trim()}\n` +
          `Phone: ${formData.phone.trim() || "Not provided"}\n` +
          `Interested in: ${formData.interest || "Not specified"}\n\n` +
          `Message:\n${formData.message.trim()}`
      );

      window.location.href = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;

      setFormStatus({
        type: "success",
        message:
          "Your email app should open with your enquiry filled in. Press send there to complete your request.",
      });
    } catch {
      setFormStatus({
        type: "error",
        message: "Something went wrong. Please call or email us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickCards = [
    {
      title: "Visit Us",
      description: CONTACT_INFO.address,
      href: MAP_LINK,
      linkText: "Get directions",
      external: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 10C20 16 12 22 12 22S4 16 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      ),
    },
    {
      title: "Call Us",
      description: CONTACT_INFO.phone,
      href: PHONE_LINK,
      linkText: "Call now",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7.1 3.5H4.7a1.7 1.7 0 0 0-1.7 1.8c.6 8.2 7.1 14.7 15.3 15.3a1.7 1.7 0 0 0 1.8-1.7v-2.4l-4.2-2-2.1 2.1a14 14 0 0 1-6.9-6.9L9 7.6 7.1 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Email Us",
      description: CONTACT_INFO.email,
      href: `mailto:${CONTACT_INFO.email}`,
      linkText: "Send an email",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2.5" y="4.5" width="19" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="m3.5 6 8.5 7 8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <main
      className={`contact-main ${isVisible ? "contact-main--visible" : ""}`}
      ref={sectionRef}
    >
      {/* HERO */}
      <section className="contact-main__hero">
        <div className="contact-main__hero-bg" aria-hidden="true">
          <span className="contact-main__hero-circle contact-main__hero-circle--one" />
          <span className="contact-main__hero-circle contact-main__hero-circle--two" />
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={`contact-main__bubble contact-main__bubble--${i + 1}`}
            />
          ))}
        </div>

        <div className="contact-main__intro">
          <span className="contact-main__eyebrow">
            <span className="contact-main__eyebrow-line" />
            GET IN TOUCH
            <span className="contact-main__eyebrow-line" />
          </span>

          <h1 className="contact-main__page-title">
            Let's Start a <span>Conversation</span>
          </h1>

          <p className="contact-main__page-description">
            Have a question about Alka Drops, our bottled drinking water or our
            alkaline water options? Tell us what you need and we will help you
            find the right pack.
          </p>
        </div>
      </section>

      {/* QUICK CONTACT CARDS */}
      <section className="contact-main__quick" aria-label="Quick contact options">
        {quickCards.map((card, index) => (
          <a
            className="contact-main__quick-card"
            key={card.title}
            href={card.href}
            target={card.external ? "_blank" : undefined}
            rel={card.external ? "noopener noreferrer" : undefined}
            style={{ "--contact-main-delay": `${0.15 + index * 0.12}s` }}
          >
            <span className="contact-main__quick-icon">{card.icon}</span>

            <span className="contact-main__quick-text">
              <span className="contact-main__quick-title">{card.title}</span>
              <span className="contact-main__quick-description">{card.description}</span>
              <span className="contact-main__quick-link">
                {card.linkText}
                <ArrowIcon />
              </span>
            </span>
          </a>
        ))}
      </section>

      {/* FORM + SIDE PANEL */}
      <section className="contact-main__section" aria-label="Contact Alka Drops">
        <div className="contact-main__card">
          {/* Form */}
          <div className="contact-main__form-section">
            <div className="contact-main__form-heading">
              <span className="contact-main__section-label">SEND US A MESSAGE</span>

              <h2 className="contact-main__form-title">
                Request A <span>Quote</span>
              </h2>

              <p className="contact-main__form-subtitle">
                Fill in the form and our team will get back to you with the
                details you need.
              </p>
            </div>

            <form className="contact-main__form" onSubmit={handleSubmit}>
              <fieldset className="contact-main__interest">
                <legend className="contact-main__label">I am interested in</legend>

                <div className="contact-main__chips">
                  {INTERESTS.map((item) => {
                    const selected = formData.interest === item;
                    return (
                      <button
                        type="button"
                        key={item}
                        className={`contact-main__chip ${
                          selected ? "contact-main__chip--selected" : ""
                        }`}
                        aria-pressed={selected}
                        onClick={() => handleInterest(item)}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="contact-main__form-grid">
                <div className="contact-main__field">
                  <label className="contact-main__label" htmlFor="contact-main-name">
                    Your Name <span>*</span>
                  </label>
                  <input
                    className="contact-main__input"
                    id="contact-main-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="contact-main__field">
                  <label className="contact-main__label" htmlFor="contact-main-email">
                    Your Email <span>*</span>
                  </label>
                  <input
                    className="contact-main__input"
                    id="contact-main-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </div>

                <div className="contact-main__field">
                  <label className="contact-main__label" htmlFor="contact-main-phone">
                    Phone Number
                  </label>
                  <input
                    className="contact-main__input"
                    id="contact-main-phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    maxLength={20}
                  />
                </div>

                <div className="contact-main__field">
                  <label className="contact-main__label" htmlFor="contact-main-subject">
                    Subject <span>*</span>
                  </label>
                  <input
                    className="contact-main__input"
                    id="contact-main-subject"
                    type="text"
                    name="subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="contact-main__field contact-main__field--full">
                  <label className="contact-main__label" htmlFor="contact-main-message">
                    Your Message <span>*</span>
                  </label>
                  <textarea
                    className="contact-main__textarea"
                    id="contact-main-message"
                    name="message"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    maxLength={3000}
                    required
                  />
                  <span className="contact-main__character-count">
                    {formData.message.length}/3000
                  </span>
                </div>
              </div>

              {formStatus.message && (
                <div
                  className={`contact-main__status contact-main__status--${formStatus.type}`}
                  role="status"
                >
                  {formStatus.message}
                </div>
              )}

              <div className="contact-main__submit-row">
                <button
                  className="contact-main__submit"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Preparing Email..." : "Send Message"}</span>
                  <ArrowIcon />
                </button>

                <p className="contact-main__privacy-note">
                  We use your details only to respond to your request.
                </p>
              </div>
            </form>
          </div>

          {/* Side panel */}
          <aside className="contact-main__info">
            <span className="contact-main__info-circle contact-main__info-circle--one" aria-hidden="true" />
            <span className="contact-main__info-circle contact-main__info-circle--two" aria-hidden="true" />

            <div className="contact-main__info-content">
              <span className="contact-main__info-badge">
                <span className="contact-main__availability-dot" />
                Pure alkaline water, delivered
              </span>

              <h2 className="contact-main__info-title">
                Prefer to <span>Talk?</span>
              </h2>

              <p className="contact-main__info-description">
                Call or message us directly for product details, delivery
                enquiries and customer support.
              </p>

              <ul className="contact-main__highlights">
                {HIGHLIGHTS.map((item) => (
                  <li className="contact-main__highlight" key={item}>
                    <span className="contact-main__highlight-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M5 12.5L10 17.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="contact-main__info-actions">
                <a className="contact-main__action contact-main__action--primary" href={PHONE_LINK}>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7.1 3.5H4.7a1.7 1.7 0 0 0-1.7 1.8c.6 8.2 7.1 14.7 15.3 15.3a1.7 1.7 0 0 0 1.8-1.7v-2.4l-4.2-2-2.1 2.1a14 14 0 0 1-6.9-6.9L9 7.6 7.1 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Call {CONTACT_INFO.phone}
                </a>

                <a
                  className="contact-main__action contact-main__action--outline"
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 20L5.3 15.9A8 8 0 1 1 8.2 18.8L4 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9.2 8.9c.2 2.7 2.9 5.4 5.9 5.9l1-1.2-1.9-1-.8.7c-1-.4-1.9-1.3-2.3-2.3l.7-.8-1-1.9-1.6.6Z" fill="currentColor" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* MAP */}
      <section className="contact-main__map-section" aria-labelledby="contact-main-map-title">
        <div className="contact-main__map-heading">
          <div>
            <span className="contact-main__section-label">FIND OUR LOCATION</span>

            <h2 className="contact-main__map-title" id="contact-main-map-title">
              Visit <span>Alka Drops</span>
            </h2>

            <p className="contact-main__map-description">
              Find us in IRC Village, Nayapalli, Bhubaneswar, Odisha.
            </p>
          </div>

          <a
            className="contact-main__directions-button"
            href={MAP_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 17L17 7M7 7H17V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="contact-main__map-frame">
          <iframe
            title="Alka Drops location in IRC Village, Nayapalli, Bhubaneswar"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              CONTACT_INFO.address
            )}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div className="contact-main__map-address">
            <span className="contact-main__map-pin">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 10C20 16 12 22 12 22S4 16 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>

            <div>
              <strong>{CONTACT_INFO.company}</strong>
              <p>{CONTACT_INFO.address}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactMain;