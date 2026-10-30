
import React from "react";
import { Link } from "react-router-dom";
import {
  FaDroplet,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaArrowRight,
  FaArrowUp,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaCheck,
} from "react-icons/fa6";

import logo from "../../assets/ALKA DROPS LOGO.png";
import "./Footer.css";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Shop Products", to: "/shop" },
  { label: "Our Services", to: "/services" },
  { label: "Subscription", to: "/pricing" },
  { label: "Our Team", to: "/team" },
];

const supportLinks = [
  { label: "FAQs", to: "/faq" },
  { label: "Contact Us", to: "/contact" },
  { label: "Gallery", to: "/gallery" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "Latest Blogs", to: "/blog" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: FaFacebookF,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: FaInstagram,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/",
    icon: FaTwitter,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: FaLinkedinIn,
  },
];

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="Footer">
      {/* Decorative background */}
      <div className="Footer-background" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <span
            key={index}
            className={`Footer-bubble Footer-bubble-${index + 1}`}
          />
        ))}
      </div>

      {/* Main Footer */}
      <div className="Footer-main">
        {/* Brand Column */}
        <section className="Footer-brand-column">
          <Link
            to="/"
            className="Footer-brand"
            aria-label="Alka Drops Home"
          >
            <img
              src={logo}
              alt="Alka Drops Logo"
              className="Footer-logo"
            />
          </Link>

          <h2 className="Footer-brand-heading">
            Pure Water.
            <span>Pure Life.</span>
          </h2>

          <p className="Footer-brand-description">
            Every drop matters. Discover refreshing hydration
            with Alka Drops, where quality, freshness, and care
            come together in every delivery.
          </p>

          {/* Brand highlight */}
          <div className="Footer-refresh-card">
            <span className="Footer-refresh-icon">
              <FaDroplet />
            </span>

            <div className="Footer-refresh-content">
              <strong>Refresh Your Everyday</strong>
              <span>Make every drop count.</span>
            </div>
          </div>

          {/* Social media */}
          <div className="Footer-socials">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="Footer-social-link"
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>

          {/* Quality message */}
          <div className="Footer-quality-note">
            <FaCheck />
            <span>Refreshing service, every day.</span>
          </div>
        </section>

        {/* Explore Column */}
        <nav className="Footer-links-column" aria-label="Explore">
          <h3 className="Footer-column-title">Explore</h3>
          <span className="Footer-title-underline" />

          <ul className="Footer-links-list">
            {exploreLinks.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="Footer-link">
                  <FaArrowRight />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Customer Care Column */}
        <nav
          className="Footer-links-column"
          aria-label="Customer Care"
        >
          <h3 className="Footer-column-title">Customer Care</h3>
          <span className="Footer-title-underline" />

          <ul className="Footer-links-list">
            {supportLinks.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="Footer-link">
                  <FaArrowRight />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/shop" className="Footer-water-help">
            <span className="Footer-water-help-icon">
              <FaDroplet />
            </span>

            <span className="Footer-water-help-content">
              <strong>Need Water?</strong>
              <small>We're here to help.</small>
            </span>
          </Link>
        </nav>

        {/* Contact Column */}
        <section className="Footer-contact-column">
          <h3 className="Footer-column-title">Get In Touch</h3>
          <span className="Footer-title-underline" />

          <p className="Footer-contact-intro">
            Have a question? We'd love to hear from you.
          </p>

          <div className="Footer-contact-list">
            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <FaEnvelope />
              </span>

              <div className="Footer-contact-details">
                <strong>Email Address</strong>
                <a href="mailto:support@alkadrops.com">
                  support@alkadrops.com
                </a>
              </div>
            </div>

            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <FaPhone />
              </span>

              <div className="Footer-contact-details">
                <strong>Delivery Service</strong>
                <span>Immediate Delivery</span>
                <span>24 Hour Service</span>
              </div>
            </div>

            <div className="Footer-contact-item">
              <span className="Footer-contact-icon">
                <FaLocationDot />
              </span>

              <div className="Footer-contact-details">
                <strong>Our Location</strong>
                <span>Contact us for service locations.</span>
              </div>
            </div>
          </div>

          <Link
            to="/contact"
            className="Footer-contact-button"
          >
            <span>Contact Our Team</span>
            <FaArrowRight />
          </Link>
        </section>
      </div>

      {/* Decorative water waves */}
      <div className="Footer-wave-art" aria-hidden="true">
        <svg
          viewBox="0 0 1440 130"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="Footer-wave-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#08b8f3"
                stopOpacity=".4"
              />
              <stop
                offset="100%"
                stopColor="#003b78"
                stopOpacity=".05"
              />
            </linearGradient>
          </defs>

          <path
            d="M0 75 C130 18 220 116 360 80 S570 30 710 80 S950 110 1100 63 S1320 25 1440 70 L1440 130 L0 130Z"
            fill="url(#Footer-wave-gradient)"
          />

          <path
            d="M0 75 C130 18 220 116 360 80 S570 30 710 80 S950 110 1100 63 S1320 25 1440 70"
            fill="none"
            stroke="#16c8f5"
            strokeWidth="2"
          />

          <path
            d="M0 98 C160 48 250 130 400 99 S620 57 770 96 S1030 123 1180 88 S1350 58 1440 95"
            fill="none"
            stroke="#69e5ff"
            strokeWidth="1.5"
            opacity=".6"
          />
        </svg>
      </div>

      {/* Copyright Bar */}
      <div className="Footer-bottom">
        <div className="Footer-bottom-inner">
          <p className="Footer-copyright">
            © {new Date().getFullYear()}{" "}
            <strong>Alka Drops.</strong> All rights reserved.
          </p>

          <div className="Footer-bottom-center">
            <span className="Footer-made-with">
              Made with <span className="Footer-heart">♥</span> for a refreshing life
            </span>

            <span className="Footer-bottom-divider" />

            <span className="Footer-developed">
              Developed by{" "}
              <a
                href="https://prwebstock.com/"
                target="_blank"
                rel="noreferrer"
              >
                PR WEBSTOCK
              </a>
            </span>
          </div>

          <button
            type="button"
            className="Footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
          >
            <FaArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
