import React, { useState } from "react";
import {
  FiBarChart2,
  FiDownload,
  FiCalendar,
  FiTrendingUp,
  FiDollarSign,
  FiDroplet,
  FiRefreshCw,
  FiLayers,
} from "react-icons/fi";
import "./ReportManagement.css";

const monthlyData = [
  { month: "October 2026", orders: 1840, liters: "36,800 L", revenue: "₹2,48,500", growth: "+14.2%" },
  { month: "September 2026", orders: 1620, liters: "32,400 L", revenue: "₹2,18,700", growth: "+9.8%" },
  { month: "August 2026", orders: 1480, liters: "29,600 L", revenue: "₹1,99,800", growth: "+11.5%" },
  { month: "July 2026", orders: 1330, liters: "26,600 L", revenue: "₹1,79,550", growth: "+8.1%" },
  { month: "June 2026", orders: 1220, liters: "24,400 L", revenue: "₹1,64,700", growth: "+15.0%" },
];

const topZones = [
  { zone: "Zone A - Viman Nagar / Kharadi", deliveries: "14,800 Jars", revenue: "₹1,40,600", share: "34%" },
  { zone: "Zone B - Magarpatta / Hadapsar", deliveries: "11,200 Jars", revenue: "₹1,06,400", share: "26%" },
  { zone: "Zone C - Kalyani Nagar / Koregaon", deliveries: "9,600 Jars", revenue: "₹91,200", share: "22%" },
  { zone: "Zone D - Hinjewadi IT Park", deliveries: "7,800 Jars", revenue: "₹74,100", share: "18%" },
];

const ReportManagement = () => {
  const [timeRange, setTimeRange] = useState("Last 6 Months");

  const handleExport = () => {
    alert("Exporting Alka Drops Monthly Sales & Liters Report as CSV...");
  };

  return (
    <div className="ReportManagement">
      <header className="ReportManagement-header">
        <div className="ReportManagement-heading">
          <div className="ReportManagement-headingIcon">
            <FiBarChart2 />
          </div>
          <h1>Sales Reports & Hydration Analytics</h1>
        </div>
        <div className="ReportManagement-actions">
          <button type="button" className="ReportManagement-btn primary" onClick={handleExport}>
            <FiDownload /> <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="ReportManagement-statsGrid">
        <div className="ReportManagement-statCard">
          <div className="ReportManagement-statIcon rev"><FiDollarSign /></div>
          <div><span className="ReportManagement-statLabel">Yearly Gross Revenue</span><span className="ReportManagement-statValue">₹12,45,890</span></div>
        </div>
        <div className="ReportManagement-statCard">
          <div className="ReportManagement-statIcon water"><FiDroplet /></div>
          <div><span className="ReportManagement-statLabel">Alkaline Water Delivered</span><span className="ReportManagement-statValue">1,84,200 L</span></div>
        </div>
        <div className="ReportManagement-statCard">
          <div className="ReportManagement-statIcon jars"><FiLayers /></div>
          <div><span className="ReportManagement-statLabel">20L Jars Dispatched</span><span className="ReportManagement-statValue">9,210 Jars</span></div>
        </div>
        <div className="ReportManagement-statCard">
          <div className="ReportManagement-statIcon growth"><FiTrendingUp /></div>
          <div><span className="ReportManagement-statLabel">Average Monthly Growth</span><span className="ReportManagement-statValue">+11.7% MoM</span></div>
        </div>
      </div>

      {/* Content Columns */}
      <div className="ReportManagement-layoutGrid">
        {/* Monthly Breakdown Table */}
        <div className="ReportManagement-card mainCard">
          <div className="ReportManagement-cardHeader">
            <h3>Monthly Financial Breakdown</h3>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Current Financial Year">Current FY 2026-27</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
          <table className="ReportManagement-table">
            <thead>
              <tr>
                <th>Billing Month</th>
                <th>Orders Completed</th>
                <th>Total Volume (L)</th>
                <th>Revenue (₹)</th>
                <th>MoM Growth</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row) => (
                <tr key={row.month}>
                  <td><strong>{row.month}</strong></td>
                  <td>{row.orders.toLocaleString()} orders</td>
                  <td><span className="waterText">{row.liters}</span></td>
                  <td><strong>{row.revenue}</strong></td>
                  <td><span className="growthBadge">{row.growth}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Regional Distribution */}
        <div className="ReportManagement-card sideCard">
          <div className="ReportManagement-cardHeader">
            <h3>Top Delivering Hubs</h3>
          </div>
          <div className="ReportManagement-zoneList">
            {topZones.map((z) => (
              <div key={z.zone} className="ReportManagement-zoneItem">
                <div className="zoneHeader">
                  <strong>{z.zone}</strong>
                  <span className="shareBadge">{z.share}</span>
                </div>
                <div className="zoneMeta">
                  <span>{z.deliveries}</span>
                  <strong>{z.revenue}</strong>
                </div>
                <div className="progressBar">
                  <div className="progressFill" style={{ width: z.share }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;

