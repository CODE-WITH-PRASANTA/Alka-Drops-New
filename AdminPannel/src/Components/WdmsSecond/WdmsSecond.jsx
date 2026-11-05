import React, { useState } from 'react';
import { 
  FiBox, 
  FiAlertTriangle, 
  FiHome, 
  FiTruck, 
  FiTrendingUp, 
  FiTrendingDown,
  FiChevronDown,
  FiPlusCircle,
  FiUserPlus,
  FiPackage,
  FiFileText,
  FiBarChart2,
  FiX
} from 'react-icons/fi';
import './WdmsSecond.css';

// 1. Top Metrics Cards Data
const topMetrics = [
  {
    id: 1,
    title: 'Total Products',
    value: '1,845',
    change: '9.3%',
    isPositive: true,
    icon: <FiBox className="metric-icon icon-blue" />,
    bgClass: 'bg-light-blue'
  },
  {
    id: 2,
    title: 'Low Stock Items',
    value: '23',
    change: '4.2%',
    isPositive: false,
    icon: <FiAlertTriangle className="metric-icon icon-orange" />,
    bgClass: 'bg-light-orange'
  },
  {
    id: 3,
    title: 'Total Suppliers',
    value: '156',
    change: '6.7%',
    isPositive: true,
    icon: <FiHome className="metric-icon icon-purple" />,
    bgClass: 'bg-light-purple'
  },
  {
    id: 4,
    title: 'Total Vehicles',
    value: '48',
    change: '2.1%',
    isPositive: true,
    icon: <FiTruck className="metric-icon icon-teal" />,
    bgClass: 'bg-light-teal'
  }
];

// 2. Recent Orders Table Data
const initialOrders = [
  { id: '#ORD-1452', customer: 'Amit Kumar', amount: '₹1,250', status: 'Delivered', statusClass: 'status-delivered', date: 'May 21, 2025' },
  { id: '#ORD-1451', customer: 'Priya Sharma', amount: '₹2,450', status: 'In Transit', statusClass: 'status-transit', date: 'May 21, 2025' },
  { id: '#ORD-1450', customer: 'Rahul Verma', amount: '₹980', status: 'Pending', statusClass: 'status-pending', date: 'May 20, 2025' },
  { id: '#ORD-1449', customer: 'Sneha Singh', amount: '₹1,560', status: 'Delivered', statusClass: 'status-delivered', date: 'May 20, 2025' },
  { id: '#ORD-1448', customer: 'Vikram Patel', amount: '₹3,250', status: 'In Transit', statusClass: 'status-transit', date: 'May 19, 2025' },
  { id: '#ORD-1447', customer: 'Ananya Roy', amount: '₹1,890', status: 'Delivered', statusClass: 'status-delivered', date: 'May 19, 2025' },
  { id: '#ORD-1446', customer: 'Rohan Mehta', amount: '₹2,100', status: 'Pending', statusClass: 'status-pending', date: 'May 18, 2025' }
];

// 3. Top Selling Products Data
const topProducts = [
  { rank: 1, name: '20L Water Bottle', count: 850, percentage: 85, colorClass: 'bar-blue', rankBg: 'rank-bg-blue' },
  { rank: 2, name: '1L Water Bottle', count: 620, percentage: 62, colorClass: 'bar-green', rankBg: 'rank-bg-green' },
  { rank: 3, name: '500ml Water Bottle', count: 410, percentage: 41, colorClass: 'bar-orange', rankBg: 'rank-bg-orange' },
  { rank: 4, name: '5L Water Bottle', count: 320, percentage: 32, colorClass: 'bar-purple', rankBg: 'rank-bg-purple' },
  { rank: 5, name: '15L Water Bottle', count: 210, percentage: 21, colorClass: 'bar-pink', rankBg: 'rank-bg-pink' },
];

