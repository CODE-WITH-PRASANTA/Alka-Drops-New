import React from 'react';
import './ShopDBreadCrumb.css';
import backgroundImage from '../../assets/breadcrum.jpeg'; 

const ShopDBreadCrumb = ({ title, activePage }) => {
  return (
    <section 
      className="ShopD-BreadCrumb-wrapper" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="ShopD-BreadCrumb-overlay">
        <h1 className="ShopD-BreadCrumb-title">Shop Details</h1>
        <div className="ShopD-BreadCrumb-nav">
          <span className="ShopD-BreadCrumb-home">Home</span>
          <span className="ShopD-BreadCrumb-divider">//</span>
          <span className="ShopD-BreadCrumb-active">Shop Details</span>
        </div>
      </div>
    </section>
  );
};

export default ShopDBreadCrumb;