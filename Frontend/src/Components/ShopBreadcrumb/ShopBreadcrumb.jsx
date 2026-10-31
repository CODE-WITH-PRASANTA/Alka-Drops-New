import React from 'react';
import './ShopBreadcrumb.css';
import backgroundImage from '../../assets/breadcrum.jpeg'; 

const ShopBreadcrumb = ({ title, activePage }) => {
  return (
    <section 
      className="Shop-Breadcrumb-wrapper" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Shop-Breadcrumb-overlay">
        <h1 className="Shop-Breadcrumb-title">Shop</h1>
        <div className="Shop-Breadcrumb-nav">
          <span className="Shop-Breadcrumb-home">Home</span>
          <span className="Shop-Breadcrumb-divider">//</span>
          <span className="Shop-Breadcrumb-active">Shop</span>
        </div>
      </div>
    </section>
  );
};

export default ShopBreadcrumb;