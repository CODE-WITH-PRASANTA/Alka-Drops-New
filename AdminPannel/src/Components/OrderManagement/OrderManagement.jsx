import React, { useEffect, useState, useMemo } from "react";
import {
  FiShoppingCart,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiAlertCircle,
  FiRefreshCw,
  FiDollarSign,
  FiEye,
} from "react-icons/fi";
import API from "../../services/api";
import "./OrderManagement.css";

const defaultMockOrders = [
  { _id: "ORD-9821", customer: "Pooja Hegde", phone: "98765 43210", address: "Flat 402, Green Acres, Viman Nagar, Pune", items: "2 x 20L Premium Jar", amount: 190, paymentMethod: "Online UPI", paymentStatus: "Paid", orderStatus: "Out for Delivery", date: "Today, 10:45 AM" },
  { _id: "ORD-9820", customer: "Rajesh Kumar", phone: "91234 56789", address: "B-12, Blue Ridge Towers, Hinjewadi, Pune", items: "1 x 20L Jar + Dispenser Base", amount: 1345, paymentMethod: "Cash on Delivery", paymentStatus: "Pending", orderStatus: "Processing", date: "Today, 09:30 AM" },
  { _id: "ORD-9819", customer: "Ananya Deshmukh", phone: "99887 76655", address: "Villa 14, Palm Meadows, Baner, Pune", items: "3 x 20L Premium Jar", amount: 285, paymentMethod: "Razorpay", paymentStatus: "Paid", orderStatus: "Delivered", date: "Yesterday, 04:15 PM" },
  { _id: "ORD-9818", customer: "TechCorp Labs", phone: "98220 11223", address: "Floor 3, Cyber City Tech Park, Magarpatta", items: "10 x 20L Jar (Corporate)", amount: 950, paymentMethod: "Corporate Invoice", paymentStatus: "Paid", orderStatus: "Delivered", date: "Yesterday, 11:00 AM" },
  { _id: "ORD-9817", customer: "Vikram Malhotra", phone: "97654 32100", address: "A-501, Marvel Bounty, Hadapsar, Pune", items: "1 x Box 500ml Bottled Water (24 pk)", amount: 360, paymentMethod: "Online UPI", paymentStatus: "Paid", orderStatus: "Processing", date: "Yesterday, 08:20 AM" },
];

