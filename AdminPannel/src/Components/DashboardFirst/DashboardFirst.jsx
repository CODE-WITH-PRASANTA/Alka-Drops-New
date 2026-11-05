import React from 'react';
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiUsers, 
  FiTruck, 
  FiTrendingUp, 
  FiTrendingDown,
  FiChevronDown 
} from 'react-icons/fi';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import './DashboardFirst.css';

// Metrics Data
const metrics = [
  {
    id: 1,
    title: 'Total Revenue',
    value: '₹12,45,890',
    change: '12.5%',
    isPositive: true,
    icon: <FiDollarSign className="metric-icon blue-icon" />,
    bgClass: 'blue-bg'
  },
  {
    id: 2,
    title: 'Total Orders',
    value: '1,254',
    change: '8.2%',
    isPositive: true,
    icon: <FiShoppingBag className="metric-icon green-icon" />,
    bgClass: 'green-bg'
  },
  {
    id: 3,
    title: 'Total Customers',
    value: '2,345',
    change: '10.1%',
    isPositive: true,
    icon: <FiUsers className="metric-icon purple-icon" />,
    bgClass: 'purple-bg'
  },
  {
    id: 4,
    title: 'Pending Deliveries',
    value: '86',
    change: '3.4%',
    isPositive: false,
    icon: <FiTruck className="metric-icon yellow-icon" />,
    bgClass: 'yellow-bg'
  }
];

// Area Chart Data (Sales Overview)
const salesData = [
  { date: 'May 15', amount: 60000 },
  { date: 'May 16', amount: 90000 },
  { date: 'May 17', amount: 55000 },
  { date: 'May 18', amount: 85000 },
  { date: 'May 19', amount: 120000 },
  { date: 'May 20', amount: 100000 },
  { date: 'May 21', amount: 145000 },
  { date: 'May 22', amount: 110000 },
  { date: 'May 23', amount: 90000 },
  { date: 'May 24', amount: 70000 },
  { date: 'May 25', amount: 105000 },
  { date: 'May 26', amount: 135000 },
  { date: 'May 27', amount: 150000 },
];

// Custom Tooltip for Area Chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-amount">₹{payload[0].value.toLocaleString('en-IN')}</p>
        <p className="tooltip-date">May 18, 2025</p>
      </div>
    );
  }
  return null;
};

// Donut Chart Data (Order Status)
const orderStatusData = [
  { name: 'Delivered', value: 950, percentage: '75.8%', color: '#4ADE80' },
  { name: 'In Transit', value: 180, percentage: '14.3%', color: '#3B82F6' },
  { name: 'Pending', value: 90, percentage: '7.2%', color: '#FBBF24' },
  { name: 'Cancelled', value: 34, percentage: '2.7%', color: '#F87171' },
];

const DashboardFirst = () => {
  return (
    <div className="Dashboard-First-wrapper">
      <div className="Dashboard-First-container">
        
        {/* Top 4 Metrics Cards Grid */}
        <div className="Dashboard-metrics-grid">
          {metrics.map((metric) => (
            <div key={metric.id} className="Dashboard-metric-card">
              <div className="metric-info">
                <span className="metric-title">{metric.title}</span>
                <h2 className="metric-value">{metric.value}</h2>
                <div className={`metric-change ${metric.isPositive ? 'positive' : 'negative'}`}>
                  {metric.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                  <span>{metric.change}</span>
                  <span className="change-text">from last month</span>
                </div>
              </div>
              <div className={`metric-icon-box ${metric.bgClass}`}>
                {metric.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Main Section (Sales Overview & Order Status) */}
        <div className="Dashboard-charts-grid">
          
          {/* Left Chart: Sales Overview */}
          <div className="Dashboard-chart-card sales-overview-card">
            <div className="chart-card-header">
              <h3 className="chart-title">Sales Overview</h3>
              <div className="chart-dropdown">
                <span>Last 7 Days</span>
                <FiChevronDown />
              </div>
            </div>

            <div className="chart-body">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={salesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888888', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888888', fontSize: 11 }}
                    tickFormatter={(value) => {
                      if (value === 0) return '₹0';
                      if (value >= 100000) return `₹${value / 100000}L`;
                      if (value >= 1000) return `₹${value / 1000}K`;
                      return value;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3B82F6" 
                    strokeWidth={2.5} 
                    fill="url(#salesGradient)" 
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#2563EB', strokeWidth: 3, stroke: '#FFFFFF' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Chart: Order Status */}
          <div className="Dashboard-chart-card order-status-card">
            <div className="chart-card-header">
              <h3 className="chart-title">Order Status</h3>
              <div className="chart-dropdown">
                <span>This Month</span>
                <FiChevronDown />
              </div>
            </div>

            <div className="order-status-body">
              {/* Donut Chart with Center Text */}
              <div className="donut-chart-wrapper">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-text">
                  <h3 className="center-value">1,254</h3>
                  <p className="center-label">Total</p>
                </div>
              </div>

              {/* Status Legend List */}
              <div className="status-legend-list">
                {orderStatusData.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-label">
                      <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                      <span className="legend-name">{item.name}</span>
                    </div>
                    <div className="legend-stats">
                      <span className="legend-count">{item.value}</span>
                      <span className="legend-percentage">({item.percentage})</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardFirst;