import React from 'react';
import './SubscriptionBreadcrumb.css';
import backgroundImage from '../../assets/breadcrum.jpeg'; 

const SubscriptionBreadcrumb = ({ title, activePage }) => {
  return (
    <section 
      className="Subscription-Breadcrumb-wrapper" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Subscription-Breadcrumb-overlay">
        <h1 className="Subscription-Breadcrumb-title">Subscription</h1>
        <div className="Subscription-Breadcrumb-nav">
          <span className="Subscription-Breadcrumb-home">Home</span>
          <span className="Subscription-Breadcrumb-divider">//</span>
          <span className="Subscription-Breadcrumb-active">Subscription</span>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionBreadcrumb;