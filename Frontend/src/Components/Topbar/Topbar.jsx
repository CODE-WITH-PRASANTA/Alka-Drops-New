import React from "react";
import {
  FaTruckFast,
  FaClock,
  FaEnvelope,
  FaFacebookF,
  FaXTwitter,
  FaWhatsapp,
  FaInstagram,
  FaDroplet,
} from "react-icons/fa6";
import "./Topbar.css";

const CONTACT_ITEMS = [
  { icon: FaTruckFast, text: "Immediate Delivery" },
  { icon: FaClock, text: "24 Hour" },
];

const SOCIAL_LINKS = [
  { icon: FaFacebookF, label: "Facebook", href: "https://www.facebook.com/" },
  { icon: FaXTwitter, label: "X (Twitter)", href: "https://x.com/" },
  { icon: FaWhatsapp, label: "WhatsApp", href: "https://wa.me/yourphonenumber" },
  { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/" },
];

const Topbar = () => {
  return (
    <header className="Topbar">
      <div className="Topbar-container">
        {/* Left White Section */}
        <div className="Topbar-left">
          <div className="Topbar-tagline">
            <span className="Topbar-tagline-icon" aria-hidden="true">
              <FaDroplet />
            </span>
            <span className="Topbar-tagline-text">
              Pure <strong>pH 8.5+</strong> Alkaline Water
            </span>
          </div>
        </div>

        {/* Yellow diagonal accent */}
        <span className="Topbar-accent" aria-hidden="true" />

        {/* Right Blue Section */}
        <div className="Topbar-right">
          <span className="Topbar-shine" aria-hidden="true" />

          <div className="Topbar-contact">
            {CONTACT_ITEMS.map(({ icon: Icon, text }) => (
              <div className="Topbar-item" key={text}>
                <span className="Topbar-icon-wrap" aria-hidden="true">
                  <Icon className="Topbar-icon" />
                </span>
                <span className="Topbar-text">{text}</span>
              </div>
            ))}

            <a
              href="mailto:support@alkadrops.com"
              className="Topbar-item Topbar-email"
            >
              <span className="Topbar-icon-wrap" aria-hidden="true">
                <FaEnvelope className="Topbar-icon" />
              </span>
              <span className="Topbar-text">support@alkadrops.com</span>
            </a>
          </div>

          <div className="Topbar-social" aria-label="Social media links">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="Topbar-social-link"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;