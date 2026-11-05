import React from "react";
import { Link } from "react-router-dom";
import "./BlogBreadcrumb.css";
import Background from "../../assets/AlkaDropsBreadCrumb.png";

const BlogBreadcrumb = ({ title = "Blog", activePage }) => {
  const pageTitle = activePage || title;

  return (
    <section
      className="Blog-Breadcrumb-wrapper"
      style={{ backgroundImage: `url(${Background})` }}
    >
      <div className="Blog-Breadcrumb-overlay">
        <h1 className="Blog-Breadcrumb-title">{pageTitle}</h1>

        <div className="Blog-Breadcrumb-nav">
          <Link to="/" className="Blog-Breadcrumb-home">
            Home
          </Link>

          <span className="Blog-Breadcrumb-divider">//</span>

          <span className="Blog-Breadcrumb-active">{pageTitle}</span>
        </div>
      </div>
    </section>
  );
};

export default BlogBreadcrumb;