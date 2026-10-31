import React from 'react';
import './CartBreadcrumb.css';
import backgroundImage from '../../assets/breadcrum.jpeg'; 

const CartBreadcrumb = ({ title, activePage }) => {
  return (
    <section 
      className="Cart-Breadcrumb-wrapper" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="Cart-Breadcrumb-overlay">
        <h1 className="Cart-Breadcrumb-title">Cart</h1>
        <div className="Cart-Breadcrumb-nav">
          <span className="Cart-Breadcrumb-home">Home</span>
          <span className="Cart-Breadcrumb-divider">//</span>
          <span className="Cart-Breadcrumb-active">Cart</span>
        </div>
      </div>
    </section>
  );
};

export default CartBreadcrumb;