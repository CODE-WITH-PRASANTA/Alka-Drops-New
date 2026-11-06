import React, { useState, useMemo } from "react";
import {
  FiTruck,
  FiSearch,
  FiFilter,
  FiPlus,
  FiCreditCard,
  FiCheckCircle,
  FiPhone,
  FiMapPin,
  FiRefreshCw,
  FiPrinter,
  FiShield,
  FiUser,
} from "react-icons/fi";
import "./DeliveryBoyId.css";

const initialRiders = [
  { id: "ALK-RDR-001", name: "Ramesh Pawar", phone: "+91 98230 45671", vehicle: "Electric Loader Van (MH-12-EV-4421)", route: "Zone A - Viman Nagar / Kharadi", dailyQuota: "120 Jars", activeOrders: 8, status: "On Duty", joined: "14 Jan 2024", badgeColor: "#0d9488" },
  { id: "ALK-RDR-002", name: "Vikas Patil", phone: "+91 97651 88922", vehicle: "Cargo E-Bike (MH-12-QE-1092)", route: "Zone B - Magarpatta / Hadapsar", dailyQuota: "90 Jars", activeOrders: 4, status: "On Duty", joined: "02 Feb 2024", badgeColor: "#0284c7" },
  { id: "ALK-RDR-003", name: "Sunil Shinde", phone: "+91 98902 33411", vehicle: "Electric Loader Van (MH-12-EV-9021)", route: "Zone C - Kalyani Nagar / Koregaon", dailyQuota: "140 Jars", activeOrders: 11, status: "On Duty", joined: "19 Nov 2023", badgeColor: "#10b981" },
  { id: "ALK-RDR-004", name: "Arjun Verma", phone: "+91 91580 77209", vehicle: "Heavy Delivery Tempo (MH-12-TC-3301)", route: "Zone D - Hinjewadi IT Park Hub", dailyQuota: "200 Jars (Corporate)", activeOrders: 18, status: "On Duty", joined: "05 Jun 2023", badgeColor: "#6366f1" },
  { id: "ALK-RDR-005", name: "Sachin Gaikwad", phone: "+91 94220 55190", vehicle: "Cargo E-Bike (MH-12-QE-5512)", route: "Zone E - Baner / Aundh", dailyQuota: "80 Jars", activeOrders: 0, status: "Off Duty", joined: "10 Mar 2024", badgeColor: "#f59e0b" },
];

const DeliveryBoyId = () => {
  const [riders, setRiders] = useState(initialRiders);
  const [search, setSearch] = useState("");
  const [selectedRider, setSelectedRider] = useState(null);

  const filteredRiders = useMemo(() => {
    return riders.filter(
      (r) =>
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.route.toLowerCase().includes(search.toLowerCase())
    );
  }, [riders, search]);

  const stats = useMemo(() => {
    const total = riders.length;
    const activeDuty = riders.filter((r) => r.status === "On Duty").length;
    const totalDispatchedToday = riders.reduce((acc, r) => acc + r.activeOrders, 0);
    return { total, activeDuty, totalDispatchedToday };
  }, [riders]);

  return (
    <div className="DeliveryBoyId">
      <header className="DeliveryBoyId-header">
        <div className="DeliveryBoyId-heading">
          <div className="DeliveryBoyId-headingIcon">
            <FiTruck />
          </div>
          <h1>Delivery Boy ID Generation & Fleet</h1>
        </div>
        <div className="DeliveryBoyId-actions">
          <button type="button" className="DeliveryBoyId-btn secondary" onClick={() => setRiders([...initialRiders])}>
            <FiRefreshCw /> <span>Sync Fleet</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="DeliveryBoyId-statsGrid">
        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon fleet"><FiTruck /></div>
          <div><span className="DeliveryBoyId-statLabel">Fleet Drivers</span><span className="DeliveryBoyId-statValue">{stats.total} Partners</span></div>
        </div>
        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon onduty"><FiCheckCircle /></div>
          <div><span className="DeliveryBoyId-statLabel">Currently On Duty</span><span className="DeliveryBoyId-statValue">{stats.activeDuty} Active</span></div>
        </div>
        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon trips"><FiCreditCard /></div>
          <div><span className="DeliveryBoyId-statLabel">Orders in Delivery</span><span className="DeliveryBoyId-statValue">{stats.totalDispatchedToday} Jars Live</span></div>
        </div>
        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon verified"><FiShield /></div>
          <div><span className="DeliveryBoyId-statLabel">KYC & BG Check</span><span className="DeliveryBoyId-statValue">100% Verified</span></div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="DeliveryBoyId-controlBar">
        <div className="DeliveryBoyId-searchBox">
          <FiSearch className="DeliveryBoyId-searchIcon" />
          <input
            type="text"
            placeholder="Search by Rider ID, Name, or Zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Riders Grid */}
      <div className="DeliveryBoyId-grid">
        {filteredRiders.map((r) => (
          <div key={r.id} className="DeliveryBoyId-card">
            <div className="DeliveryBoyId-cardTop">
              <div className="DeliveryBoyId-badgeId" style={{ backgroundColor: r.badgeColor }}>
                <FiCreditCard /> {r.id}
              </div>
              <span className={`DeliveryBoyId-status ${r.status.toLowerCase().replace(/\s/g, "-")}`}>
                {r.status}
              </span>
            </div>

            <div className="DeliveryBoyId-cardBody">
              <h3 className="DeliveryBoyId-name">{r.name}</h3>
              <p className="DeliveryBoyId-phone"><FiPhone /> {r.phone}</p>
              <div className="DeliveryBoyId-infoRow">
                <span className="label">Vehicle:</span>
                <span>{r.vehicle}</span>
              </div>
              <div className="DeliveryBoyId-infoRow">
                <span className="label">Primary Route:</span>
                <strong>{r.route}</strong>
              </div>
              <div className="DeliveryBoyId-infoRow">
                <span className="label">Daily Capacity:</span>
                <span>{r.dailyQuota}</span>
              </div>
            </div>

            <div className="DeliveryBoyId-cardFooter">
              <button
                type="button"
                className="DeliveryBoyId-viewIdBtn"
                onClick={() => setSelectedRider(r)}
              >
                <FiCreditCard /> View ID Card
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ID Card Modal */}
      {selectedRider && (
        <div className="DeliveryBoyId-modalBackdrop" onClick={() => setSelectedRider(null)}>
          <div className="DeliveryBoyId-idModal" onClick={(e) => e.stopPropagation()}>
            <div className="DeliveryBoyId-idCardHeader">
              <span className="brand">ALKA DROPS</span>
              <span className="pass">OFFICIAL DELIVERY PASS</span>
            </div>
            <div className="DeliveryBoyId-idCardBody">
              <div className="avatarBox">
                <FiUser />
              </div>
              <h2 className="name">{selectedRider.name}</h2>
              <span className="role">Authorized Hydration Delivery Personnel</span>
              <div className="idDetails">
                <div><span>Partner ID:</span><strong>{selectedRider.id}</strong></div>
                <div><span>Contact:</span><strong>{selectedRider.phone}</strong></div>
                <div><span>Assigned Zone:</span><strong>{selectedRider.route}</strong></div>
                <div><span>Vehicle Reg:</span><strong>{selectedRider.vehicle}</strong></div>
              </div>
            </div>
            <div className="DeliveryBoyId-idCardFooter">
              <button type="button" className="printBtn" onClick={() => window.print()}>
                <FiPrinter /> Print ID Badge
              </button>
              <button type="button" className="closeBtn" onClick={() => setSelectedRider(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyId;

