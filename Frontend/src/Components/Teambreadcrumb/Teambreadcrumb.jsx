import React from "react";
import { Link } from "react-router-dom";
import "./TeambreadCrumb.css";
import backgroundImage from "../../assets/breadcrum.jpeg";

const TeambreadCrumb = ({ title = "Our Team", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="Teambreadcrumb-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Teambreadcrumb-overlay">
        <h1 className="Teambreadcrumb-title">{pageTitle}</h1>

        <div className="Teambreadcrumb-nav">
          <Link to="/" className="Teambreadcrumb-home">
            Home
          </Link>

          <span className="Teambreadcrumb-divider">|</span>

          <span className="Teambreadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default TeambreadCrumb;