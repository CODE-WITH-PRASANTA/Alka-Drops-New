import React, { useState, useEffect, useMemo } from "react";
import {
  FiTruck,
  FiSearch,
  FiPlus,
  FiCreditCard,
  FiCheckCircle,
  FiPhone,
  FiMapPin,
  FiRefreshCw,
  FiPrinter,
  FiShield,
  FiUser,
  FiMail,
  FiKey,
  FiFileText,
  FiTrash2,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import API from "../../services/api";
import "./DeliveryBoyId.css";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  password: "AlkaDelivery@2026",
  aadharNumber: "",
  panNumber: "",
  presentAddress: {
    street: "",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
  },
  permanentAddress: {
    street: "",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
  },
  sameAsPresent: true,
  vehicleType: "Electric Loader Van",
  vehicleNumber: "",
  route: "Zone A - Nayapalli / IRC Village / Jaydev Vihar",
  dailyQuota: "120 Jars",
  status: "On Duty",
  badgeColor: "#0d9488",
  avatar: "",
};

const DeliveryBoyId = () => {
  const [riders, setRiders] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRider, setSelectedRider] = useState(null);

  // Create Delivery Account Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");

  // Fetch delivery fleet from MongoDB
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
          "Failed to connect to delivery fleet database. Please ensure backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  // Filtered riders list
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

      return matchesSearch && matchesStatus;
    });
  }, [riders, search, statusFilter]);

  // Dynamic stats
  const stats = useMemo(() => {
    const total = riders.length;
    const activeDuty = riders.filter((r) => r.status === "On Duty").length;
    const totalDispatchedToday = riders.reduce(
      (acc, r) => acc + (r.activeOrders || 0),
      0
    );
    return {
      total: serverStats?.total ?? total,
      activeDuty: serverStats?.activeDuty ?? activeDuty,
      totalDispatchedToday:
        serverStats?.totalDispatchedToday ?? totalDispatchedToday,
      verifiedRate: "100%",
    };
  }, [riders, serverStats]);

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && prev.sameAsPresent) {
        // sync if needed
      }
      return next;
    });
  };

  const handlePresentAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const nextPresent = { ...prev.presentAddress, [name]: value };
      return {
        ...prev,
        presentAddress: nextPresent,
        permanentAddress: prev.sameAsPresent
          ? { ...nextPresent }
          : prev.permanentAddress,
      };
    });
  };

  const handlePermanentAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      permanentAddress: { ...prev.permanentAddress, [name]: value },
    }));
  };

  const handleSameAsPresentToggle = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsPresent: checked,
      permanentAddress: checked ? { ...prev.presentAddress } : prev.permanentAddress,
    }));
  };

  // Create Delivery Account (Assign Role: Delivery Boy)
  const handleCreateDeliveryAccount = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validate inputs
    if (!formData.name.trim()) return setFormError("Full name is required.");
    if (!formData.email.trim()) return setFormError("Email is required for login.");
    if (!formData.phone.trim()) return setFormError("Phone number is required.");
    if (!formData.aadharNumber.trim()) return setFormError("Aadhar card number is required.");
    if (!formData.panNumber.trim()) return setFormError("PAN card number is required.");
    if (!formData.vehicleNumber.trim()) return setFormError("Vehicle registration number is required.");

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password || "AlkaDelivery@2026",
        role: "Delivery Boy", // Explicitly assigned role
        aadharNumber: formData.aadharNumber.trim(),
        panNumber: formData.panNumber.trim().toUpperCase(),
        presentAddress: formData.presentAddress,
        permanentAddress: formData.sameAsPresent
          ? formData.presentAddress
          : formData.permanentAddress,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        route: formData.route,
        dailyQuota: formData.dailyQuota,
        status: formData.status,
        badgeColor: formData.badgeColor,
        avatar: formData.avatar,
      };

      const res = await API.post("/delivery-boys", payload);
      if (res.data?.success && res.data.rider) {
        setRiders((prev) => [res.data.rider, ...prev]);
        setSuccessMsg(
          `Delivery account created successfully! Role assigned: "Delivery Boy" (Partner ID: ${res.data.rider.partnerId}).`
        );
        setCreatedCredentials({
          name: res.data.rider.name,
          email: res.data.rider.email,
          role: "Delivery Boy",
          partnerId: res.data.rider.partnerId,
          password: payload.password,
        });

        setIsCreateModalOpen(false);
        setFormData(initialFormState);
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to create delivery account."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Duty Status (On Duty / Off Duty)
  const handleToggleStatus = async (rider) => {
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

    try {
      await API.patch(`/delivery-boys/${rider._id || rider.partnerId}/status`, {
        status: nextStatus,
      });
    } catch (err) {
      // Rollback
      setRiders((prev) =>
        prev.map((r) =>
          r._id === rider._id || r.partnerId === rider.partnerId
            ? { ...r, status: current }
            : r
        )
      );
      alert(err.response?.data?.message || "Failed to update duty status.");
    }
  };

  // Delete Delivery Partner
  const handleDeletePartner = async (rider) => {
    if (
      !window.confirm(
        `Are you sure you want to delete delivery partner "${rider.name}" (${rider.partnerId || rider.id}) and their account?`
      )
    ) {
      return;
    }

    try {
      await API.delete(`/delivery-boys/${rider._id || rider.partnerId}`);
      setRiders((prev) =>
        prev.filter((r) => r._id !== rider._id && r.partnerId !== rider.partnerId)
      );
      if (selectedRider?._id === rider._id) setSelectedRider(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete delivery partner.");
    }
  };

  return (
    <div className="DeliveryBoyId">
      <header className="DeliveryBoyId-header">
        <div className="DeliveryBoyId-heading">
          <div className="DeliveryBoyId-headingIcon">
            <FiTruck />
          </div>
          <div>
            <h1>Delivery Boy ID Generation & Fleet</h1>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
              Generate authorized delivery accounts with assigned role &ldquo;Delivery Boy&rdquo; and official ID cards.
            </p>
          </div>
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

          <button
            type="button"
            className="DeliveryBoyId-btn primary"
            onClick={() => {
              setFormError("");
              setIsCreateModalOpen(true);
            }}
          >
            <FiPlus />
            <span>Generate Delivery Account</span>
          </button>
        </div>
      </header>

      {/* Notifications */}
      {error && (
        <div className="DeliveryBoyId-alert error">
          <span><FiAlertCircle /> {error}</span>
          <button type="button" onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}><FiX /></button>
        </div>
      )}

      {createdCredentials && (
        <div className="DeliveryBoyId-credentialsBox">
          <h4>
            <FiCheckCircle /> New Delivery Account Successfully Generated &amp; Role Assigned!
          </h4>
          <div className="DeliveryBoyId-credentialsList">
            <div className="DeliveryBoyId-credItem">
              <span>Partner ID &amp; Name</span>
              <strong>{createdCredentials.partnerId} &bull; {createdCredentials.name}</strong>
            </div>
            <div className="DeliveryBoyId-credItem">
              <span>Login Email</span>
              <strong>{createdCredentials.email}</strong>
            </div>
            <div className="DeliveryBoyId-credItem">
              <span>Assigned Role</span>
              <strong style={{ color: "#0d9488" }}>{createdCredentials.role}</strong>
            </div>
            <div className="DeliveryBoyId-credItem">
              <span>Initial Password</span>
              <strong>{createdCredentials.password}</strong>
            </div>
            <div className="DeliveryBoyId-credItem" style={{ gridColumn: "span 2" }}>
              <span>Account Status</span>
              <strong style={{ color: "#059669" }}>Active &bull; Authorized in User Management &amp; Fleet</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreatedCredentials(null)}
            style={{
              marginTop: "10px",
              background: "#059669",
              color: "#fff",
              border: "none",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Dismiss Details
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="DeliveryBoyId-statsGrid">
        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon fleet"><FiTruck /></div>
          <div>
            <span className="DeliveryBoyId-statLabel">Fleet Drivers</span>
            <span className="DeliveryBoyId-statValue">{stats.total} Partners</span>
          </div>
        </div>
        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon onduty"><FiCheckCircle /></div>
          <div>
            <span className="DeliveryBoyId-statLabel">Currently On Duty</span>
            <span className="DeliveryBoyId-statValue">{stats.activeDuty} Active</span>
          </div>
        </div>
        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon trips"><FiCreditCard /></div>
          <div>
            <span className="DeliveryBoyId-statLabel">Orders in Delivery</span>
            <span className="DeliveryBoyId-statValue">{stats.totalDispatchedToday} Jars Live</span>
          </div>
        </div>
        <div className="DeliveryBoyId-statCard">
          <div className="DeliveryBoyId-statIcon verified"><FiShield /></div>
          <div>
            <span className="DeliveryBoyId-statLabel">KYC &amp; BG Check</span>
            <span className="DeliveryBoyId-statValue">{stats.verifiedRate} Verified</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="DeliveryBoyId-controlBar">
        <div className="DeliveryBoyId-searchBox">
          <FiSearch className="DeliveryBoyId-searchIcon" />
          <input
            type="text"
            placeholder="Search by Name, Partner ID, Aadhar, PAN, Route, Vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="DeliveryBoyId-filters">
          <button
            type="button"
            className={`DeliveryBoyId-filterChip ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Fleet ({riders.length})
          </button>
          <button
            type="button"
            className={`DeliveryBoyId-filterChip ${statusFilter === "On Duty" ? "active" : ""}`}
            onClick={() => setStatusFilter("On Duty")}
          >
            On Duty ({riders.filter((r) => r.status === "On Duty").length})
          </button>
          <button
            type="button"
            className={`DeliveryBoyId-filterChip ${statusFilter === "Off Duty" ? "active" : ""}`}
            onClick={() => setStatusFilter("Off Duty")}
          >
            Off Duty ({riders.filter((r) => r.status === "Off Duty").length})
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && riders.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <FiRefreshCw className="spin" style={{ fontSize: "28px", color: "#0d9488", marginBottom: "8px" }} />
          <p>Loading authorized delivery fleet from database...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredRiders.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <FiTruck style={{ fontSize: "40px", color: "#94a3b8", marginBottom: "12px" }} />
          <h3 style={{ margin: "0 0 6px", color: "#1e293b" }}>No delivery personnel found</h3>
          <p style={{ color: "#64748b", margin: "0 0 16px", fontSize: "14px" }}>
            {search ? `No delivery boys matching "${search}".` : "No delivery boys registered in this view."}
          </p>
          <button
            type="button"
            className="DeliveryBoyId-btn primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus /> <span>Generate First Delivery Account</span>
          </button>
        </div>
      )}

      {/* Riders Grid */}
      <div className="DeliveryBoyId-grid">
        {filteredRiders.map((r) => {
          const partnerCode = r.partnerId || r.id || "ALK-DB-000";
          const isOnDuty = r.status === "On Duty";
          return (
            <div key={r._id || partnerCode} className="DeliveryBoyId-card">
              <div className="DeliveryBoyId-cardTop">
                <div
                  className="DeliveryBoyId-badgeId"
                  style={{ backgroundColor: r.badgeColor || "#0d9488" }}
                >
                  <FiCreditCard /> {partnerCode}
                </div>

                <button
                  type="button"
                  className={`DeliveryBoyId-statusToggle ${isOnDuty ? "on-duty" : "off-duty"}`}
                  onClick={() => handleToggleStatus(r)}
                  title="Click to toggle duty status"
                >
                  {r.status || "On Duty"}
                </button>
              </div>

              <div className="DeliveryBoyId-cardBody">
                <h3 className="DeliveryBoyId-name">{r.name}</h3>
                <span className="DeliveryBoyId-roleTag">Role: {r.role || "Delivery Boy"}</span>
                <p className="DeliveryBoyId-phone">
                  <FiPhone /> {r.phone}
                </p>
                <p className="DeliveryBoyId-email">
                  <FiMail style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  {r.email}
                </p>

                <div className="DeliveryBoyId-infoRow">
                  <span className="label">Vehicle:</span>
                  <span className="val">{r.vehicleNumber} ({r.vehicleType || "EV"})</span>
                </div>
                <div className="DeliveryBoyId-infoRow">
                  <span className="label">Primary Route:</span>
                  <span className="val">{r.route}</span>
                </div>
                <div className="DeliveryBoyId-infoRow">
                  <span className="label">Daily Quota:</span>
                  <span className="val">{r.dailyQuota || "120 Jars"}</span>
                </div>
                <div className="DeliveryBoyId-infoRow">
                  <span className="label">KYC Verified:</span>
                  <span className="val" style={{ color: "#059669" }}>
                    Aadhar &amp; PAN &check;
                  </span>
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
                <button
                  type="button"
                  className="DeliveryBoyId-deleteBtn"
                  onClick={() => handleDeletePartner(r)}
                  title="Delete delivery partner & account"
                  aria-label="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ID Card Modal */}
      {selectedRider && (
        <div
          className="DeliveryBoyId-modalBackdrop"
          onClick={() => setSelectedRider(null)}
        >
          <div
            className="DeliveryBoyId-idModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="DeliveryBoyId-idCardHeader">
              <span className="brand">ALKA DROPS</span>
              <span className="pass">OFFICIAL HYDRATION DELIVERY PASS</span>
            </div>

            <div className="DeliveryBoyId-idCardBody">
              <div className="avatarBox">
                {selectedRider.avatar ? (
                  <img
                    src={selectedRider.avatar}
                    alt={selectedRider.name}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <FiUser />
                )}
              </div>
              <h2 className="name">{selectedRider.name}</h2>
              <span className="roleBadge">Role: {selectedRider.role || "Delivery Boy"}</span>

              <div className="idDetails">
                <div>
                  <span>Partner ID:</span>
                  <strong>{selectedRider.partnerId || selectedRider.id}</strong>
                </div>
                <div>
                  <span>Contact Phone:</span>
                  <strong>{selectedRider.phone}</strong>
                </div>
                <div>
                  <span>Email Account:</span>
                  <strong>{selectedRider.email}</strong>
                </div>
                <div>
                  <span>Vehicle Assigned:</span>
                  <strong>{selectedRider.vehicleNumber} ({selectedRider.vehicleType})</strong>
                </div>
                <div>
                  <span>Assigned Zone:</span>
                  <strong>{selectedRider.route}</strong>
                </div>
                <div>
                  <span>Daily Capacity:</span>
                  <strong>{selectedRider.dailyQuota || "120 Jars"}</strong>
                </div>
                <div>
                  <span>Aadhar Number:</span>
                  <strong>{selectedRider.aadharNumber || "Verified"}</strong>
                </div>
                <div>
                  <span>PAN Number:</span>
                  <strong>{selectedRider.panNumber || "Verified"}</strong>
                </div>
                <div>
                  <span>Present Address:</span>
                  <strong>
                    {selectedRider.presentAddress?.street
                      ? `${selectedRider.presentAddress.street}, ${selectedRider.presentAddress.city || "Bhubaneswar"}`
                      : "Bhubaneswar, Odisha"}
                  </strong>
                </div>
                {selectedRider.permanentAddress?.street && (
                  <div>
                    <span>Permanent Address:</span>
                    <strong>
                      {`${selectedRider.permanentAddress.street}, ${selectedRider.permanentAddress.city || "Bhubaneswar"}`}
                    </strong>
                  </div>
                )}
                <div>
                  <span>Duty Status:</span>
                  <strong style={{ color: selectedRider.status === "On Duty" ? "#059669" : "#64748b" }}>
                    {selectedRider.status || "On Duty"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="DeliveryBoyId-idCardFooter">
              <button
                type="button"
                className="printBtn"
                onClick={() => window.print()}
              >
                <FiPrinter /> Print ID Badge
              </button>
              <button
                type="button"
                className="closeBtn"
                onClick={() => setSelectedRider(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Delivery Account Modal */}
      {isCreateModalOpen && (
        <div
          className="DeliveryBoyId-modalBackdrop"
          onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
        >
          <div
            className="DeliveryBoyId-createModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="DeliveryBoyId-createModalHeader">
              <h2>
                <FiUser /> Generate Delivery Account (Role: Delivery Boy)
              </h2>
              <button
                type="button"
                className="DeliveryBoyId-closeX"
                onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateDeliveryAccount}>
              <div className="DeliveryBoyId-createModalBody">
                {formError && (
                  <div className="DeliveryBoyId-alert error" style={{ margin: 0 }}>
                    <span><FiAlertCircle /> {formError}</span>
                  </div>
                )}

                {/* Account Details */}
                <div className="DeliveryBoyId-sectionTitle">
                  <span>1. Account &amp; Login Credentials</span>
                  <span style={{ fontSize: "11px", color: "#64748b", textTransform: "none" }}>
                    Role will be assigned as &ldquo;Delivery Boy&rdquo;
                  </span>
                </div>

                <div className="DeliveryBoyId-formGrid">
                  <div className="DeliveryBoyId-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Deepak Kumar Nayak"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Email Address (Account Login) *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. deepak.delivery@alkadrops.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Assigned System Role</label>
                    <input
                      type="text"
                      value="Delivery Boy"
                      readOnly
                      title="Role is permanently locked to Delivery Boy"
                    />
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Initial Login Password *</label>
                    <input
                      type="text"
                      name="password"
                      placeholder="Enter password or keep default"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Badge Card Color</label>
                    <select
                      name="badgeColor"
                      value={formData.badgeColor}
                      onChange={handleInputChange}
                    >
                      <option value="#0d9488">Teal Green (#0d9488)</option>
                      <option value="#0284c7">Sky Blue (#0284c7)</option>
                      <option value="#10b981">Emerald Green (#10b981)</option>
                      <option value="#6366f1">Indigo Purple (#6366f1)</option>
                      <option value="#f59e0b">Amber Gold (#f59e0b)</option>
                    </select>
                  </div>
                </div>

                {/* Identity & KYC */}
                <div className="DeliveryBoyId-sectionTitle">
                  <span>2. Identity &amp; Government KYC Documents</span>
                </div>

                <div className="DeliveryBoyId-formGrid">
                  <div className="DeliveryBoyId-field">
                    <label>Aadhar Card Number (12 Digits) *</label>
                    <input
                      type="text"
                      name="aadharNumber"
                      placeholder="e.g. 5621 8902 4412"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>PAN Card Number (10 Characters) *</label>
                    <input
                      type="text"
                      name="panNumber"
                      placeholder="e.g. ABCDE1234F"
                      value={formData.panNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          panNumber: e.target.value.toUpperCase(),
                        }))
                      }
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                {/* Present Address */}
                <div className="DeliveryBoyId-sectionTitle">
                  <span>3. Present Residential Address</span>
                </div>

                <div className="DeliveryBoyId-formGrid full">
                  <div className="DeliveryBoyId-field">
                    <label>Street / Flat / Colony Landmark *</label>
                    <input
                      type="text"
                      name="street"
                      placeholder="e.g. Plot No 120, Near Crown Hotel, Nayapalli"
                      value={formData.presentAddress.street}
                      onChange={handlePresentAddressChange}
                      required
                    />
                  </div>
                </div>

                <div className="DeliveryBoyId-formGrid">
                  <div className="DeliveryBoyId-field">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.presentAddress.city}
                      onChange={handlePresentAddressChange}
                      required
                    />
                  </div>
                  <div className="DeliveryBoyId-field">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.presentAddress.state}
                      onChange={handlePresentAddressChange}
                      required
                    />
                  </div>
                  <div className="DeliveryBoyId-field">
                    <label>Postal Code / PIN *</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="e.g. 751012"
                      value={formData.presentAddress.postalCode}
                      onChange={handlePresentAddressChange}
                      required
                    />
                  </div>
                </div>

                {/* Permanent Address */}
                <div className="DeliveryBoyId-sectionTitle">
                  <span>4. Permanent Address</span>
                  <label className="DeliveryBoyId-checkboxLabel">
                    <input
                      type="checkbox"
                      checked={formData.sameAsPresent}
                      onChange={handleSameAsPresentToggle}
                    />
                    Same as Present Address
                  </label>
                </div>

                {!formData.sameAsPresent && (
                  <>
                    <div className="DeliveryBoyId-formGrid full">
                      <div className="DeliveryBoyId-field">
                        <label>Permanent Street / Village / Post *</label>
                        <input
                          type="text"
                          name="street"
                          placeholder="e.g. At/PO Kendrapara Town, Ward 4"
                          value={formData.permanentAddress.street}
                          onChange={handlePermanentAddressChange}
                          required={!formData.sameAsPresent}
                        />
                      </div>
                    </div>

                    <div className="DeliveryBoyId-formGrid">
                      <div className="DeliveryBoyId-field">
                        <label>City / District</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.permanentAddress.city}
                          onChange={handlePermanentAddressChange}
                          required={!formData.sameAsPresent}
                        />
                      </div>
                      <div className="DeliveryBoyId-field">
                        <label>State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.permanentAddress.state}
                          onChange={handlePermanentAddressChange}
                          required={!formData.sameAsPresent}
                        />
                      </div>
                      <div className="DeliveryBoyId-field">
                        <label>Postal Code / PIN</label>
                        <input
                          type="text"
                          name="postalCode"
                          placeholder="e.g. 754211"
                          value={formData.permanentAddress.postalCode}
                          onChange={handlePermanentAddressChange}
                          required={!formData.sameAsPresent}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Vehicle & Operational Details */}
                <div className="DeliveryBoyId-sectionTitle">
                  <span>5. Fleet Vehicle &amp; Delivery Zone</span>
                </div>

                <div className="DeliveryBoyId-formGrid">
                  <div className="DeliveryBoyId-field">
                    <label>Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                    >
                      <option value="Electric Loader Van">Electric Loader Van</option>
                      <option value="Cargo E-Bike">Cargo E-Bike</option>
                      <option value="Heavy Delivery Tempo">Heavy Delivery Tempo</option>
                      <option value="Delivery Two-Wheeler">Delivery Two-Wheeler</option>
                    </select>
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Vehicle Registration Number *</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      placeholder="e.g. OD-02-EV-4421"
                      value={formData.vehicleNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicleNumber: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Assigned Zone / Delivery Route</label>
                    <input
                      type="text"
                      name="route"
                      placeholder="e.g. Zone A - Nayapalli / IRC Village"
                      value={formData.route}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Daily Jar Quota</label>
                    <input
                      type="text"
                      name="dailyQuota"
                      placeholder="e.g. 120 Jars"
                      value={formData.dailyQuota}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Initial Duty Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </div>

                  <div className="DeliveryBoyId-field">
                    <label>Profile Photo URL (Optional)</label>
                    <input
                      type="url"
                      name="avatar"
                      placeholder="https://... (or leave blank for badge initials)"
                      value={formData.avatar}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="DeliveryBoyId-createModalFooter">
                <button
                  type="button"
                  className="DeliveryBoyId-btn secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="DeliveryBoyId-btn primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FiRefreshCw className="spin" /> Generating Account...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle /> Generate Account &amp; Assign Role
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyId;
