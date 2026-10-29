import React from "react";
import {
  FaTruckFast,
  FaClock,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaGooglePlusG,
  FaInstagram,
} from "react-icons/fa6";
import "./Topbar.css";

const Topbar = () => {
  return (
    <div className="Topbar">
      <div className="Topbar-container">
        {/* Left White Section */}
        <div className="Topbar-left">
          <span className="Topbar-decoration"></span>
        </div>

        {/* Right Blue Section */}
        <div className="Topbar-right">
          <div className="Topbar-contact">
            <div className="Topbar-item">
              <FaTruckFast className="Topbar-icon" />
              <span>Immediate Delivery</span>
            </div>

            <div className="Topbar-item">
              <FaClock className="Topbar-icon" />
              <span>24 Hour</span>
            </div>

            <a
              href="mailto:support@alkadrops.com"
              className="Topbar-item Topbar-email"
            >
              <FaEnvelope className="Topbar-icon" />
              <span>support@alkadrops.com</span>
            </a>
          </div>

          <div className="Topbar-social">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>

            <a
              href="https://www.google.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Google"
            >
              <FaGooglePlusG />
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;