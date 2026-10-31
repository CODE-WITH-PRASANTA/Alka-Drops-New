import React from "react";
import { Link } from "react-router-dom";
import "./ServicedetailsBreadcumb.css";
import backgroundImage from "../../assets/breadcrum.jpeg";

const ServicedetailsBreadcrumb = ({ title = "About Us", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="Servicedetails-Breadcrumb-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Servicedetails-Breadcrumb-overlay">
        <h1 className="Servicedetails-Breadcrumb-title">{pageTitle}</h1>

        <div className="Servicedetails-Breadcrumb-nav">
          <Link to="/" className="Servicedetails-Breadcrumb-home">
            Home
          </Link>

          <span className="Servicedetails-Breadcrumb-divider">|</span>

          <span className="Servicedetails-Breadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default ServicedetailsBreadcrumb;