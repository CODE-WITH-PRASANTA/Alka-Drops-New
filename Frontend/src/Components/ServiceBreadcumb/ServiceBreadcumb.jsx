import React from "react";
import { Link } from "react-router-dom";
import "./ServiceBreadCumb.css";
import backgroundImage from "../../assets/breadcrum.jpeg";

const ServiceBreadCrumb = ({ title = "Service", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="Service-Breadcrumb-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Service-Breadcrumb-overlay">
        <h1 className="Service-Breadcrumb-title">{pageTitle}</h1>

        <div className="Service-Breadcrumb-nav">
          <Link to="/" className="Service-Breadcrumb-home">
            Home
          </Link>

          <span className="Service-Breadcrumb-divider">|</span>

          <span className="Service-Breadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default ServiceBreadCrumb;