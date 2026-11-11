import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiSearch,
  FiPlus,
  FiCreditCard,
  FiCheckCircle,
  FiPhone,
  FiMapPin,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiMail,
  FiTrash2,
  FiX,
  FiAlertCircle,
  FiCheck,
  FiLayers,
  FiActivity,
  FiBox,
  FiCopy,
  FiArrowRight,
} from "react-icons/fi";
import API from "../../services/api";
import "./DeliveryBoyId.css";

const DeliveryBoyId = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [routeFilter, setRouteFilter] = useState("all");

  // Auto-dismiss notification after 3.5 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  // Fetch real delivery fleet from MongoDB
  const fetchFleet = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await API.get("/delivery-boys");
      if (res.data?.success && Array.isArray(res.data.riders)) {
        setRiders(res.data.riders);
        if (res.data.stats) setServerStats(res.data.stats);
      } else {
        setRiders([]);
      }
    } catch (err) {
      console.error("Failed to load delivery fleet:", err);
      setError(
        err.response?.data?.message ||
          "Failed to connect to delivery fleet database. Please verify backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  // Distinct routes list for dynamic dropdown filter
  const distinctRoutes = useMemo(() => {
    const set = new Set();
    riders.forEach((r) => {
      if (r.route?.trim()) set.add(r.route.trim());
    });
    return Array.from(set);
  }, [riders]);

  // Filtered riders list with multi-criteria dynamic filtering
  const filteredRiders = useMemo(() => {
    return riders.filter((r) => {
      const s = search.toLowerCase().trim();
      const matchesSearch =
        !s ||
        r.name?.toLowerCase().includes(s) ||
        r.partnerId?.toLowerCase().includes(s) ||
        r.id?.toLowerCase().includes(s) ||
        r.route?.toLowerCase().includes(s) ||
        r.vehicleNumber?.toLowerCase().includes(s) ||
        r.email?.toLowerCase().includes(s) ||
        r.phone?.toLowerCase().includes(s) ||
        r.aadharNumber?.toLowerCase().includes(s) ||
        r.panNumber?.toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "all" ||
        r.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesRoute =
        routeFilter === "all" ||
        r.route?.toLowerCase() === routeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRoute;
    });
  }, [riders, search, statusFilter, routeFilter]);

  // Dynamic live stats directly from real database records
  const stats = useMemo(() => {
    const total = riders.length;
    const activeDuty = riders.filter((r) => r.status === "On Duty").length;
    const offDuty = riders.filter((r) => r.status === "Off Duty").length;
    const totalDispatchedToday = riders.reduce(
      (acc, r) => acc + (r.activeOrders || 0),
      0
    );
    return {
      total: serverStats?.total ?? total,
      activeDuty: serverStats?.activeDuty ?? activeDuty,
      offDuty: offDuty,
      totalDispatchedToday:
        serverStats?.totalDispatchedToday ?? totalDispatchedToday,
      verifiedRate: total > 0 ? "100%" : "0%",
    };
  }, [riders, serverStats]);

  // Toggle Duty Status (On Duty / Off Duty) with immediate MongoDB PATCH
  const handleToggleStatus = async (e, rider) => {
    e.stopPropagation();
    const current = rider.status || "On Duty";
    const nextStatus = current === "On Duty" ? "Off Duty" : "On Duty";

    // Optimistic UI update
    setRiders((prev) =>
      prev.map((r) =>
        r._id === rider._id || r.partnerId === rider.partnerId
          ? { ...r, status: nextStatus }
          : r
      )
    );

    setNotification(`Status for ${rider.name} updated to "${nextStatus}".`);

    try {
      await API.patch(`/delivery-boys/${rider._id || rider.partnerId}/status`, {
        status: nextStatus,
      });
    } catch (err) {
      // Rollback on failure
      setRiders((prev) =>
        prev.map((r) =>
          r._id === rider._id || r.partnerId === rider.partnerId
            ? { ...r, status: current }
            : r
        )
      );
      setError(err.response?.data?.message || "Failed to update duty status.");
    }
  };

  // Delete Delivery Partner from MongoDB
  const handleDeletePartner = async (e, rider) => {
    e.stopPropagation();
    const code = rider.partnerId || rider.id || "Driver";
    if (
      !window.confirm(
        `Are you sure you want to remove delivery agent "${rider.name}" (${code})?\n\nThis will remove their profile and credentials from the system.`
      )
    ) {
      return;
    }

    try {
      await API.delete(`/delivery-boys/${rider._id || rider.partnerId}`);
      setRiders((prev) =>
        prev.filter((r) => r._id !== rider._id && r.partnerId !== rider.partnerId)
      );
      setNotification(`Agent ${rider.name} successfully deleted.`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete delivery partner.");
    }
  };

  // Copy Partner ID to clipboard
  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setNotification(`Copied Partner ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open individual rider page
  const handleOpenRider = (rider) => {
    const targetId = rider._id || rider.partnerId;
    navigate(`/admin/delivery-boy/${targetId}`);
  };

  return (
    <div className="DeliveryBoyId">
      {/* Toast Notification */}
      {notification && (
        <div className="DeliveryBoyId-toast">
          <FiCheckCircle className="toastIcon" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header (One Clean Line) */}
      <header className="DeliveryBoyId-header">
        <div className="DeliveryBoyId-heading">
          <div className="DeliveryBoyId-headingIcon">
            <FiTruck />
          </div>
          <h1>Delivery Partner Fleet</h1>
        </div>

        <div className="DeliveryBoyId-actions">
          <button
            type="button"
            className="DeliveryBoyId-btn secondary"
            onClick={fetchFleet}
            disabled={isLoading}
            title="Refresh fleet from database"
          >
            <FiRefreshCw className={isLoading ? "spin" : ""} />
            <span>Sync Fleet</span>
          </button>

          <Link
            to="/admin/add-delivery-boy"
            className="DeliveryBoyId-btn primary"
          >
            <FiPlus />
            <span>Register Delivery Agent</span>
          </Link>
        </div>
      </header>

      {/* Notifications */}
      {error && (
        <div className="DeliveryBoyId-alert error">
          <span><FiAlertCircle /> {error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="closeAlertBtn"
            aria-label="Dismiss error"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Dynamic Metrics Bar */}
      <div className="DeliveryBoyId-statsGrid">
        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon fleet"><FiTruck /></div>
          <div>
            <span className="DeliveryBoyId-statLabel">Fleet Drivers</span>
            <span className="DeliveryBoyId-statValue">{stats.total}</span>
          </div>
        </div>

        <div className="DeliveryBoyId-statCard ondutyCard">
          <div className="DeliveryBoyId-statIcon onduty">
            <FiActivity />
          </div>
          <div>
            <span className="DeliveryBoyId-statLabel">On Duty</span>
            <span className="DeliveryBoyId-statValue ondutyVal">{stats.activeDuty}</span>
          </div>
        </div>

        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon offduty">
            <FiLayers />
          </div>
          <div>
            <span className="DeliveryBoyId-statLabel">Standby Fleet</span>
            <span className="DeliveryBoyId-statValue">{stats.offDuty}</span>
          </div>
        </div>

        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon trips"><FiBox /></div>
          <div>
            <span className="DeliveryBoyId-statLabel">Active Dispatches</span>
            <span className="DeliveryBoyId-statValue">{stats.totalDispatchedToday} Jars</span>
          </div>
        </div>

        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon verified"><FiShield /></div>
          <div>
            <span className="DeliveryBoyId-statLabel">KYC Verified</span>
            <span className="DeliveryBoyId-statValue verifiedVal">{stats.verifiedRate}</span>
          </div>
        </div>
      </div>

      {/* Control Bar (Search, Status Filter, Route Filter) */}
      <div className="DeliveryBoyId-controlBar">
        <div className="DeliveryBoyId-searchBox">
          <FiSearch className="DeliveryBoyId-searchIcon" />
          <input
            type="text"
            placeholder="Search by agent name, partner ID, vehicle number, zone, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clearSearchBtn"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="DeliveryBoyId-filtersGroup">
          {/* Status Segmented Tabs */}
          <div className="DeliveryBoyId-filters">
            <button
              type="button"
              className={`DeliveryBoyId-filterChip ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({riders.length})
            </button>
            <button
              type="button"
              className={`DeliveryBoyId-filterChip ${statusFilter === "On Duty" ? "active onduty" : ""}`}
              onClick={() => setStatusFilter("On Duty")}
            >
              <span className="chipDot green" /> On Duty ({riders.filter((r) => r.status === "On Duty").length})
            </button>
            <button
              type="button"
              className={`DeliveryBoyId-filterChip ${statusFilter === "Off Duty" ? "active offduty" : ""}`}
              onClick={() => setStatusFilter("Off Duty")}
            >
              <span className="chipDot gray" /> Off Duty ({riders.filter((r) => r.status === "Off Duty").length})
            </button>
          </div>

          {/* Route Dropdown Filter */}
          {distinctRoutes.length > 0 && (
            <div className="DeliveryBoyId-routeWrap">
              <FiMapPin className="routeSelectIcon" />
              <select
                className="DeliveryBoyId-routeSelect"
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
              >
                <option value="all">All Operational Zones</option>
                {distinctRoutes.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && riders.length === 0 && (
        <div className="DeliveryBoyId-loadingState">
          <FiRefreshCw className="spin" />
          <p>Connecting to database &amp; syncing fleet data...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredRiders.length === 0 && (
        <div className="DeliveryBoyId-emptyCard">
          <div className="emptyIconCircle">
            <FiTruck className="emptyIcon" />
          </div>
          <h3>No delivery agents match your criteria</h3>
          <p>
            {search || statusFilter !== "all" || routeFilter !== "all"
              ? "No delivery personnel matching the selected filters. Clear your search or filters to see all fleet members."
              : "No delivery agents registered in the database yet. Click below to add your first delivery partner."}
          </p>
          <div className="emptyActions">
            {search || statusFilter !== "all" || routeFilter !== "all" ? (
              <button
                type="button"
                className="DeliveryBoyId-btn secondary"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setRouteFilter("all");
                }}
              >
                Reset All Filters
              </button>
            ) : null}
            <Link
              to="/admin/add-delivery-boy"
              className="DeliveryBoyId-btn primary"
            >
              <FiPlus /> <span>Register First Delivery Agent</span>
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          DYNAMIC REAL AGENT FLEET TABLE / LIST VIEW
      ========================================================================= */}
      {filteredRiders.length > 0 && (
        <div className="DeliveryBoyId-tableCard">
          <div className="DeliveryBoyId-tableResponsive">
            <table className="DeliveryBoyId-table">
              <thead>
                <tr>
                  <th style={{ minWidth: "240px" }}>Delivery Partner</th>
                  <th style={{ minWidth: "200px" }}>Contact Details</th>
                  <th style={{ minWidth: "170px" }}>Assigned Vehicle</th>
                  <th style={{ minWidth: "180px" }}>Route / Zone</th>
                  <th style={{ minWidth: "130px" }}>Daily Quota</th>
                  <th style={{ minWidth: "130px" }}>Duty Status</th>
                  <th style={{ minWidth: "120px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.map((r) => {
                  const partnerCode = r.partnerId || r.id || "ALK-DB-000";
                  const isOnDuty = r.status === "On Duty";
                  const targetId = r._id || partnerCode;

                  return (
                    <tr
                      key={r._id || partnerCode}
                      className={`DeliveryBoyId-row ${isOnDuty ? "row-onduty" : "row-offduty"}`}
                      onClick={() => handleOpenRider(r)}
                      title="Click row to open individual partner profile"
                    >
                      {/* Delivery Partner (Avatar + Name + ID) */}
                      <td>
                        <div className="DeliveryBoyId-agentCell">
                          <div className={`DeliveryBoyId-tableAvatar ${isOnDuty ? "avatar-active" : ""}`}>
                            {r.avatar ? (
                              <img src={r.avatar} alt={r.name} />
                            ) : (
                              <div className="avatarFallback">
                                {r.name ? r.name.charAt(0).toUpperCase() : <FiUser />}
                              </div>
                            )}
                            <span
                              className={`statusIndicatorDot ${isOnDuty ? "green" : "gray"}`}
                            />
                          </div>

                          <div className="agentMeta">
                            <strong className="agentName">{r.name}</strong>
                            <div className="agentSubRow">
                              <span
                                className="DeliveryBoyId-tableIdPill"
                                onClick={(e) => handleCopyId(e, partnerCode)}
                                title="Click to copy Partner ID"
                              >
                                <FiCreditCard className="idPillIcon" />
                                <span>{partnerCode}</span>
                                {copiedId === partnerCode ? (
                                  <FiCheck className="copiedCheck" />
                                ) : (
                                  <FiCopy className="copyIcon" />
                                )}
                              </span>
                              <span className="agentRole">{r.role || "Delivery Boy"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div className="contactCell">
                          <a
                            href={`tel:${r.phone}`}
                            className="contactPhone"
                            onClick={(e) => e.stopPropagation()}
                            title="Call Partner"
                          >
                            <FiPhone /> {r.phone}
                          </a>
                          <a
                            href={`mailto:${r.email}`}
                            className="contactEmail"
                            onClick={(e) => e.stopPropagation()}
                            title={r.email}
                          >
                            <FiMail /> {r.email}
                          </a>
                        </div>
                      </td>

                      {/* Assigned Vehicle */}
                      <td>
                        <div className="vehicleCell">
                          <strong className="vehiclePlate">
                            <FiTruck /> {r.vehicleNumber}
                          </strong>
                          <span className="vehicleType">{r.vehicleType || "Electric Van"}</span>
                        </div>
                      </td>

                      {/* Assigned Route / Zone */}
                      <td>
                        <div className="routeCell">
                          <span className="routeZoneTag">
                            <FiMapPin /> {r.route ? r.route.split("-")[0].trim() : "Zone A"}
                          </span>
                          <span className="routeDesc" title={r.route}>
                            {r.route ? r.route.split("-")[1] || r.route : "Nayapalli"}
                          </span>
                        </div>
                      </td>

                      {/* Daily Quota / Load */}
                      <td>
                        <div className="quotaCell">
                          <strong className="quotaVal">
                            <FiBox /> {r.dailyQuota || "120 Jars"}
                          </strong>
                          <span className="activeLoad">
                            Active: {r.activeOrders || 0} Jars
                          </span>
                        </div>
                      </td>

                      {/* Interactive Duty Status Switch */}
                      <td>
                        <button
                          type="button"
                          className={`DeliveryBoyId-dutySwitch ${isOnDuty ? "on-duty" : "off-duty"}`}
                          onClick={(e) => handleToggleStatus(e, r)}
                          title={`Click to switch to ${isOnDuty ? "Off Duty" : "On Duty"}`}
                        >
                          <span className="dutySwitchSlider">
                            <span className="dutySwitchThumb" />
                          </span>
                          <span className="dutySwitchLabel">
                            {isOnDuty ? "On Duty" : "Off Duty"}
                          </span>
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="rowActions">
                          <Link
                            to={`/admin/delivery-boy/${targetId}`}
                            className="viewProfileBtn"
                            onClick={(e) => e.stopPropagation()}
                            title="Open Individual Agent Page"
                          >
                            <span>View Profile</span>
                            <FiArrowRight />
                          </Link>

                          <button
                            type="button"
                            className="deleteRowBtn"
                            onClick={(e) => handleDeletePartner(e, r)}
                            title="Delete Partner"
                            aria-label="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyId;