const OrderManagement = () => {
  const [orders, setOrders] = useState(defaultMockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/orders");
      if (res.data?.orders && res.data.orders.length > 0) {
        // Map backend orders accurately
        const mapped = res.data.orders.map((o) => {
          const itemsText =
            Array.isArray(o.items) && o.items.length > 0
              ? o.items.map((i) => `${i.quantity} x ${i.title || i.name}`).join(", ")
              : Array.isArray(o.orderItems) && o.orderItems.length > 0
              ? o.orderItems.map((i) => `${i.quantity} x ${i.name || i.title}`).join(", ")
              : "Alka Drops Water";

          const address = o.shippingAddress?.addressLine1
            ? `${o.shippingAddress.addressLine1}${o.shippingAddress.city ? `, ${o.shippingAddress.city}` : ""}`
            : o.shippingAddress?.address || "Bhubaneswar";

          const rawStatus = (o.orderStatus || (o.isDelivered ? "delivered" : o.status || "processing"))
            .toLowerCase()
            .replace(/_/g, " ");
          const displayStatus = rawStatus
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          const rawPaymentStatus = o.paymentStatus || (o.isPaid ? "paid" : "pending");
          const displayPaymentStatus =
            rawPaymentStatus.charAt(0).toUpperCase() + rawPaymentStatus.slice(1).toLowerCase();

          return {
            _id: o._id,
            orderNumber: o.orderNumber || o._id,
            customer: o.shippingAddress?.fullName || o.user?.name || "Customer",
            phone: o.shippingAddress?.phone || "Registered Contact",
            address,
            items: itemsText,
            amount: o.totalAmount ?? o.totalPrice ?? 0,
            paymentMethod: (o.paymentMethod || "cod").toUpperCase(),
            paymentStatus: displayPaymentStatus,
            orderStatus: displayStatus,
            date: o.createdAt
              ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Today",
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      console.log("Using initial orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
    );

    try {
      await API.put(`/orders/${orderId}/status`, {
        orderStatus: newStatus.toLowerCase().replace(/\s+/g, "_"),
      });
    } catch (err) {
      console.error("Failed to update order status on server:", err);
      // Revert if error
      fetchOrders();
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        o._id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.items.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        o.orderStatus.toLowerCase().replace(/\s/g, "") === statusFilter.toLowerCase().replace(/\s/g, "");
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.orderStatus === "Delivered").length;
    const outForDelivery = orders.filter((o) => o.orderStatus === "Out for Delivery").length;
    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
    return { total, delivered, outForDelivery, totalRevenue: `₹${totalRevenue.toLocaleString()}` };
  }, [orders]);

  return (
    <div className="OrderManagement">
      <header className="OrderManagement-header">
        <div className="OrderManagement-heading">
          <div className="OrderManagement-headingIcon">
            <FiShoppingCart />
          </div>
          <h1>Order Management</h1>
        </div>
        <div className="OrderManagement-actions">
          <button type="button" className="OrderManagement-btn secondary" onClick={fetchOrders}>
            <FiRefreshCw className={isLoading ? "spin" : ""} /> <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="OrderManagement-statsGrid">
        <div className="OrderManagement-statCard">
          <div className="OrderManagement-statIcon total"><FiShoppingCart /></div>
          <div><span className="OrderManagement-statLabel">Total Orders</span><span className="OrderManagement-statValue">{stats.total}</span></div>
        </div>
        <div className="OrderManagement-statCard">
          <div className="OrderManagement-statIcon transit"><FiTruck /></div>
          <div><span className="OrderManagement-statLabel">Out for Delivery</span><span className="OrderManagement-statValue">{stats.outForDelivery}</span></div>
        </div>
        <div className="OrderManagement-statCard">
          <div className="OrderManagement-statIcon delivered"><FiCheckCircle /></div>
          <div><span className="OrderManagement-statLabel">Delivered Today</span><span className="OrderManagement-statValue">{stats.delivered}</span></div>
        </div>
        <div className="OrderManagement-statCard">
          <div className="OrderManagement-statIcon revenue"><FiDollarSign /></div>
          <div><span className="OrderManagement-statLabel">Total Order Value</span><span className="OrderManagement-statValue">{stats.totalRevenue}</span></div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="OrderManagement-controlBar">
        <div className="OrderManagement-searchBox">
          <FiSearch className="OrderManagement-searchIcon" />
          <input
            type="text"
            placeholder="Search order ID, customer name, or items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="OrderManagement-statusTabs">
          <button type="button" className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>All</button>
          <button type="button" className={statusFilter === "processing" ? "active" : ""} onClick={() => setStatusFilter("processing")}>Processing</button>
          <button type="button" className={statusFilter === "out for delivery" ? "active" : ""} onClick={() => setStatusFilter("out for delivery")}>In Transit</button>
          <button type="button" className={statusFilter === "delivered" ? "active" : ""} onClick={() => setStatusFilter("delivered")}>Delivered</button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="OrderManagement-tableCard">
        <table className="OrderManagement-table">
          <thead>
            <tr>
              <th>Order ID / Date</th>
              <th>Customer</th>
              <th>Items Ordered</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Delivery Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  <strong>{order.orderNumber || order._id}</strong>
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
                <td><strong>₹{order.amount}</strong></td>
                <td>
                  <span className={`OrderManagement-payBadge ${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                  <span className="OrderManagement-subText">{order.paymentMethod}</span>
                </td>
                <td>
                  <select
                    className={`OrderManagement-statusSelect ${order.orderStatus.toLowerCase().replace(/\s/g, "-")}`}
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out For Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;

