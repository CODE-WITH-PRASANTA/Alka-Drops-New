import React, { useState, useMemo } from "react";
import {
  FiClipboard,
  FiSearch,
  FiCheckCircle,
  FiRefreshCw,
  FiTruck,
  FiPackage,
  FiLayers,
  FiAlertTriangle,
} from "react-icons/fi";
import "./AssigningBottle.css";

const initialAssignments = [
  { id: "ASN-2024-81", riderName: "Ramesh Pawar", vehicle: "Loader Van (MH-12-EV-4421)", route: "Zone A - Viman Nagar", jarsLoaded: 120, delivered: 98, returnedEmpties: 94, damaged: 1, pending: 22, status: "Active Run" },
  { id: "ASN-2024-82", riderName: "Vikas Patil", vehicle: "E-Bike (MH-12-QE-1092)", route: "Zone B - Magarpatta", jarsLoaded: 90, delivered: 86, returnedEmpties: 86, damaged: 0, pending: 4, status: "Active Run" },
  { id: "ASN-2024-83", riderName: "Sunil Shinde", vehicle: "Loader Van (MH-12-EV-9021)", route: "Zone C - Kalyani Nagar", jarsLoaded: 140, delivered: 140, returnedEmpties: 138, damaged: 0, pending: 0, status: "Completed & Reconciled" },
  { id: "ASN-2024-84", riderName: "Arjun Verma", vehicle: "Tempo (MH-12-TC-3301)", route: "Zone D - Hinjewadi Corporate", jarsLoaded: 200, delivered: 182, returnedEmpties: 180, damaged: 2, pending: 18, status: "Active Run" },
];

const AssigningBottle = () => {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return assignments.filter(
      (a) =>
        !search ||
        a.riderName.toLowerCase().includes(search.toLowerCase()) ||
        a.route.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [assignments, search]);

  const stats = useMemo(() => {
    const totalLoaded = assignments.reduce((acc, a) => acc + a.jarsLoaded, 0);
    const totalDelivered = assignments.reduce((acc, a) => acc + a.delivered, 0);
    const totalReturned = assignments.reduce((acc, a) => acc + a.returnedEmpties, 0);
    const totalDamaged = assignments.reduce((acc, a) => acc + a.damaged, 0);
    return { totalLoaded, totalDelivered, totalReturned, totalDamaged };
  }, [assignments]);

  return (
    <div className="AssigningBottle">
      <header className="AssigningBottle-header">
        <div className="AssigningBottle-heading">
          <div className="AssigningBottle-headingIcon">
            <FiClipboard />
          </div>
          <h1>Assigning Bottles & Jar Dispatch Logs</h1>
        </div>
        <div className="AssigningBottle-actions">
          <button type="button" className="AssigningBottle-btn secondary" onClick={() => setAssignments([...initialAssignments])}>
            <FiRefreshCw /> <span>Sync Dispatch</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="AssigningBottle-statsGrid">
        <div className="AssigningBottle-statCard">
          <div className="AssigningBottle-statIcon loaded"><FiPackage /></div>
          <div><span className="AssigningBottle-statLabel">Total Loaded Today</span><span className="AssigningBottle-statValue">{stats.totalLoaded} Jars</span></div>
        </div>
        <div className="AssigningBottle-statCard">
          <div className="AssigningBottle-statIcon delivered"><FiCheckCircle /></div>
          <div><span className="AssigningBottle-statLabel">Delivered to Homes</span><span className="AssigningBottle-statValue">{stats.totalDelivered} Jars</span></div>
        </div>
        <div className="AssigningBottle-statCard">
          <div className="AssigningBottle-statIcon returned"><FiLayers /></div>
          <div><span className="AssigningBottle-statLabel">Empty Jars Returned</span><span className="AssigningBottle-statValue">{stats.totalReturned} Jars</span></div>
        </div>
        <div className="AssigningBottle-statCard">
          <div className="AssigningBottle-statIcon alert"><FiAlertTriangle /></div>
          <div><span className="AssigningBottle-statLabel">Damaged / Leakage</span><span className="AssigningBottle-statValue">{stats.totalDamaged} Bottles</span></div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="AssigningBottle-controlBar">
        <div className="AssigningBottle-searchBox">
          <FiSearch className="AssigningBottle-searchIcon" />
          <input
            type="text"
            placeholder="Search dispatch batch ID, rider name, or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="AssigningBottle-tableCard">
        <table className="AssigningBottle-table">
          <thead>
            <tr>
              <th>Dispatch ID</th>
              <th>Delivery Partner</th>
              <th>Route / Vehicle</th>
              <th>Jars Loaded</th>
              <th>Delivered</th>
              <th>Empties Collected</th>
              <th>Damaged</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.id}</strong></td>
                <td>
                  <strong>{item.riderName}</strong>
                </td>
                <td>
                  <span>{item.route}</span>
                  <span className="AssigningBottle-subText">{item.vehicle}</span>
                </td>
                <td><strong className="loadedText">{item.jarsLoaded} Jars</strong></td>
                <td><span className="deliveredText">{item.delivered}</span></td>
                <td><span className="returnedText">{item.returnedEmpties}</span></td>
                <td>{item.damaged > 0 ? <span className="damagedText">{item.damaged}</span> : "0"}</td>
                <td>
                  <span className={`AssigningBottle-statusPill ${item.status === "Completed & Reconciled" ? "completed" : "active"}`}>
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

export default AssigningBottle;

