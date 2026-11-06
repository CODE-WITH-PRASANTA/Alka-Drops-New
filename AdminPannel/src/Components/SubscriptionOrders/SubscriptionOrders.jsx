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

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      const [ordersRes, deliveryRes] = await Promise.all([
        API.get("/subscription-orders"),
        API.get("/delivery-boys").catch(() => ({ data: { deliveryBoys: [] } })),
      ]);

      if (ordersRes.data?.success && Array.isArray(ordersRes.data.orders)) {
        setOrders(ordersRes.data.orders);
      } else {
        setOrders([]);
      }

      if (deliveryRes.data?.deliveryBoys) {
        setDeliveryBoys(deliveryRes.data.deliveryBoys.filter((b) => b.status === "Active"));
      }
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

  const handleAssignDeliveryBoy = async (orderId, boyName, boyPhone) => {
    try {
      const res = await API.patch(`/subscription-orders/${orderId}/assign`, {
        deliveryBoyName: boyName,
        deliveryBoyPhone: boyPhone,
      });
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord._id === orderId
              ? { ...ord, deliveryBoy: { name: boyName, phone: boyPhone } }
              : ord
          )
        );
        showToast(`Assigned ${boyName} to order!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign delivery partner.");
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
            <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#64748b" }}>
              Monitor recurring water delivery passes, validity dates, and doorstep schedules in Bhubaneswar.
            </p>
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
                      value={item.deliveryBoy?.name || "Unassigned"}
                      onChange={(e) => {
                        const chosenBoy = deliveryBoys.find((b) => b.name === e.target.value);
                        handleAssignDeliveryBoy(
                          item._id,
                          e.target.value,
                          chosenBoy?.phone || ""
                        );
                      }}
                    >
                      <option value="Unassigned">Unassigned</option>
                      {deliveryBoys.map((boy) => (
                        <option key={boy._id} value={boy.name}>
                          {boy.name} ({boy.phone})
                        </option>
                      ))}
                    </select>
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
                    <button
                      type="button"
                      className="SubscriptionOrders-deleteBtn"
                      onClick={() => handleDeleteOrder(item._id, item.orderNumber)}
                      title="Delete subscription booking"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SubscriptionOrders;
