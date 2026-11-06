import React, { useState, useMemo } from "react";
import {
  FiCalendar,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiRefreshCw,
  FiMapPin,
  FiPackage,
  FiUser,
} from "react-icons/fi";
import "./SubscriptionOrders.css";

const initialDeliveries = [
  { id: "SUB-DLV-101", customer: "Pooja Hegde", plan: "Daily Hydration", bottles: 1, empties: 1, timeSlot: "06:30 AM", route: "Zone A - Viman Nagar", deliveryBoy: "Ramesh Pawar", status: "Delivered", address: "Flat 402, Green Acres" },
  { id: "SUB-DLV-102", customer: "Sanjay Singhania", plan: "Office Station (Mon-Fri)", bottles: 3, empties: 3, timeSlot: "08:15 AM", route: "Zone B - Magarpatta", deliveryBoy: "Vikas Patil", status: "Delivered", address: "Tower 2, CyberCity" },
  { id: "SUB-DLV-103", customer: "Dr. Aarti Sharma", plan: "Alternate Days", bottles: 1, empties: 1, timeSlot: "07:00 AM", route: "Zone C - Kalyani Nagar", deliveryBoy: "Sunil Shinde", status: "Out for Delivery", address: "Bungalow 7, River View" },
  { id: "SUB-DLV-104", customer: "Anand Mahindra", plan: "Weekly Family Pack", bottles: 2, empties: 2, timeSlot: "07:45 AM", route: "Zone A - Viman Nagar", deliveryBoy: "Ramesh Pawar", status: "Pending Dispatch", address: "Villa 22, Sky Palms" },
  { id: "SUB-DLV-105", customer: "Vikram Kirloskar", plan: "Daily Hydration", bottles: 1, empties: 1, timeSlot: "06:45 AM", route: "Zone D - Koregaon Park", deliveryBoy: "Arjun Verma", status: "Delivered", address: "Lane 5, Koregaon Park" },
  { id: "SUB-DLV-106", customer: "Meera Nair", plan: "Alternate Days", bottles: 1, empties: 0, timeSlot: "08:00 AM", route: "Zone B - Magarpatta", deliveryBoy: "Vikas Patil", status: "Customer Paused", address: "Plot 80, Lake Town" },
];

const SubscriptionOrders = () => {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      const matchSearch =
        !search ||
        d.customer.toLowerCase().includes(search.toLowerCase()) ||
        d.route.toLowerCase().includes(search.toLowerCase()) ||
        d.deliveryBoy.toLowerCase().includes(search.toLowerCase());
      const matchRoute = routeFilter === "all" || d.route.includes(routeFilter);
      const matchStatus = statusFilter === "all" || d.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchRoute && matchStatus;
    });
  }, [deliveries, search, routeFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalBottles = deliveries.reduce((acc, d) => acc + d.bottles, 0);
    const deliveredCount = deliveries.filter((d) => d.status === "Delivered").length;
    const pendingCount = deliveries.filter((d) => d.status.includes("Pending") || d.status.includes("Out")).length;
    return { totalTrips: deliveries.length, totalBottles, deliveredCount, pendingCount };
  }, [deliveries]);

  return (
    <div className="SubscriptionOrders">
      <header className="SubscriptionOrders-header">
        <div className="SubscriptionOrders-heading">
          <div className="SubscriptionOrders-headingIcon">
            <FiCalendar />
          </div>
          <h1>Subscription Orders & Daily Dispatch</h1>
        </div>
        <div className="SubscriptionOrders-actions">
          <button type="button" className="SubscriptionOrders-btn secondary" onClick={() => setDeliveries([...initialDeliveries])}>
            <FiRefreshCw /> <span>Sync Schedule</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="SubscriptionOrders-statsGrid">
        <div className="SubscriptionOrders-statCard">
          <div className="SubscriptionOrders-statIcon trips"><FiCalendar /></div>
          <div><span className="SubscriptionOrders-statLabel">Today's Deliveries</span><span className="SubscriptionOrders-statValue">{stats.totalTrips} Stops</span></div>
        </div>
        <div className="SubscriptionOrders-statCard">
          <div className="SubscriptionOrders-statIcon bottles"><FiPackage /></div>
          <div><span className="SubscriptionOrders-statLabel">Jars to Dispatch</span><span className="SubscriptionOrders-statValue">{stats.totalBottles} Jars</span></div>
        </div>
        <div className="SubscriptionOrders-statCard">
          <div className="SubscriptionOrders-statIcon delivered"><FiCheckCircle /></div>
          <div><span className="SubscriptionOrders-statLabel">Completed</span><span className="SubscriptionOrders-statValue">{stats.deliveredCount} Delivered</span></div>
        </div>
        <div className="SubscriptionOrders-statCard">
          <div className="SubscriptionOrders-statIcon transit"><FiTruck /></div>
          <div><span className="SubscriptionOrders-statLabel">In Transit / Pending</span><span className="SubscriptionOrders-statValue">{stats.pendingCount} Remaining</span></div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="SubscriptionOrders-controlBar">
        <div className="SubscriptionOrders-searchBox">
          <FiSearch className="SubscriptionOrders-searchIcon" />
          <input
            type="text"
            placeholder="Search customer, delivery boy, or delivery route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="SubscriptionOrders-filterGroup">
          <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}>
            <option value="all">All Delivery Zones</option>
            <option value="Zone A">Zone A - Viman Nagar</option>
            <option value="Zone B">Zone B - Magarpatta</option>
            <option value="Zone C">Zone C - Kalyani Nagar</option>
            <option value="Zone D">Zone D - Koregaon Park</option>
          </select>
          <div className="SubscriptionOrders-statusTabs">
            <button type="button" className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>All</button>
            <button type="button" className={statusFilter === "delivered" ? "active" : ""} onClick={() => setStatusFilter("delivered")}>Delivered</button>
            <button type="button" className={statusFilter === "out for delivery" ? "active" : ""} onClick={() => setStatusFilter("out for delivery")}>In Transit</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="SubscriptionOrders-tableCard">
        <table className="SubscriptionOrders-table">
          <thead>
            <tr>
              <th>Delivery ID / Time</th>
              <th>Customer & Plan</th>
              <th>Jars Delivery / Return</th>
              <th>Zone / Address</th>
              <th>Assigned Partner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.id}</strong>
                  <span className="SubscriptionOrders-subText"><FiClock /> {item.timeSlot}</span>
                </td>
                <td>
                  <strong>{item.customer}</strong>
                  <span className="SubscriptionOrders-subText">{item.plan}</span>
                </td>
                <td>
                  <span className="SubscriptionOrders-bottlesBadge deliver">+{item.bottles} Full 20L</span>
                  <span className="SubscriptionOrders-bottlesBadge return">-{item.empties} Empty</span>
                </td>
                <td>
                  <strong>{item.route}</strong>
                  <span className="SubscriptionOrders-subText">{item.address}</span>
                </td>
                <td>
                  <span className="SubscriptionOrders-rider"><FiUser /> {item.deliveryBoy}</span>
                </td>
                <td>
                  <span className={`SubscriptionOrders-statusPill ${item.status.toLowerCase().replace(/\s/g, "-")}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionOrders;

