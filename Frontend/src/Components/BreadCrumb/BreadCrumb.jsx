import React from "react";
import { Link } from "react-router-dom";
import "./BreadCrumb.css";
import backgroundImage from "../../assets/breadcrum.jpeg";

const BreadCrumb = ({ title = "About Us", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="breadcrumb-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="breadcrumb-overlay">
        <h1 className="breadcrumb-title">{pageTitle}</h1>

        <div className="breadcrumb-nav">
          <Link to="/" className="breadcrumb-home">
            Home
          </Link>

          <span className="breadcrumb-divider">|</span>

          <span className="breadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default BreadCrumb;