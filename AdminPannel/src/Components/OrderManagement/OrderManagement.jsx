import React, { useEffect, useState, useMemo } from "react";
import {
  FiShoppingCart,
  FiSearch,
  FiCheckCircle,
  FiTruck,
  FiRefreshCw,
  FiDollarSign,
  FiEye,
  FiX,
  FiPackage,
  FiMapPin,
  FiPhone,
  FiUser,
  FiMail,
  FiCreditCard,
  FiClock,
  FiUserCheck,
  FiNavigation,
  FiAlertCircle,
} from "react-icons/fi";
import API from "../../services/api";
import "./OrderManagement.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [isAssigning, setIsAssigning] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delivery Submission Modal State
  const [deliverySubmitModal, setDeliverySubmitModal] = useState({
    isOpen: false,
    order: null,
    emptyJarsCollected: 0,
    emptyJarReason: "Water jar not finished / still in use",
    deliveryNotes: "",
    proofReceivedBy: "",
    isSubmitting: false,
  });

  const fetchDeliveryBoys = async () => {
    try {
      const res = await API.get("/delivery-boys");
      const list =
        res.data?.riders ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      setDeliveryBoys(list);
    } catch (err) {
      console.error("Failed to fetch delivery boys:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // Fetch only verified paid orders
      const res = await API.get("/orders?paymentStatus=paid");
      if (res.data?.orders) {
        // Enforce strict payment validation: only successful paid orders
        const paidOnly = res.data.orders.filter(
          (o) => (o.paymentStatus || "").toLowerCase() === "paid" || o.isPaid === true
        );

        const mapped = paidOnly.map((o) => {
          const itemsText =
            Array.isArray(o.items) && o.items.length > 0
              ? o.items.map((i) => `${i.quantity} × ${i.title || i.name}`).join(", ")
              : "Alka Drops Water";

          const address = o.shippingAddress?.addressLine1
            ? `${o.shippingAddress.addressLine1}${o.shippingAddress.city ? `, ${o.shippingAddress.city}` : ""}${o.shippingAddress.postalCode ? ` - ${o.shippingAddress.postalCode}` : ""}`
            : o.shippingAddress?.address || "Bhubaneswar";

          const rawStatus = (o.orderStatus || "processing")
            .toLowerCase()
            .replace(/_/g, " ");
          const displayStatus = rawStatus
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          const dateFormatted = o.createdAt
            ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recent";

          // Delivery Boy info
          const dbAssigned = o.assignedDeliveryBoy || null;
          const assignedId = dbAssigned?._id
            ? String(dbAssigned._id)
            : o.deliveryBoy?.id
            ? String(o.deliveryBoy.id)
            : "";
          const assignedName =
            dbAssigned?.name ||
            (o.deliveryBoy?.name && o.deliveryBoy.name !== "Unassigned"
              ? o.deliveryBoy.name
              : "");
          const assignedPhone = dbAssigned?.phone || o.deliveryBoy?.phone || "";
          const assignedPartnerId =
            dbAssigned?.partnerId || o.deliveryBoy?.partnerId || "";
          const assignedVehicle =
            dbAssigned?.vehicleNumber || o.deliveryBoy?.vehicleNumber || "";
          const assignedRoute = dbAssigned?.route || "";
          const assignedAvatar = dbAssigned?.avatar || "";

          return {
            _id: o._id,
            orderNumber: o.orderNumber || o._id,
            customer: o.shippingAddress?.fullName || o.user?.name || "Customer",
            email: o.shippingAddress?.email || o.user?.email || "",
            phone: o.shippingAddress?.phone || o.user?.phone || "N/A",
            address,
            rawAddress: o.shippingAddress,
            items: itemsText,
            rawItems: o.items || [],
            amount: o.totalAmount ?? 0,
            subtotal: o.subtotal ?? 0,
            shippingCost: o.shippingCost ?? 0,
            discountAmount: o.discountAmount ?? 0,
            paymentMethod: (o.paymentMethod || "razorpay").toUpperCase(),
            paymentStatus: "Paid",
            razorpayPaymentId: o.razorpayPaymentId || "",
            razorpayOrderId: o.razorpayOrderId || "",
            orderStatus: displayStatus,
            deliverySlot: o.deliverySlot || "Standard (1-2 days)",
            notes: o.notes || "",
            date: dateFormatted,
            rawDate: o.createdAt,
            // Delivery boy assigned details
            assignedDeliveryBoyId: assignedId,
            assignedDeliveryBoyName: assignedName,
            assignedDeliveryBoyPhone: assignedPhone,
            assignedDeliveryBoyPartnerId: assignedPartnerId,
            assignedDeliveryBoyVehicle: assignedVehicle,
            assignedDeliveryBoyRoute: assignedRoute,
            assignedDeliveryBoyAvatar: assignedAvatar,
            rawDeliveryBoy: dbAssigned || o.deliveryBoy || null,
            deliveryDetails: o.deliveryDetails || null,
          };
        });

        setOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch verified paid orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryBoys();
    // Live polling every 20 seconds so new customer orders appear automatically
    const timer = setInterval(fetchOrders, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
    );

    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
    }

    try {
      await API.put(`/orders/${orderId}/status`, {
        orderStatus: newStatus.toLowerCase().replace(/\s+/g, "_"),
      });
    } catch (err) {
      console.error("Failed to update order status on server:", err);
      fetchOrders();
    }
  };

  const handleAssignDeliveryBoy = async (orderId, deliveryBoyId) => {
    setIsAssigning((prev) => ({ ...prev, [orderId]: true }));
    const selectedBoy = deliveryBoys.find(
      (b) => String(b._id) === String(deliveryBoyId) || b.partnerId === deliveryBoyId
    );

    // Optimistic UI update
    const isClearing = !deliveryBoyId || deliveryBoyId === "unassigned";
    setOrders((prev) =>
      prev.map((o) => {
        if (o._id === orderId) {
          return {
            ...o,
            assignedDeliveryBoyId: isClearing ? "" : String(selectedBoy?._id || deliveryBoyId),
            assignedDeliveryBoyName: isClearing ? "" : (selectedBoy ? selectedBoy.name : ""),
            assignedDeliveryBoyPhone: isClearing ? "" : (selectedBoy ? selectedBoy.phone : ""),
            assignedDeliveryBoyPartnerId: isClearing ? "" : (selectedBoy ? selectedBoy.partnerId : ""),
            assignedDeliveryBoyVehicle: isClearing ? "" : (selectedBoy ? selectedBoy.vehicleNumber : ""),
            assignedDeliveryBoyRoute: isClearing ? "" : (selectedBoy ? selectedBoy.route : ""),
            assignedDeliveryBoyAvatar: isClearing ? "" : (selectedBoy ? selectedBoy.avatar : ""),
          };
        }
        return o;
      })
    );

    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder((prev) => ({
        ...prev,
        assignedDeliveryBoyId: isClearing ? "" : String(selectedBoy?._id || deliveryBoyId),
        assignedDeliveryBoyName: isClearing ? "" : (selectedBoy ? selectedBoy.name : ""),
        assignedDeliveryBoyPhone: isClearing ? "" : (selectedBoy ? selectedBoy.phone : ""),
        assignedDeliveryBoyPartnerId: isClearing ? "" : (selectedBoy ? selectedBoy.partnerId : ""),
        assignedDeliveryBoyVehicle: isClearing ? "" : (selectedBoy ? selectedBoy.vehicleNumber : ""),
        assignedDeliveryBoyRoute: isClearing ? "" : (selectedBoy ? selectedBoy.route : ""),
        assignedDeliveryBoyAvatar: isClearing ? "" : (selectedBoy ? selectedBoy.avatar : ""),
      }));
    }

    try {
      await API.put(`/orders/${orderId}/assign-delivery-boy`, {
        deliveryBoyId: isClearing ? "unassigned" : deliveryBoyId,
      });
    } catch (err) {
      console.error("Failed to assign delivery boy:", err);
      fetchOrders();
    } finally {
      setIsAssigning((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleConfirmSubmitDelivery = async (e) => {
    e.preventDefault();
    if (!deliverySubmitModal.order) return;

    setDeliverySubmitModal((p) => ({ ...p, isSubmitting: true }));
    const ord = deliverySubmitModal.order;

    try {
      const res = await API.post(`/orders/${ord._id}/submit-delivery`, {
        deliveredBy: ord.assignedDeliveryBoyName || "Delivery Boy",
        partnerId: ord.assignedDeliveryBoyPartnerId || "",
        emptyJarsCollected: deliverySubmitModal.emptyJarsCollected,
        emptyJarReason: deliverySubmitModal.emptyJarReason,
        deliveryNotes: deliverySubmitModal.deliveryNotes || "Delivered to customer",
        proofReceivedBy: deliverySubmitModal.proofReceivedBy || ord.customer,
      });

      if (res.data?.success) {
        setDeliverySubmitModal({
          isOpen: false,
          order: null,
          emptyJarsCollected: 0,
          deliveryNotes: "",
          proofReceivedBy: "",
          isSubmitting: false,
        });
        fetchOrders();
        if (selectedOrder && selectedOrder._id === ord._id) {
          setSelectedOrder((prev) => ({
            ...prev,
            orderStatus: "Delivered",
            deliveryDetails: res.data.order?.deliveryDetails,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to submit delivery:", err);
      alert(err.response?.data?.message || "Failed to submit delivery.");
      setDeliverySubmitModal((p) => ({ ...p, isSubmitting: false }));
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.customer && o.customer.toLowerCase().includes(q)) ||
        (o.phone && o.phone.toLowerCase().includes(q)) ||
        (o.items && o.items.toLowerCase().includes(q)) ||
        (o.razorpayPaymentId && o.razorpayPaymentId.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" ||
        o.orderStatus.toLowerCase().replace(/\s/g, "") ===
          statusFilter.toLowerCase().replace(/\s/g, "");

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.orderStatus === "Delivered").length;
    const outForDelivery = orders.filter((o) => o.orderStatus === "Out For Delivery" || o.orderStatus === "Shipped").length;
    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
    return {
      total,
      delivered,
      outForDelivery,
      totalRevenue: `₹${totalRevenue.toLocaleString("en-IN")}`,
    };
  }, [orders]);

  return (
    <div className="OrderManagement">
      <header className="OrderManagement-header">
        <div className="OrderManagement-heading">
          <div className="OrderManagement-headingIcon">
            <FiShoppingCart />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1>Paid Orders Management</h1>
              <span style={{ fontSize: "11px", fontWeight: "700", background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <FiCheckCircle /> VERIFIED PAYMENTS ONLY
              </span>
            </div>
          </div>
        </div>
        <div className="OrderManagement-actions">
          <button type="button" className="OrderManagement-btn" onClick={fetchOrders} title="Refresh live paid orders">
            <FiRefreshCw className={isLoading ? "spin" : ""} /> <span>Sync Orders</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="OrderManagement-statsGrid">
        <div className="OrderManagement-statCard">
          <div className="OrderManagement-statIcon total">
            <FiShoppingCart />
          </div>
          <div>
            <span className="OrderManagement-statLabel">Total Paid Orders</span>
            <span className="OrderManagement-statValue">{stats.total}</span>
          </div>
        </div>
        <div className="OrderManagement-statCard">
          <div className="OrderManagement-statIcon transit">
            <FiTruck />
          </div>
          <div>
            <span className="OrderManagement-statLabel">In Transit / Shipped</span>
            <span className="OrderManagement-statValue">{stats.outForDelivery}</span>
          </div>
        </div>
        <div className="OrderManagement-statCard">
          <div className="OrderManagement-statIcon delivered">
            <FiCheckCircle />
          </div>
          <div>
            <span className="OrderManagement-statLabel">Delivered Orders</span>
            <span className="OrderManagement-statValue">{stats.delivered}</span>
          </div>
        </div>
        <div className="OrderManagement-statCard">
          <div className="OrderManagement-statIcon revenue">
            <FiDollarSign />
          </div>
          <div>
            <span className="OrderManagement-statLabel">Total Paid Revenue</span>
            <span className="OrderManagement-statValue">{stats.totalRevenue}</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="OrderManagement-controlBar">
        <div className="OrderManagement-searchBox">
          <FiSearch className="OrderManagement-searchIcon" />
          <input
            type="text"
            placeholder="Search order ID, customer, mobile, Razorpay ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="OrderManagement-statusTabs">
          <button type="button" className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>All Paid ({orders.length})</button>
          <button type="button" className={statusFilter === "confirmed" ? "active" : ""} onClick={() => setStatusFilter("confirmed")}>Confirmed</button>
          <button type="button" className={statusFilter === "processing" ? "active" : ""} onClick={() => setStatusFilter("processing")}>Processing</button>
          <button type="button" className={statusFilter === "out for delivery" ? "active" : ""} onClick={() => setStatusFilter("out for delivery")}>In Transit</button>
          <button type="button" className={statusFilter === "delivered" ? "active" : ""} onClick={() => setStatusFilter("delivered")}>Delivered</button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="OrderManagement-tableCard">
        {filteredOrders.length === 0 ? (
          <div style={{ padding: "52px 24px", textAlign: "center", color: "#64748b" }}>
            <FiShoppingCart style={{ fontSize: "38px", color: "#94a3b8", marginBottom: "12px" }} />
            <h3 style={{ fontSize: "16px", color: "#0f172a", marginBottom: "6px" }}>No Paid Orders Found</h3>
            <p style={{ fontSize: "13.5px", maxWidth: "460px", margin: "0 auto 16px" }}>
              {search || statusFilter !== "all"
                ? "No paid orders match your current filter or search criteria."
                : "When customers complete their payment checkout via Razorpay, verified paid orders will appear here automatically in real time."}
            </p>
            {(search || statusFilter !== "all") && (
              <button
                type="button"
                className="OrderManagement-btn"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <table className="OrderManagement-table">
            <thead>
              <tr>
                <th>Order ID / Date</th>
                <th>Customer</th>
                <th>Items Ordered</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Delivery Status</th>
                <th>Assign Delivery Boy</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong style={{ color: "#0284c7" }}>{order.orderNumber}</strong>
                    <span className="OrderManagement-subText">{order.date}</span>
                  </td>
                  <td>
                    <strong>{order.customer}</strong>
                    <span className="OrderManagement-subText">{order.phone}</span>
                  </td>
                  <td>
                    <span className="OrderManagement-items">{order.items}</span>
                    <span className="OrderManagement-subText">{order.address}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: "14.5px" }}>₹{Number(order.amount).toLocaleString("en-IN")}</strong>
                  </td>
                  <td>
                    <span className="OrderManagement-payBadge paid">
                      <FiCheckCircle /> PAID
                    </span>
                    <span className="OrderManagement-subText" style={{ fontWeight: "600", color: "#0284c7" }}>
                      {order.paymentMethod}
                    </span>
                    {order.razorpayPaymentId && (
                      <span className="OrderManagement-rzpPill" title={order.razorpayPaymentId}>
                        {order.razorpayPaymentId}
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      className={`OrderManagement-statusSelect ${order.orderStatus.toLowerCase().replace(/\s/g, "-")}`}
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out For Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="OrderManagement-assignCell">
                      <select
                        className={`OrderManagement-assignSelect ${order.assignedDeliveryBoyId ? "has-assigned" : ""}`}
                        value={order.assignedDeliveryBoyId || "unassigned"}
                        onChange={(e) => handleAssignDeliveryBoy(order._id, e.target.value)}
                        disabled={isAssigning[order._id]}
                      >
                        <option value="unassigned">-- Select Delivery Boy --</option>
                        {deliveryBoys.map((boy) => (
                          <option key={boy._id} value={boy._id}>
                            {boy.name} ({boy.partnerId})
                          </option>
                        ))}
                      </select>

                      {order.assignedDeliveryBoyName && order.assignedDeliveryBoyName !== "Unassigned" ? (
                        <div className="OrderManagement-assignedBadge">
                          <span className="OrderManagement-assignedPartnerTag">
                            {order.assignedDeliveryBoyPartnerId || "RIDER"}
                          </span>
                          <span className="OrderManagement-assignedName" title={order.assignedDeliveryBoyName}>
                            {order.assignedDeliveryBoyName}
                          </span>
                          {order.assignedDeliveryBoyPhone && (
                            <span className="OrderManagement-assignedMeta">
                              <FiPhone style={{ verticalAlign: "middle" }} /> {order.assignedDeliveryBoyPhone}
                            </span>
                          )}
                          {order.assignedDeliveryBoyVehicle && (
                            <span className="OrderManagement-assignedMeta">
                              <FiTruck style={{ verticalAlign: "middle" }} /> {order.assignedDeliveryBoyVehicle}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="OrderManagement-unassignedPill">
                          <FiAlertCircle /> Unassigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <button
                        type="button"
                        className="OrderManagement-viewBtn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <FiEye /> View
                      </button>

                      {order.orderStatus.toLowerCase() !== "delivered" ? (
                        <button
                          type="button"
                          className="OrderManagement-quickSubmitBtn"
                          title="Delivery Partner submits completion"
                          onClick={() =>
                            setDeliverySubmitModal({
                              isOpen: true,
                              order,
                              emptyJarsCollected: 0,
                              deliveryNotes: "",
                              proofReceivedBy: order.customer,
                              isSubmitting: false,
                            })
                          }
                        >
                          <FiCheckCircle /> Submit Delivery
                        </button>
                      ) : (
                        <span className="OrderManagement-deliveredDoneBadge">
                          <FiCheckCircle /> Delivered
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="OrderManagement-modalOverlay" onClick={() => setSelectedOrder(null)}>
          <div className="OrderManagement-modalDialog" onClick={(e) => e.stopPropagation()}>
            <div className="OrderManagement-modalHeader">
              <div>
                <h3>Order #{selectedOrder.orderNumber}</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Placed on {selectedOrder.date}</span>
              </div>
              <button
                type="button"
                className="OrderManagement-modalClose"
                onClick={() => setSelectedOrder(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="OrderManagement-modalBody">
              {/* Payment & Customer Grid */}
              <div className="OrderManagement-modalGrid">
                <div className="OrderManagement-modalCard">
                  <h4><FiUser /> Customer Information</h4>
                  <strong>{selectedOrder.customer}</strong>
                  <p><FiPhone style={{ verticalAlign: "middle" }} /> {selectedOrder.phone}</p>
                  {selectedOrder.email && <p><FiMail style={{ verticalAlign: "middle" }} /> {selectedOrder.email}</p>}
                </div>

                <div className="OrderManagement-modalCard">
                  <h4><FiCreditCard /> Verified Payment Details</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span className="OrderManagement-payBadge paid"><FiCheckCircle /> PAID</span>
                    <strong style={{ margin: 0, color: "#0284c7" }}>{selectedOrder.paymentMethod}</strong>
                  </div>
                  <p>Amount: <strong>₹{Number(selectedOrder.amount).toLocaleString("en-IN")}</strong></p>
                  {selectedOrder.razorpayPaymentId && (
                    <p style={{ fontSize: "12px", color: "#64748b" }}>
                      Razorpay Payment ID:<br />
                      <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>
                        {selectedOrder.razorpayPaymentId}
                      </code>
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="OrderManagement-modalCard" style={{ marginBottom: "18px" }}>
                <h4><FiMapPin /> Delivery Location</h4>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", margin: "0 0 4px" }}>
                  {selectedOrder.address}
                </p>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                  <FiClock style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  Preferred Window: {selectedOrder.deliverySlot}
                </p>
                {selectedOrder.notes && (
                  <p style={{ marginTop: "8px", fontSize: "12.5px", color: "#d97706" }}>
                    Note: {selectedOrder.notes}
                  </p>
                )}
              </div>

              {/* Items Table */}
              <div className="OrderManagement-modalCard" style={{ marginBottom: "18px" }}>
                <h4><FiPackage /> Ordered Items</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedOrder.rawItems && selectedOrder.rawItems.length > 0 ? (
                    selectedOrder.rawItems.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                        <div>
                          <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{item.title}</strong>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>Size: {item.size || "1 Litre"}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600" }}>{item.quantity} × ₹{item.price}</span>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0284c7" }}>
                            ₹{Number(item.quantity) * Number(item.price)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>{selectedOrder.items}</p>
                  )}
                </div>

                <div style={{ marginTop: "14px", borderTop: "1.5px dashed #cbd5e1", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800" }}>
                  <span>Total Amount Paid</span>
                  <span style={{ color: "#0284c7" }}>₹{Number(selectedOrder.amount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Assigned Delivery Partner */}
              <div className="OrderManagement-modalCard" style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <h4 style={{ margin: 0 }}><FiUserCheck /> Assigned Delivery Partner</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Change Partner:</span>
                    <select
                      className="OrderManagement-assignSelect"
                      style={{ padding: "5px 8px", fontSize: "12px" }}
                      value={selectedOrder.assignedDeliveryBoyId || "unassigned"}
                      onChange={(e) => handleAssignDeliveryBoy(selectedOrder._id, e.target.value)}
                      disabled={isAssigning[selectedOrder._id]}
                    >
                      <option value="unassigned">-- Unassigned (None) --</option>
                      {deliveryBoys.map((boy) => (
                        <option key={boy._id} value={boy._id}>
                          {boy.name} ({boy.partnerId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedOrder.assignedDeliveryBoyName && selectedOrder.assignedDeliveryBoyName !== "Unassigned" ? (
                  <div className="OrderManagement-modalPartnerBox">
                    <div className="OrderManagement-modalPartnerAvatar">
                      {selectedOrder.assignedDeliveryBoyAvatar ? (
                        <img src={selectedOrder.assignedDeliveryBoyAvatar} alt="" />
                      ) : (
                        <span>{selectedOrder.assignedDeliveryBoyName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="OrderManagement-modalPartnerDetails">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                          {selectedOrder.assignedDeliveryBoyName}
                        </strong>
                        <span className="OrderManagement-assignedPartnerTag">
                          {selectedOrder.assignedDeliveryBoyPartnerId || "RIDER"}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "700", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px" }}>
                          ON DUTY
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "8px", fontSize: "12.5px", color: "#475569" }}>
                        {selectedOrder.assignedDeliveryBoyPhone && (
                          <span>
                            <FiPhone style={{ verticalAlign: "middle", marginRight: "4px", color: "#0d9488" }} />
                            <a href={`tel:${selectedOrder.assignedDeliveryBoyPhone}`} style={{ color: "#0284c7", textDecoration: "none", fontWeight: "600" }}>
                              {selectedOrder.assignedDeliveryBoyPhone}
                            </a>
                          </span>
                        )}
                        {selectedOrder.assignedDeliveryBoyVehicle && (
                          <span>
                            <FiTruck style={{ verticalAlign: "middle", marginRight: "4px", color: "#0284c7" }} />
                            {selectedOrder.assignedDeliveryBoyVehicle}
                          </span>
                        )}
                        {selectedOrder.assignedDeliveryBoyRoute && (
                          <span>
                            <FiNavigation style={{ verticalAlign: "middle", marginRight: "4px", color: "#f59e0b" }} />
                            {selectedOrder.assignedDeliveryBoyRoute}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "12px", background: "#fffbeb", border: "1px dashed #fde68a", borderRadius: "8px", fontSize: "13px", color: "#b45309", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiAlertCircle /> No delivery boy assigned yet. Select a partner from the dropdown above to assign them to this order.
                  </div>
                )}
              </div>

              {/* Delivery Completion Audit (if already delivered) or Direct Submit Button */}
              {selectedOrder.orderStatus.toLowerCase() === "delivered" ? (
                <div className="OrderManagement-modalCard" style={{ marginBottom: "18px", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                  <h4 style={{ color: "#166534" }}><FiCheckCircle /> Delivery Completion Audit</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#15803d", fontWeight: "700", display: "block" }}>DELIVERED AT:</span>
                      <strong>
                        {selectedOrder.deliveryDetails?.deliveredAt
                          ? new Date(selectedOrder.deliveryDetails.deliveredAt).toLocaleString("en-IN")
                          : selectedOrder.date}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#15803d", fontWeight: "700", display: "block" }}>DELIVERY PARTNER:</span>
                      <strong>
                        {selectedOrder.deliveryDetails?.deliveredBy || selectedOrder.assignedDeliveryBoyName || "Official Fleet"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#15803d", fontWeight: "700", display: "block" }}>EMPTY JARS COLLECTED:</span>
                      <strong>{selectedOrder.deliveryDetails?.emptyJarsCollected || 0} Jars</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#15803d", fontWeight: "700", display: "block" }}>HANDED OVER TO:</span>
                      <strong>{selectedOrder.deliveryDetails?.proofReceivedBy || selectedOrder.customer}</strong>
                    </div>
                  </div>
                  {selectedOrder.deliveryDetails?.deliveryNotes && (
                    <p style={{ marginTop: "8px", fontSize: "12px", color: "#166534", fontStyle: "italic", borderTop: "1px dashed #bbf7d0", paddingTop: "6px" }}>
                      Note: "{selectedOrder.deliveryDetails.deliveryNotes}"
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: "18px" }}>
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #0d9488 0%, #0284c7 100%)",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                    }}
                    onClick={() =>
                      setDeliverySubmitModal({
                        isOpen: true,
                        order: selectedOrder,
                        emptyJarsCollected: 0,
                        deliveryNotes: "",
                        proofReceivedBy: selectedOrder.customer,
                        isSubmitting: false,
                      })
                    }
                  >
                    <FiCheckCircle /> Submit Delivery Completion
                  </button>
                </div>
              )}

              {/* Status Updater inside Modal */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Update Delivery Status:</span>
                <select
                  className={`OrderManagement-statusSelect ${selectedOrder.orderStatus.toLowerCase().replace(/\s/g, "-")}`}
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out For Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT DELIVERY WORKFLOW MODAL */}
      {deliverySubmitModal.isOpen && deliverySubmitModal.order && (
        <div
          className="OrderManagement-modalOverlay"
          onClick={() => setDeliverySubmitModal((p) => ({ ...p, isOpen: false }))}
        >
          <div
            className="OrderManagement-modalDialog"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="OrderManagement-modalHeader">
              <div>
                <h3>Submit Delivery Handover</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Order #{deliverySubmitModal.order.orderNumber}
                </span>
              </div>
              <button
                type="button"
                className="OrderManagement-modalClose"
                onClick={() => setDeliverySubmitModal((p) => ({ ...p, isOpen: false }))}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmitDelivery} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{deliverySubmitModal.order.customer}</strong>
                <p style={{ margin: "4px 0", fontSize: "12.5px", color: "#475569" }}>{deliverySubmitModal.order.address}</p>
                <span style={{ fontSize: "12px", color: "#0284c7" }}>📞 {deliverySubmitModal.order.phone}</span>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Delivering Personnel:
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${deliverySubmitModal.order.assignedDeliveryBoyName || "Fleet Partner"} ${deliverySubmitModal.order.assignedDeliveryBoyPartnerId ? `(${deliverySubmitModal.order.assignedDeliveryBoyPartnerId})` : ""}`}
                  style={{ width: "100%", padding: "8px 12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "#334155" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Empty 20L Jars Collected / Returned:
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={deliverySubmitModal.emptyJarsCollected}
                  onChange={(e) =>
                    setDeliverySubmitModal((p) => ({
                      ...p,
                      emptyJarsCollected: Number(e.target.value) || 0,
                    }))
                  }
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                />
                <span style={{ fontSize: "11px", color: "#64748b" }}>Enter number of empty water cans collected back from customer (0 if unreturned)</span>
              </div>

              {Number(deliverySubmitModal.emptyJarsCollected) === 0 && (
                <div style={{ background: "#fffbeb", border: "1px dashed #fde68a", borderRadius: "8px", padding: "10px 12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309", display: "block", marginBottom: "4px" }}>
                    ⚠️ No Empty Jars Returned Today:
                  </span>
                  <select
                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", background: "#ffffff" }}
                    value={deliverySubmitModal.emptyJarReason || "Water jar not finished / still in use"}
                    onChange={(e) =>
                      setDeliverySubmitModal((p) => ({ ...p, emptyJarReason: e.target.value }))
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
                  Handed Over To (Customer / Security):
                </label>
                <input
                  type="text"
                  value={deliverySubmitModal.proofReceivedBy}
                  onChange={(e) =>
                    setDeliverySubmitModal((p) => ({ ...p, proofReceivedBy: e.target.value }))
                  }
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13.5px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Delivery Notes:
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Delivered directly to customer, bottles placed in kitchen, empty jars collected."
                  value={deliverySubmitModal.deliveryNotes}
                  onChange={(e) =>
                    setDeliverySubmitModal((p) => ({ ...p, deliveryNotes: e.target.value }))
                  }
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#475569", fontWeight: "600", cursor: "pointer" }}
                  onClick={() => setDeliverySubmitModal((p) => ({ ...p, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deliverySubmitModal.isSubmitting}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#0d9488",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "13.5px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {deliverySubmitModal.isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <FiCheckCircle /> Confirm & Mark Delivered
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

export default OrderManagement;
