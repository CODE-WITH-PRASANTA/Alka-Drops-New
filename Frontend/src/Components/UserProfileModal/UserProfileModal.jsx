import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMapPin,
  FiPackage,
  FiLogOut,
  FiX,
  FiCheck,
  FiEdit2,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiShoppingBag,
  FiCalendar,
} from "react-icons/fi";
import API from "../../services/api";
import "./UserProfileModal.css";

const UserProfileModal = ({
  isOpen,
  onClose,
  initialTab = "profile",
  currentUser,
  onLogout,
  onNavigateToShop,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      if (currentUser.address) {
        setAddress({
          street: currentUser.address.street || "",
          city: currentUser.address.city || "Bhubaneswar",
          state: currentUser.address.state || "Odisha",
          postalCode: currentUser.address.postalCode || "751012",
        });
      }
    }
  }, [currentUser]);

  // Load orders when orders tab is active
  useEffect(() => {
    if (isOpen && activeTab === "orders") {
      fetchUserOrders();
    }
  }, [isOpen, activeTab]);

  const fetchUserOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await API.get("/orders/my-orders");
      if (res.data?.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load user orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setStatusMsg({ type: "", text: "" });

      const res = await API.put("/auth/profile", {
        name: name.trim(),
        phone: phone.trim(),
      });

      if (res.data?.success && res.data.user) {
        localStorage.setItem("alka_user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setIsEditingProfile(false);
        setStatusMsg({ type: "success", text: "Profile details updated successfully!" });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setStatusMsg({ type: "", text: "" });

      const res = await API.put("/auth/profile", { address });

      if (res.data?.success && res.data.user) {
        localStorage.setItem("alka_user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setIsEditingAddress(false);
        setStatusMsg({ type: "success", text: "Delivery address updated successfully!" });
      }
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update delivery address.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="UserProfileModal-backdrop" onClick={onClose}>
      <div className="UserProfileModal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="UserProfileModal-header">
          <div className="UserProfileModal-header-info">
            <div className="UserProfileModal-avatar">{initials}</div>
            <div className="UserProfileModal-titles">
              <h3>{currentUser.name || "Customer Account"}</h3>
              <p>{currentUser.email}</p>
            </div>
          </div>
          <button
            type="button"
            className="UserProfileModal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div className="UserProfileModal-tabs">
          <button
            type="button"
            className={`UserProfileModal-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("profile");
              setStatusMsg({ type: "", text: "" });
            }}
          >
            <FiUser /> My Profile
          </button>

          <button
            type="button"
            className={`UserProfileModal-tab ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("addresses");
              setStatusMsg({ type: "", text: "" });
            }}
          >
            <FiMapPin /> My Addresses
          </button>

          <button
            type="button"
            className={`UserProfileModal-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("orders");
              setStatusMsg({ type: "", text: "" });
            }}
          >
            <FiPackage /> My Orders {orders.length > 0 && `(${orders.length})`}
          </button>
        </div>

        {/* Body */}
        <div className="UserProfileModal-body">
          {statusMsg.text && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: statusMsg.type === "success" ? "#ecfdf5" : "#fef2f2",
                color: statusMsg.type === "success" ? "#065f46" : "#b91c1c",
                border: `1px solid ${statusMsg.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {statusMsg.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB 1: MY PROFILE */}
          {activeTab === "profile" && (
            <div>
              <div className="UserProfileModal-card">
                <div className="UserProfileModal-card-title">
                  <h4>
                    <FiUser /> Personal Details
                  </h4>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      className="UserProfileModal-edit-toggle"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <FiEdit2 /> Edit
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile}>
                    <div className="UserProfileModal-grid">
                      <div className="UserProfileModal-field">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="UserProfileModal-field">
                        <label>Contact Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                        />
                      </div>
                      <div className="UserProfileModal-field">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={currentUser.email}
                          disabled
                          style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                        />
                      </div>
                      <div className="UserProfileModal-field">
                        <label>Account Role</label>
                        <input
                          type="text"
                          value={currentUser.role || "Retail Customer"}
                          disabled
                          style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                      <button
                        type="button"
                        className="UserProfileModal-cancel-btn"
                        onClick={() => setIsEditingProfile(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="UserProfileModal-save-btn"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Profile"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="UserProfileModal-grid">
                    <div className="UserProfileModal-field">
                      <label>Full Name</label>
                      <span className="UserProfileModal-field-val">{currentUser.name || "N/A"}</span>
                    </div>
                    <div className="UserProfileModal-field">
                      <label>Email Address</label>
                      <span className="UserProfileModal-field-val">{currentUser.email || "N/A"}</span>
                    </div>
                    <div className="UserProfileModal-field">
                      <label>Contact Phone</label>
                      <span className="UserProfileModal-field-val">{currentUser.phone || "Not provided"}</span>
                    </div>
                    <div className="UserProfileModal-field">
                      <label>Account Type / Plan</label>
                      <span className="UserProfileModal-field-val" style={{ color: "#004ea8" }}>
                        {currentUser.role || "Retail Customer"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY ADDRESSES */}
          {activeTab === "addresses" && (
            <div>
              <div className="UserProfileModal-card">
                <div className="UserProfileModal-card-title">
                  <h4>
                    <FiMapPin /> Primary Delivery Address
                  </h4>
                  {!isEditingAddress && (
                    <button
                      type="button"
                      className="UserProfileModal-edit-toggle"
                      onClick={() => setIsEditingAddress(true)}
                    >
                      <FiEdit2 /> Edit Address
                    </button>
                  )}
                </div>

                {isEditingAddress ? (
                  <form onSubmit={handleSaveAddress}>
                    <div className="UserProfileModal-grid full" style={{ marginBottom: "14px" }}>
                      <div className="UserProfileModal-field">
                        <label>Street / Flat / House Details</label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          placeholder="e.g. Plot No 120, IRC Village, Nayapalli"
                          required
                        />
                      </div>
                    </div>

                    <div className="UserProfileModal-grid">
                      <div className="UserProfileModal-field">
                        <label>City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="UserProfileModal-field">
                        <label>State</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          required
                        />
                      </div>
                      <div className="UserProfileModal-field">
                        <label>Postal Code / PIN</label>
                        <input
                          type="text"
                          value={address.postalCode}
                          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                      <button
                        type="button"
                        className="UserProfileModal-cancel-btn"
                        onClick={() => setIsEditingAddress(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="UserProfileModal-save-btn"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {address.street ? (
                      <div style={{ lineHeight: "1.6", color: "#1e293b", fontSize: "14px" }}>
                        <strong>{currentUser.name}</strong>
                        <div>{address.street}</div>
                        <div>
                          {address.city}, {address.state} - {address.postalCode}
                        </div>
                        {currentUser.phone && <div style={{ color: "#64748b" }}>Phone: {currentUser.phone}</div>}
                      </div>
                    ) : (
                      <div style={{ color: "#64748b", fontSize: "13.5px" }}>
                        <p style={{ margin: "0 0 10px" }}>No delivery address saved yet.</p>
                        <button
                          type="button"
                          className="UserProfileModal-save-btn"
                          onClick={() => setIsEditingAddress(true)}
                          style={{ padding: "6px 14px", fontSize: "12.5px" }}
                        >
                          + Add Delivery Address
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MY ORDERS */}
          {activeTab === "orders" && (
            <div>
              {isLoadingOrders ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  <FiRefreshCw className="spin" style={{ fontSize: "24px", color: "#004ea8", marginBottom: "8px" }} />
                  <p>Loading your past orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="UserProfileModal-empty">
                  <FiShoppingBag />
                  <h4>No orders placed yet</h4>
                  <p>When you purchase pure alkaline water products, they will appear here with live tracking status.</p>
                  <button
                    type="button"
                    className="UserProfileModal-save-btn"
                    onClick={() => {
                      onClose();
                      if (onNavigateToShop) onNavigateToShop();
                    }}
                  >
                    Explore Products &amp; Shop
                  </button>
                </div>
              ) : (
                <div className="UserProfileModal-orders-list">
                  {orders.map((ord) => {
                    const statusClass = ord.orderStatus?.toLowerCase() || "processing";
                    const orderDate = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent";

                    return (
                      <div key={ord._id || ord.orderNumber} className="UserProfileModal-order-card">
                        <div className="UserProfileModal-order-top">
                          <div>
                            <span className="UserProfileModal-order-number">
                              #{ord.orderNumber || ord._id?.slice(-8)}
                            </span>
                            <span className="UserProfileModal-order-date" style={{ marginLeft: "10px" }}>
                              <FiCalendar style={{ verticalAlign: "middle", marginRight: "3px" }} />
                              {orderDate}
                            </span>
                          </div>
                          <span className={`UserProfileModal-order-status ${statusClass}`}>
                            {ord.orderStatus || "Processing"}
                          </span>
                        </div>

                        <div className="UserProfileModal-order-items">
                          {(ord.items || []).map((it, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                              <span>
                                {it.quantity}x {it.title || it.name}
                              </span>
                              <span style={{ fontWeight: "600" }}>₹{(Number(it.price) || 0) * (Number(it.quantity) || 1)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="UserProfileModal-order-footer">
                          <span>
                            Delivery to: {ord.shippingAddress?.city || "Bhubaneswar"} ({ord.paymentMethod?.toUpperCase() || "COD"})
                          </span>
                          <span className="UserProfileModal-order-total">Total: ₹{ord.totalAmount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="UserProfileModal-footer">
          <button
            type="button"
            className="UserProfileModal-cancel-btn"
            onClick={onLogout}
            style={{ color: "#dc2626", borderColor: "#fecaca", background: "#fef2f2", marginRight: "auto" }}
          >
            <FiLogOut style={{ verticalAlign: "middle", marginRight: "6px" }} /> Log Out
          </button>
          <button type="button" className="UserProfileModal-cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;

