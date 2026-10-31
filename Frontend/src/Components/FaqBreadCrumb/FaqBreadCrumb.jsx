import React from 'react';
import './FaqBreadCrumb.css';
import backgroundImage from '../../assets/breadcrum.jpeg'; 

const FaqBreadCrumb = ({ title, activePage }) => {
  return (
    <section 
      className="Faq-BreadCrumb-wrapper" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Faq-BreadCrumb-overlay">
        <h1 className="Faq-BreadCrumb-title">Faq</h1>
        <div className="Faq-BreadCrumb-nav">
          <span className="Faq-BreadCrumb-home">Home</span>
          <span className="Faq-BreadCrumb-divider">//</span>
          <span className="Faq-BreadCrumb-active">Faq</span>
        </div>
      </div>
    </section>
  );
};

export default FaqBreadCrumb;