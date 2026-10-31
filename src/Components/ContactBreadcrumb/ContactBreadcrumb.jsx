import React from "react";
import { Link } from "react-router-dom";
import "./ContactBreadcrumb.css";
import backgroundImage from "../../assets/breadcrum.jpeg";

const ContactBreadcrumb = ({ title = "Contact", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="Contact-Breadcrumb-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Contact-Breadcrumb-overlay">
        <h1 className="Contact-Breadcrumb-title">{pageTitle}</h1>

        <div className="Contact-Breadcrumb-nav">
          <Link to="/" className="Contact-Breadcrumb-home">
            Home
          </Link>

          <span className="Contact-Breadcrumb-divider">|</span>

          <span className="Contact-Breadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default ContactBreadcrumb;