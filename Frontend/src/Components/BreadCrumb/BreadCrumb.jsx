import React from 'react';
import './BreadCrumb.css';
import backgroundImage from '../../assets/breadcrum.jpeg'; 

const BreadCrumb = ({ title, activePage }) => {
  return (
    <section 
      className="breadcrumb-wrapper" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="breadcrumb-overlay">
        <h1 className="breadcrumb-title">About Us</h1>
        <div className="breadcrumb-nav">
          <span className="breadcrumb-home">Home</span>
          <span className="breadcrumb-divider">//</span>
          <span className="breadcrumb-active">About Us</span>
        </div>
      </div>
    </section>
  );
};

export default BreadCrumb;