const WdmsSecond = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Quick Action Click Handler
  const handleActionClick = (actionName) => {
    setActiveModal(actionName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const displayedOrders = showAllOrders ? initialOrders : initialOrders.slice(0, 5);

  return (
    <div className="wdms-second-wrapper">
      <div className="wdms-second-container">
        
        {/* Section 1: Top 4 Metric Cards */}
        <div className="wdms-metrics-row">
          {topMetrics.map((metric) => (
            <div key={metric.id} className="wdms-card metric-card">
              <div className="metric-details">
                <span className="metric-title">{metric.title}</span>
                <h2 className="metric-number">{metric.value}</h2>
                <div className={`metric-trend ${metric.isPositive ? 'positive' : 'negative'}`}>
                  {metric.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                  <span>{metric.change}</span>
                  <span className="trend-subtext">from last month</span>
                </div>
              </div>
              <div className={`metric-icon-wrapper ${metric.bgClass}`}>
                {metric.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Three Main Panels Grid */}
        <div className="wdms-panels-grid">
          
          {/* Panel 1: Recent Orders */}
          <div className="wdms-card panel-card recent-orders-panel">
            <div className="panel-header">
              <h3 className="panel-title">Recent Orders</h3>
              <button 
                className="view-all-btn" 
                onClick={() => setShowAllOrders(!showAllOrders)}
              >
                {showAllOrders ? 'Show Less' : 'View All'}
              </button>
            </div>
            
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((order, idx) => (
                    <tr key={idx}>
                      <td className="order-id">{order.id}</td>
                      <td className="customer-name">{order.customer}</td>
                      <td className="order-amount">{order.amount}</td>
                      <td>
                        <span className={`status-pill ${order.statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="order-date">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel 2: Top Selling Products */}
          <div className="wdms-card panel-card top-products-panel">
            <div className="panel-header">
              <h3 className="panel-title">Top Selling Products</h3>
              <div className="panel-dropdown">
                <span>This Month</span>
                <FiChevronDown />
              </div>
            </div>

            <div className="top-products-list">
              {topProducts.map((item) => (
                <div key={item.rank} className="product-item">
                  <div className="product-rank-name">
                    <span className={`rank-badge ${item.rankBg}`}>{item.rank}</span>
                    <span className="product-name">{item.name}</span>
                  </div>
                  
                  <div className="product-progress-box">
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-fill ${item.colorClass}`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="product-count">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 3: Working Quick Actions */}
          <div className="wdms-card panel-card quick-actions-panel">
            <div className="panel-header">
              <h3 className="panel-title">Quick Actions</h3>
            </div>

            <div className="quick-actions-grid">
              
              <button className="action-button" onClick={() => handleActionClick('Add New Order')}>
                <div className="action-icon-wrapper">
                  <FiPlusCircle className="action-icon icon-blue" />
                </div>
                <span className="action-label">Add New Order</span>
              </button>

              <button className="action-button" onClick={() => handleActionClick('Add Customer')}>
                <div className="action-icon-wrapper">
                  <FiUserPlus className="action-icon icon-blue" />
                </div>
                <span className="action-label">Add Customer</span>
              </button>

              <button className="action-button" onClick={() => handleActionClick('Add Product')}>
                <div className="action-icon-wrapper">
                  <FiPackage className="action-icon icon-green" />
                </div>
                <span className="action-label">Add Product</span>
              </button>

              <button className="action-button" onClick={() => handleActionClick('Add Supplier')}>
                <div className="action-icon-wrapper">
                  <FiTruck className="action-icon icon-green" />
                </div>
                <span className="action-label">Add Supplier</span>
              </button>

              <button className="action-button" onClick={() => handleActionClick('Generate Invoice')}>
                <div className="action-icon-wrapper">
                  <FiFileText className="action-icon icon-blue" />
                </div>
                <span className="action-label">Generate Invoice</span>
              </button>

              <button className="action-button" onClick={() => handleActionClick('View Reports')}>
                <div className="action-icon-wrapper">
                  <FiBarChart2 className="action-icon icon-blue" />
                </div>
                <span className="action-label">View Reports</span>
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* Action Popup Modal */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{activeModal}</h4>
              <button className="close-btn" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>You have triggered the <strong>"{activeModal}"</strong> action.</p>
              <button className="confirm-btn" onClick={closeModal}>Got It</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WdmsSecond;