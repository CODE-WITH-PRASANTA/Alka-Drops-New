import React, { useState, useEffect, useMemo } from "react";
import {
  FiCalendar,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiRefreshCw,
  FiMapPin,
  FiPackage,
  FiUser,
  FiPhone,
  FiMail,
  FiTrash2,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import API from "../../services/api";
import "./SubscriptionOrders.css";

const SubscriptionOrders = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Record Drop Modal State
  const [dropModal, setDropModal] = useState({
    isOpen: false,
    order: null,
    bottlesDelivered: 2,
    emptyJarsCollected: 2,
    emptyJarReason: "Water jar not finished / still in use",
    status: "Delivered",
    notes: "",
    isSubmitting: false,
  });

  // View Drop History Modal State
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    order: null,
  });

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      const [ordersRes, deliveryRes] = await Promise.all([
        API.get("/subscription-orders"),
        API.get("/delivery-boys").catch(() => ({ data: { riders: [] } })),
      ]);

      if (ordersRes.data?.success && Array.isArray(ordersRes.data.orders)) {
        setOrders(ordersRes.data.orders);
      } else {
        setOrders([]);
      }

      const boys =
        deliveryRes.data?.riders ||
        deliveryRes.data?.data ||
        deliveryRes.data?.deliveryBoys ||
        [];
      setDeliveryBoys(boys);
    } catch (err) {
      console.error("Failed to load subscription orders:", err);
      setErrorMsg(err.response?.data?.message || "Failed to load live subscription orders from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await API.patch(`/subscription-orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
        );
        showToast(`Status updated to ${newStatus}!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleAssignDeliveryBoy = async (orderId, deliveryBoyId) => {
    try {
      const chosenBoy = deliveryBoys.find(
        (b) => String(b._id) === String(deliveryBoyId) || b.partnerId === deliveryBoyId
      );

      const res = await API.patch(`/subscription-orders/${orderId}/assign`, {
        deliveryBoyId: deliveryBoyId === "Unassigned" ? "unassigned" : deliveryBoyId,
        deliveryBoyName: chosenBoy ? chosenBoy.name : "Unassigned",
        deliveryBoyPhone: chosenBoy ? chosenBoy.phone : "",
      });

      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord._id === orderId
              ? {
                  ...ord,
                  assignedDeliveryBoy: chosenBoy || null,
                  deliveryBoy: res.data.order?.deliveryBoy || {
                    name: chosenBoy?.name || "Unassigned",
                    phone: chosenBoy?.phone || "",
                  },
                }
              : ord
          )
        );
        showToast(
          chosenBoy
            ? `Assigned ${chosenBoy.name} (${chosenBoy.partnerId}) to subscription!`
            : "Delivery partner unassigned."
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign delivery partner.");
    }
  };

  const handleRecordDropSubmit = async (e) => {
    e.preventDefault();
    if (!dropModal.order) return;

    setDropModal((p) => ({ ...p, isSubmitting: true }));
    const ord = dropModal.order;

    try {
      const res = await API.post(`/subscription-orders/${ord._id}/record-drop`, {
        bottlesDelivered: dropModal.bottlesDelivered,
        emptyJarsCollected: dropModal.emptyJarsCollected,
        emptyJarReason: dropModal.emptyJarReason,
        deliveredBy: ord.deliveryBoy?.name || ord.assignedDeliveryBoy?.name || "Delivery Partner",
        partnerId: ord.deliveryBoy?.partnerId || ord.assignedDeliveryBoy?.partnerId || "",
        status: dropModal.status,
        notes: dropModal.notes || "Daily drop delivered",
      });

      if (res.data?.success) {
        setDropModal({
          isOpen: false,
          order: null,
          bottlesDelivered: 2,
          emptyJarsCollected: 2,
          status: "Delivered",
          notes: "",
          isSubmitting: false,
        });
        showToast(res.data.message || "Daily drop recorded successfully!");
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to record drop:", err);
      alert(err.response?.data?.message || "Failed to record delivery drop.");
      setDropModal((p) => ({ ...p, isSubmitting: false }));
    }
  };

  const handleDeleteOrder = async (orderId, orderNum) => {
    if (!window.confirm(`Permanently remove subscription order #${orderNum}?`)) {
      return;
    }
    try {
      const res = await API.delete(`/subscription-orders/${orderId}`);
      if (res.data?.success) {
        setOrders((prev) => prev.filter((ord) => ord._id !== orderId));
        showToast(`Order #${orderNum} deleted.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete subscription order.");
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q) ||
        o.planTitle?.toLowerCase().includes(q) ||
        o.deliveryAddress?.street?.toLowerCase().includes(q) ||
        o.deliveryAddress?.city?.toLowerCase().includes(q) ||
        o.deliveryBoy?.name?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" || o.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const activeCount = orders.filter((o) => o.status === "Active").length;
    const pausedCount = orders.filter((o) => o.status === "Paused").length;
    const totalBottles = orders
      .filter((o) => o.status === "Active")
      .reduce((acc, o) => acc + (Number(o.bottlesPerDelivery) || 1), 0);
    return { totalOrders, activeCount, pausedCount, totalBottles };
  }, [orders]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="SubscriptionOrders">
      {/* Toast Alert */}
      {successToast && (
        <div className="SubscriptionOrders-toast">
          <FiCheck /> {successToast}
        </div>
      )}

      <header className="SubscriptionOrders-header">
        <div className="SubscriptionOrders-heading">
          <div className="SubscriptionOrders-headingIcon">
            <FiCalendar />
          </div>
          <div>
            <h1>Subscription Orders &amp; Validity Schedule</h1>
          </div>
        </div>

        <div className="SubscriptionOrders-actions">
          <button
            type="button"
            className="SubscriptionOrders-btn secondary"
            onClick={fetchOrders}
            disabled={isLoading}
          >
            <FiRefreshCw className={isLoading ? "spin" : ""} />
            <span>{isLoading ? "Refreshing..." : "Refresh Live Orders"}</span>
          </button>
        </div>
      </header>

      {errorMsg && (
        <div className="SubscriptionOrders-alert-box error">
          <FiAlertCircle /> {errorMsg}
        </div>
      )}

      {/* Real Metrics Grid */}
      <div className="SubscriptionOrders-statsGrid">
        <div className="SubscriptionOrders-statCard">
          <div className="SubscriptionOrders-statIcon trips">
            <FiCalendar />
          </div>
          <div>
            <span className="SubscriptionOrders-statLabel">Total Bookings</span>
            <span className="SubscriptionOrders-statValue">{stats.totalOrders} Orders</span>
          </div>
        </div>

        <div className="SubscriptionOrders-statCard">
          <div className="SubscriptionOrders-statIcon delivered">
            <FiCheckCircle />
          </div>
          <div>
            <span className="SubscriptionOrders-statLabel">Active Passes</span>
            <span className="SubscriptionOrders-statValue">{stats.activeCount} Active</span>
          </div>
        </div>

        <div className="SubscriptionOrders-statCard">
          <div className="SubscriptionOrders-statIcon bottles">
            <FiPackage />
          </div>
          <div>
            <span className="SubscriptionOrders-statLabel">Daily Cans Dispatch</span>
            <span className="SubscriptionOrders-statValue">{stats.totalBottles} Jars</span>
          </div>
        </div>

        <div className="SubscriptionOrders-statCard">
          <div className="SubscriptionOrders-statIcon transit">
            <FiClock />
          </div>
          <div>
            <span className="SubscriptionOrders-statLabel">Paused / On Hold</span>
            <span className="SubscriptionOrders-statValue">{stats.pausedCount} Paused</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="SubscriptionOrders-controlBar">
        <div className="SubscriptionOrders-searchBox">
          <FiSearch className="SubscriptionOrders-searchIcon" />
          <input
            type="text"
            placeholder="Search order #, customer name, phone, address, or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="SubscriptionOrders-filterGroup">
          <div className="SubscriptionOrders-statusTabs">
            <button
              type="button"
              className={statusFilter === "all" ? "active" : ""}
              onClick={() => setStatusFilter("all")}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              className={statusFilter === "active" ? "active" : ""}
              onClick={() => setStatusFilter("active")}
            >
              Active ({stats.activeCount})
            </button>
            <button
              type="button"
              className={statusFilter === "paused" ? "active" : ""}
              onClick={() => setStatusFilter("paused")}
            >
              Paused ({stats.pausedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="SubscriptionOrders-tableCard">
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <FiRefreshCw className="spin" style={{ fontSize: "32px", color: "#004ea8", marginBottom: "10px" }} />
            <p>Loading live subscription bookings from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <FiPackage style={{ fontSize: "40px", color: "#94a3b8", marginBottom: "12px" }} />
            <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>No Subscription Orders Found</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>
              {search || statusFilter !== "all"
                ? "No subscriptions match your search or filter."
                : "No customer has ordered a subscription plan yet. Bookings will appear here live."}
            </p>
          </div>
        ) : (
          <table className="SubscriptionOrders-table">
            <thead>
              <tr>
                <th>Order # &amp; Plan</th>
                <th>Customer Contact</th>
                <th>Validity (Start &amp; End)</th>
                <th>Schedule &amp; Quantity</th>
                <th>Delivery Address</th>
                <th>Delivery Partner</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id}>
                  {/* Order & Plan */}
                  <td>
                    <strong style={{ color: "#004ea8" }}>{item.orderNumber}</strong>
                    <div style={{ fontWeight: 600, color: "#0f172a", marginTop: "2px" }}>
                      {item.planTitle}
                    </div>
                    <span className="SubscriptionOrders-subText">
                      ₹{item.totalAmount || item.planPrice} ({item.paymentMethod?.toUpperCase() || "COD"})
                    </span>
                  </td>

                  {/* Customer */}
                  <td>
                    <strong>{item.customerName}</strong>
                    <span className="SubscriptionOrders-subText">
                      <FiPhone /> {item.customerPhone}
                    </span>
                    <span className="SubscriptionOrders-subText">
                      <FiMail /> {item.customerEmail}
                    </span>
                  </td>

                  {/* Start & End Dates */}
                  <td>
                    <div className="SubscriptionOrders-datesPill">
                      <div>
                        <span className="SubscriptionOrders-dateTag">START:</span>{" "}
                        <strong>{formatDate(item.startDate)}</strong>
                      </div>
                      <div>
                        <span className="SubscriptionOrders-dateTag end">END:</span>{" "}
                        <strong>{formatDate(item.endDate)}</strong>
                      </div>
                    </div>
                  </td>

                  {/* Schedule & Quantity */}
                  <td>
                    <span className="SubscriptionOrders-bottlesBadge deliver">
                      +{item.bottlesPerDelivery || 2} Jars (20L)
                    </span>
                    <div style={{ margin: "6px 0 4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", color: "#0f766e" }}>
                        <span>Progress:</span>
                        <span>{item.bottlesDelivered || 0} / {item.totalQuotaJars || 30} Jars</span>
                      </div>
                      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "9999px", overflow: "hidden", marginTop: "2px" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(100, Math.round(((item.bottlesDelivered || 0) / (item.totalQuotaJars || 30)) * 100))}%`,
                            background: "linear-gradient(90deg, #0d9488, #0284c7)",
                            borderRadius: "9999px",
                          }}
                        />
                      </div>
                    </div>
                    <div className="SubscriptionOrders-subText">
                      <FiClock /> {item.deliveryFrequency}
                    </div>
                    <div className="SubscriptionOrders-subText">
                      {item.deliverySlot}
                    </div>
                  </td>

                  {/* Address */}
                  <td>
                    <strong>{item.deliveryAddress?.street || "Bhubaneswar"}</strong>
                    <span className="SubscriptionOrders-subText">
                      <FiMapPin /> {item.deliveryAddress?.city} - {item.deliveryAddress?.postalCode}
                    </span>
                  </td>

                  {/* Delivery Partner */}
                  <td>
                    <select
                      className="SubscriptionOrders-assignSelect"
                      value={item.assignedDeliveryBoy?._id || item.deliveryBoy?.id || "Unassigned"}
                      onChange={(e) => handleAssignDeliveryBoy(item._id, e.target.value)}
                    >
                      <option value="Unassigned">-- Select Delivery Partner --</option>
                      {deliveryBoys.map((boy) => (
                        <option key={boy._id} value={boy._id}>
                          {boy.name} ({boy.partnerId})
                        </option>
                      ))}
                    </select>

                    {(item.deliveryBoy?.name && item.deliveryBoy.name !== "Unassigned") || item.assignedDeliveryBoy ? (
                      <div style={{ marginTop: "6px", fontSize: "11px", color: "#0f766e", fontWeight: "600", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span>
                          <strong>{item.assignedDeliveryBoy?.name || item.deliveryBoy?.name}</strong>{" "}
                          {item.assignedDeliveryBoy?.partnerId || item.deliveryBoy?.partnerId ? `(${item.assignedDeliveryBoy?.partnerId || item.deliveryBoy?.partnerId})` : ""}
                        </span>
                        {(item.assignedDeliveryBoy?.phone || item.deliveryBoy?.phone) && (
                          <span style={{ color: "#64748b" }}>
                            📞 {item.assignedDeliveryBoy?.phone || item.deliveryBoy?.phone}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "4px" }}>
                        No rider assigned
                      </span>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td>
                    <select
                      className={`SubscriptionOrders-statusDropdown ${item.status?.toLowerCase()}`}
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <button
                        type="button"
                        style={{
                          background: "#0d9488",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          whiteSpace: "nowrap",
                        }}
                        onClick={() =>
                          setDropModal({
                            isOpen: true,
                            order: item,
                            bottlesDelivered: item.bottlesPerDelivery || 2,
                            emptyJarsCollected: item.bottlesPerDelivery || 2,
                            status: "Delivered",
                            notes: "",
                            isSubmitting: false,
                          })
                        }
                        title="Record today's daily jar drop"
                      >
                        <FiTruck /> Record Drop
                      </button>

                      {Array.isArray(item.dailyDrops) && item.dailyDrops.length > 0 && (
                        <button
                          type="button"
                          style={{
                            background: "#f0f9ff",
                            color: "#0369a1",
                            border: "1px solid #bae6fd",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => setHistoryModal({ isOpen: true, order: item })}
                          title="View drops history log"
                        >
                          📋 History ({item.dailyDrops.length})
                        </button>
                      )}

                      <button
                        type="button"
                        className="SubscriptionOrders-deleteBtn"
                        onClick={() => handleDeleteOrder(item._id, item.orderNumber)}
                        title="Delete subscription booking"
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* RECORD DAILY DROP MODAL */}
      {dropModal.isOpen && dropModal.order && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setDropModal((p) => ({ ...p, isOpen: false }))}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "480px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "17px", color: "#0f172a" }}>
                  Record Daily Jar Drop
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Subscription #{dropModal.order.orderNumber} • {dropModal.order.planTitle}
                </span>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", fontSize: "20px", color: "#64748b", cursor: "pointer" }}
                onClick={() => setDropModal((p) => ({ ...p, isOpen: false }))}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordDropSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{dropModal.order.customerName}</strong>
                <p style={{ margin: "4px 0", fontSize: "12.5px", color: "#475569" }}>
                  {dropModal.order.deliveryAddress?.street}, {dropModal.order.deliveryAddress?.city}
                </p>
                <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: "#0d9488", fontWeight: "600" }}>
                  <span>📞 {dropModal.order.customerPhone}</span>
                  <span>⏰ {dropModal.order.deliverySlot}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Jars Delivered Today:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={dropModal.bottlesDelivered}
                    onChange={(e) =>
                      setDropModal((p) => ({ ...p, bottlesDelivered: Number(e.target.value) || 1 }))
                    }
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  />
                  <small style={{ color: "#64748b" }}>Standard drop: {dropModal.order.bottlesPerDelivery || 2} jars</small>
                </div>

                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Empty Cans Returned:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={dropModal.emptyJarsCollected}
                    onChange={(e) =>
                      setDropModal((p) => ({ ...p, emptyJarsCollected: Number(e.target.value) || 0 }))
                    }
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  />
                  <small style={{ color: "#64748b" }}>Empties taken back (enter 0 if unreturned)</small>
                </div>
              </div>

              {Number(dropModal.emptyJarsCollected) < Number(dropModal.bottlesDelivered) && (
                <div style={{ background: "#fffbeb", border: "1px dashed #fde68a", borderRadius: "8px", padding: "10px 12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", display: "block", marginBottom: "4px" }}>
                    ⚠️ {Number(dropModal.emptyJarsCollected) === 0 ? "No Empty Jars Returned Today" : "Partial Return"}:
                  </span>
                  <p style={{ margin: "0 0 6px", fontSize: "11.5px", color: "#92400e" }}>
                    Customer unreturned jar balance will be updated and carried forward for next collection.
                  </p>
                  <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "4px" }}>
                    Reason:
                  </label>
                  <select
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", background: "#ffffff" }}
                    value={dropModal.emptyJarReason || "Water jar not finished / still in use"}
                    onChange={(e) =>
                      setDropModal((p) => ({ ...p, emptyJarReason: e.target.value }))
                    }
                  >
                    <option value="Water jar not finished / still in use">Water jar not finished / still in use</option>
                    <option value="Customer promised return in next drop">Customer promised return in next drop</option>
                    <option value="Customer not at home / Left with security">Customer not at home / Left with security</option>
                    <option value="First delivery / New customer without initial empty jar">First delivery / New customer</option>
                    <option value="Customer requested extra buffer jar">Customer requested extra buffer jar</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Drop Status:
                </label>
                <select
                  value={dropModal.status}
                  onChange={(e) => setDropModal((p) => ({ ...p, status: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13.5px" }}
                >
                  <option value="Delivered">Delivered Successfully</option>
                  <option value="Missed">Missed (Customer Not Available)</option>
                  <option value="Skipped">Skipped (Customer Requested Pause)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Rider Notes / Proof:
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Delivered 2 jars to front gate, picked up 2 empty cans."
                  value={dropModal.notes}
                  onChange={(e) => setDropModal((p) => ({ ...p, notes: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#475569", fontWeight: "600", cursor: "pointer" }}
                  onClick={() => setDropModal((p) => ({ ...p, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dropModal.isSubmitting}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#0d9488",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "13.5px",
                    cursor: "pointer",
                  }}
                >
                  {dropModal.isSubmitting ? "Saving Drop..." : "✓ Confirm & Save Drop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DROPS HISTORY MODAL */}
      {historyModal.isOpen && historyModal.order && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setHistoryModal({ isOpen: false, order: null })}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "540px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "17px", color: "#0f172a" }}>
                  Daily Drops Log &amp; History
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  #{historyModal.order.orderNumber} • {historyModal.order.customerName}
                </span>
              </div>
              <button
                type="button"
                style={{ background: "none", border: "none", fontSize: "20px", color: "#64748b", cursor: "pointer" }}
                onClick={() => setHistoryModal({ isOpen: false, order: null })}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdfa", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ccfbf1" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f766e" }}>
                  Total Delivered: {historyModal.order.bottlesDelivered || 0} Jars
                </span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#0284c7" }}>
                  Empty Returns: {historyModal.order.emptyJarsCollected || 0} Jars
                </span>
              </div>

              {Array.isArray(historyModal.order.dailyDrops) && historyModal.order.dailyDrops.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {historyModal.order.dailyDrops.map((drop, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px" }}>
                            {drop.status || "Delivered"}
                          </span>
                          <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                            +{drop.bottlesDelivered} Jars
                          </strong>
                          {drop.emptyJarsCollected > 0 ? (
                            <span style={{ fontSize: "12px", color: "#0284c7" }}>
                              (Returned: {drop.emptyJarsCollected} empties)
                            </span>
                          ) : (
                            <span style={{ fontSize: "11px", fontWeight: "700", background: "#fef3c7", color: "#b45309", padding: "1px 6px", borderRadius: "4px" }}>
                              0 Empties Returned (Pending)
                            </span>
                          )}
                        </div>
                        {drop.emptyJarReason && (
                          <div style={{ fontSize: "11.5px", color: "#b45309", marginTop: "2px" }}>
                            Reason: <em>{drop.emptyJarReason}</em>
                          </div>
                        )}
                        <span style={{ fontSize: "11.5px", color: "#64748b", marginTop: "3px", display: "block" }}>
                          Rider: {drop.deliveredBy || "Assigned Partner"} • {new Date(drop.dropDate || drop.deliveredAt).toLocaleString("en-IN")}
                        </span>
                        {drop.notes && (
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#334155", fontStyle: "italic" }}>
                            "{drop.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>No drops recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionOrders;
