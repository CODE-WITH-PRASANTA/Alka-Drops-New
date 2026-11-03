import React from "react";
import { Link } from "react-router-dom";
import "./BlogDetailsBreadcrumb.css";
import backgroundImage from "../../assets/breadcrum.png";

const BlogDetailsBreadcrumb = ({ title = "Blog Details", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="BlogDetailsBreadcrumb-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="BlogDetailsBreadcrumb-overlay">
        <h1 className="BlogDetailsBreadcrumb-title">{pageTitle}</h1>

        <div className="BlogDetailsBreadcrumb-nav">
          <Link to="/" className="BlogDetailsBreadcrumb-home">
            Home
          </Link>

          <span className="BlogDetailsBreadcrumb-divider">|</span>

          <Link to="/blog" className="BlogDetailsBreadcrumb-home">
            Blog
          </Link>

          <span className="BlogDetailsBreadcrumb-divider">//</span>

          <span className="BlogDetailsBreadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default BlogDetailsBreadcrumb;