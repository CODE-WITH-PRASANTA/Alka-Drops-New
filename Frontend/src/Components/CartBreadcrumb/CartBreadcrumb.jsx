import React from "react";
import { Link } from "react-router-dom";
import "./CartBreadcrumb.css";
import backgroundImage from "../../assets/breadcrum.png";

const CartBreadcrumb = ({ title = "Cart", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="Cart-Breadcrumb-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Cart-Breadcrumb-overlay">
        <h1 className="Cart-Breadcrumb-title">{pageTitle}</h1>

        <div className="Cart-Breadcrumb-nav">
          <Link to="/" className="Cart-Breadcrumb-home">
            Home
          </Link>

          <span className="Cart-Breadcrumb-divider">//</span>

          <span className="Cart-Breadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default CartBreadcrumb;