import React from "react";
import { Link } from "react-router-dom";
import "./Gallarybreadcrumb.css";
import backgroundImage from "../../assets/breadcrum.jpeg";

const Gallarybreadcrumb = ({ title = "Gallary", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="Gallary-breadcrumb-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Gallary-breadcrumb-overlay">
        <h1 className="Gallary-breadcrumb-title">{pageTitle}</h1>

        <div className="Gallary-breadcrumb-nav">
          <Link to="/" className="Gallary-breadcrumb-home">
            Home
          </Link>

          <span className="Gallary-breadcrumb-divider">|</span>

          <span className="Gallary-breadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default Gallarybreadcrumb;