import React from "react";
import { Link } from "react-router-dom";
import "./BlogBreadCrumb.css";
import backgroundImage from "../../assets/breadcrum.jpeg";

const BlogbreadCrumb = ({ title = "Blog", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="Blogbreadcrumb-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Blogbreadcrumb-overlay">
        <h1 className="Blogbreadcrumb-title">{pageTitle}</h1>

        <div className="Blogbreadcrumb-nav">
          <Link to="/" className="Blogbreadcrumb-home">
            Home
          </Link>

          <span className="Blogbreadcrumb-divider">|</span>

          <span className="Blogbreadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default BlogbreadCrumb;