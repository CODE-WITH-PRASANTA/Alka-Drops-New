import React, { useState, useEffect, useMemo } from "react";
import {
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiUser,
  FiCalendar,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiShield,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import API from "../../services/api";
import "./DeliveryDispatch.css";

const DeliveryDispatch = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedRiderId, setSelectedRiderId] = useState("all");
  const [shopOrders, setShopOrders] = useState([]);
  const [subOrders, setSubOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // View mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState("cards");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'subscription', 'shop'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'out_for_delivery', 'delivered'
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'today', 'upcoming'
  const [slotFilter, setSlotFilter] = useState("all"); // 'all', 'morning', 'afternoon', 'evening'
  const [onlyEmptiesDue, setOnlyEmptiesDue] = useState(false);

  // Submit modal state
  const [submitModal, setSubmitModal] = useState({
    isOpen: false,
    taskType: "", // "shop" or "subscription"
    item: null,
    bottlesDelivered: 1,
    emptyJarsCollected: 0,
    emptyJarReason: "Water jar not finished / still in use",
    deliveryNotes: "",
    proofReceivedBy: "",
    isSubmitting: false,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ridersRes, ordersRes, subsRes] = await Promise.all([
        API.get("/delivery-boys").catch(() => ({ data: { riders: [] } })),
        API.get("/orders?paymentStatus=paid").catch(() => ({ data: { orders: [] } })),
        API.get("/subscription-orders").catch(() => ({ data: { orders: [] } })),
      ]);

      const riders = ridersRes.data?.riders || ridersRes.data?.data || [];
      setDeliveryBoys(riders);

      const rawOrders = ordersRes.data?.orders || [];
      setShopOrders(rawOrders);

      const rawSubs = subsRes.data?.orders || [];
      setSubOrders(rawSubs);
    } catch (err) {
      console.error("Failed to load dispatch run sheet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  // Combine tasks into unified format
  const unifiedTasks = useMemo(() => {
    const list = [];

    // 1. Subscription Daily Drops
    subOrders.forEach((sub) => {
      const assignedId = sub.assignedDeliveryBoy?._id || sub.deliveryBoy?.id || "";
      const assignedName = sub.assignedDeliveryBoy?.name || sub.deliveryBoy?.name || "";
      const assignedPartnerId =
        sub.assignedDeliveryBoy?.partnerId || sub.deliveryBoy?.partnerId || "";

      // Check if dropped today
      const droppedToday = Array.isArray(sub.dailyDrops)
        ? sub.dailyDrops.some(
            (d) =>
              d.status === "Delivered" &&
              new Date(d.dropDate || d.deliveredAt).toISOString().slice(0, 10) === todayStr
          )
        : false;

      const isCompleted = sub.status === "Completed" || droppedToday;
      let statusLabel = droppedToday
        ? "Delivered Today"
        : sub.status === "Active"
        ? "Out for Delivery"
        : sub.status || "Pending";

      const pendingJars =
        sub.pendingEmptyJars !== undefined
          ? sub.pendingEmptyJars
          : Math.max(0, (sub.bottlesDelivered || 0) - (sub.emptyJarsCollected || 0));

      const slot = sub.deliverySlot || "Morning (7 AM - 10 AM)";

      list.push({
        taskId: `SUB-${sub.orderNumber}`,
        originalId: sub._id,
        type: "subscription",
        orderNumber: sub.orderNumber,
        customerName: sub.customerName || "Customer",
        phone: sub.customerPhone || "N/A",
        address: `${sub.deliveryAddress?.street ? sub.deliveryAddress.street + ", " : ""}${
          sub.deliveryAddress?.city || "Bhubaneswar"
        }${sub.deliveryAddress?.postalCode ? " - " + sub.deliveryAddress.postalCode : ""}`,
        planTitle: sub.planTitle,
        quotaInfo: `${sub.bottlesPerDelivery || 2} Jars (${sub.deliveryFrequency || "Daily"})`,
        bottlesNeeded: Number(sub.bottlesPerDelivery) || 2,
        pendingEmptyJars: Number(pendingJars) || 0,
        timeSlot: slot,
        assignedRiderName: assignedName || "Unassigned",
        assignedPartnerId: assignedPartnerId,
        assignedRiderId: assignedId,
        isCompleted: isCompleted,
        statusLabel: statusLabel,
        raw: sub,
        date: sub.startDate ? new Date(sub.startDate).toISOString().slice(0, 10) : todayStr,
      });
    });

    // 2. Shop Orders
    shopOrders.forEach((ord) => {
      const assignedId = ord.assignedDeliveryBoy?._id || ord.deliveryBoy?.id || "";
      const assignedName = ord.assignedDeliveryBoy?.name || ord.deliveryBoy?.name || "";
      const assignedPartnerId =
        ord.assignedDeliveryBoy?.partnerId || ord.deliveryBoy?.partnerId || "";

      const ordStatus = (ord.orderStatus || "").toLowerCase();
      const isDelivered = ordStatus === "delivered";
      const isOutForDelivery =
        ordStatus === "out_for_delivery" || ordStatus === "out for delivery" || ordStatus === "shipped";

      let statusLabel = isDelivered
        ? "Delivered"
        : isOutForDelivery
        ? "Out for Delivery"
        : ord.orderStatus || "Confirmed";

      const itemsSummary =
        Array.isArray(ord.items) && ord.items.length > 0
          ? ord.items.map((i) => `${i.quantity} × ${i.title || i.name}`).join(", ")
          : "Alka Drops 20L Water";

      const address = ord.shippingAddress?.addressLine1
        ? `${ord.shippingAddress.addressLine1}${
            ord.shippingAddress.city ? `, ${ord.shippingAddress.city}` : ""
          }${ord.shippingAddress.postalCode ? ` - ${ord.shippingAddress.postalCode}` : ""}`
        : ord.shippingAddress?.address || "Bhubaneswar";

      const estimatedJars = Array.isArray(ord.items)
        ? ord.items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)
        : 1;

      const pendingShopJars = ord.deliveryDetails?.pendingEmptyJars || 0;
      const slot = ord.deliverySlot || "Morning (7 AM - 10 AM)";

      list.push({
        taskId: `ORD-${ord.orderNumber}`,
        originalId: ord._id,
        type: "shop",
        orderNumber: ord.orderNumber,
        customerName: ord.shippingAddress?.fullName || ord.customer || "Customer",
        phone: ord.shippingAddress?.phone || ord.phone || "N/A",
        address: address,
        planTitle: `Shop Order (₹${Number(ord.totalAmount || ord.amount || 0).toLocaleString("en-IN")})`,
        quotaInfo: itemsSummary,
        bottlesNeeded: estimatedJars,
        pendingEmptyJars: Number(pendingShopJars) || 0,
        timeSlot: slot,
        assignedRiderName: assignedName || "Unassigned",
        assignedPartnerId: assignedPartnerId,
        assignedRiderId: assignedId,
        isCompleted: isDelivered,
        statusLabel: statusLabel,
        deliveryDetails: ord.deliveryDetails || null,
        raw: ord,
        date: ord.createdAt ? new Date(ord.createdAt).toISOString().slice(0, 10) : todayStr,
      });
    });

    return list;
  }, [subOrders, shopOrders, todayStr]);

  // Dynamic rider task counters
  const riderCounters = useMemo(() => {
    const map = { all: unifiedTasks.length, unassigned: 0 };
    unifiedTasks.forEach((t) => {
      if (!t.assignedRiderId || t.assignedRiderName === "Unassigned") {
        map.unassigned = (map.unassigned || 0) + 1;
      } else {
        map[t.assignedRiderId] = (map[t.assignedRiderId] || 0) + 1;
        if (t.assignedPartnerId) {
          map[t.assignedPartnerId] = (map[t.assignedPartnerId] || 0) + 1;
        }
      }
    });
    return map;
  }, [unifiedTasks]);

  // Filter tasks based on all active criteria
  const filteredTasks = useMemo(() => {
    return unifiedTasks.filter((t) => {
      // 1. Delivery Boy filter
      if (selectedRiderId !== "all") {
        if (selectedRiderId === "unassigned") {
          if (t.assignedRiderId && t.assignedRiderName !== "Unassigned") return false;
        } else {
          if (
            t.assignedRiderId !== selectedRiderId &&
            t.assignedPartnerId !== selectedRiderId
          ) {
            return false;
          }
        }
      }

      // 2. Type filter
      if (typeFilter === "subscription" && t.type !== "subscription") return false;
      if (typeFilter === "shop" && t.type !== "shop") return false;

      // 3. Status filter
      if (statusFilter === "pending") {
        if (t.isCompleted || t.statusLabel.toLowerCase().includes("out")) return false;
      } else if (statusFilter === "out_for_delivery") {
        if (!t.statusLabel.toLowerCase().includes("out") || t.isCompleted) return false;
      } else if (statusFilter === "delivered") {
        if (!t.isCompleted) return false;
      }

      // 4. Date filter
      if (dateFilter === "today" && t.date !== todayStr) return false;

      // 5. Time slot filter
      if (slotFilter !== "all") {
        const slotLower = (t.timeSlot || "").toLowerCase();
        if (slotFilter === "morning" && !slotLower.includes("morning") && !slotLower.includes("7 am")) return false;
        if (slotFilter === "afternoon" && !slotLower.includes("afternoon") && !slotLower.includes("11 am")) return false;
        if (slotFilter === "evening" && !slotLower.includes("evening") && !slotLower.includes("4 pm")) return false;
      }

      // 6. Only Empties Due
      if (onlyEmptiesDue && t.pendingEmptyJars <= 0) return false;

      // 7. Search text
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const match =
          t.orderNumber.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.phone.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q) ||
          t.assignedRiderName.toLowerCase().includes(q) ||
          (t.assignedPartnerId && t.assignedPartnerId.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [
    unifiedTasks,
    selectedRiderId,
    typeFilter,
    statusFilter,
    dateFilter,
    slotFilter,
    onlyEmptiesDue,
    search,
    todayStr,
  ]);

  // Summary statistics across entire sheet
  const stats = useMemo(() => {
    const total = unifiedTasks.length;
    const delivered = unifiedTasks.filter((t) => t.isCompleted).length;
    const outForDelivery = unifiedTasks.filter(
      (t) => !t.isCompleted && t.statusLabel.toLowerCase().includes("out")
    ).length;
    const pending = total - delivered - outForDelivery;
    const emptiesDueCount = unifiedTasks.filter((t) => t.pendingEmptyJars > 0).length;
    const subCount = unifiedTasks.filter((t) => t.type === "subscription").length;
    const shopCount = unifiedTasks.filter((t) => t.type === "shop").length;

    return { total, delivered, outForDelivery, pending, emptiesDueCount, subCount, shopCount };
  }, [unifiedTasks]);

  // Has active non-default filter
  const hasActiveFilters =
    selectedRiderId !== "all" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    dateFilter !== "all" ||
    slotFilter !== "all" ||
    onlyEmptiesDue ||
    search.trim() !== "";

  const handleResetFilters = () => {
    setSelectedRiderId("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
    setSlotFilter("all");
    setOnlyEmptiesDue(false);
    setSearch("");
  };

  // Mark Out for Delivery
  const handleMarkOutForDelivery = async (task) => {
    try {
      if (task.type === "shop") {
        await API.put(`/orders/${task.originalId}/status`, { orderStatus: "out_for_delivery" });
      } else {
        await API.patch(`/subscription-orders/${task.originalId}/status`, { status: "Active" });
      }
      fetchData();
    } catch (err) {
      console.error("Failed to update status to Out for Delivery:", err);
    }
  };

  // Open Submit Delivery Modal
  const openSubmitModal = (task) => {
    setSubmitModal({
      isOpen: true,
      taskType: task.type,
      item: task,
      bottlesDelivered: task.bottlesNeeded || 1,
      emptyJarsCollected: task.bottlesNeeded || 0,
      emptyJarReason: "Water jar not finished / still in use",
      deliveryNotes: "",
      proofReceivedBy: task.customerName || "",
      isSubmitting: false,
    });
  };

  // Handle Confirm Submit
  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!submitModal.item) return;

    setSubmitModal((p) => ({ ...p, isSubmitting: true }));
    const task = submitModal.item;

    try {
      if (submitModal.taskType === "subscription") {
        await API.post(`/subscription-orders/${task.originalId}/record-drop`, {
          bottlesDelivered: submitModal.bottlesDelivered,
          emptyJarsCollected: submitModal.emptyJarsCollected,
          emptyJarReason: submitModal.emptyJarReason,
          deliveredBy: task.assignedRiderName || "Delivery Boy",
          partnerId: task.assignedPartnerId || "",
          notes: submitModal.deliveryNotes || "Delivered successfully",
          proofReceivedBy: submitModal.proofReceivedBy || task.customerName,
        });
      } else {
        await API.post(`/orders/${task.originalId}/submit-delivery`, {
          deliveredBy: task.assignedRiderName || "Delivery Boy",
          partnerId: task.assignedPartnerId || "",
          emptyJarsCollected: submitModal.emptyJarsCollected,
          emptyJarReason: submitModal.emptyJarReason,
          deliveryNotes: submitModal.deliveryNotes || "Delivered to customer",
          proofReceivedBy: submitModal.proofReceivedBy || task.customerName,
        });
      }

      setSubmitModal({
        isOpen: false,
        taskType: "",
        item: null,
        bottlesDelivered: 1,
        emptyJarsCollected: 0,
        emptyJarReason: "Water jar not finished / still in use",
        deliveryNotes: "",
        proofReceivedBy: "",
        isSubmitting: false,
      });

      fetchData();
    } catch (err) {
      console.error("Failed to submit delivery:", err);
      alert(err.response?.data?.message || "Failed to confirm delivery.");
      setSubmitModal((p) => ({ ...p, isSubmitting: false }));
    }
  };

  return (
    <div className="AlkaDispatch">
      {/* Sleek Top Bar (Single Row, No Bulky Headings) */}
      <div className="AlkaDispatch-topBar">
        <div className="AlkaDispatch-topBarLeft">
          <div className="AlkaDispatch-titleGroup">
            <h1 className="AlkaDispatch-title">Delivery Dispatch</h1>
            <span className="AlkaDispatch-liveBadge">
              <span className="AlkaDispatch-pulseDot"></span> LIVE DISPATCH
            </span>
            <span className="AlkaDispatch-datePill">
              <FiCalendar /> {formattedToday}
            </span>
          </div>
        </div>

        <div className="AlkaDispatch-topBarRight">
          {/* View Mode Toggle */}
          <div className="AlkaDispatch-viewToggle">
            <button
              type="button"
              className={`AlkaDispatch-viewBtn ${viewMode === "cards" ? "active" : ""}`}
              onClick={() => setViewMode("cards")}
              title="Cards Grid View"
            >
              <FiGrid /> <span>Cards</span>
            </button>
            <button
              type="button"
              className={`AlkaDispatch-viewBtn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Compact Run Sheet Table View"
            >
              <FiList /> <span>Run Sheet</span>
            </button>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            className="AlkaDispatch-syncBtn"
            onClick={fetchData}
            title="Refresh Live Deliveries"
          >
            <FiRefreshCw className={isLoading ? "spin" : ""} />
            <span>Sync Runs</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Row */}
      <div className="AlkaDispatch-kpiRow">
        <div className="AlkaDispatch-kpiCard">
          <div className="AlkaDispatch-kpiIcon total">
            <FiPackage />
          </div>
          <div className="AlkaDispatch-kpiInfo">
            <span className="AlkaDispatch-kpiLabel">Total Runs</span>
            <strong className="AlkaDispatch-kpiValue">{stats.total}</strong>
          </div>
        </div>

        <div className="AlkaDispatch-kpiCard">
          <div className="AlkaDispatch-kpiIcon transit">
            <FiTruck />
          </div>
          <div className="AlkaDispatch-kpiInfo">
            <span className="AlkaDispatch-kpiLabel">Out for Delivery</span>
            <strong className="AlkaDispatch-kpiValue">{stats.outForDelivery}</strong>
          </div>
        </div>

        <div className="AlkaDispatch-kpiCard">
          <div className="AlkaDispatch-kpiIcon pending">
            <FiClock />
          </div>
          <div className="AlkaDispatch-kpiInfo">
            <span className="AlkaDispatch-kpiLabel">Pending Pickup</span>
            <strong className="AlkaDispatch-kpiValue">{stats.pending}</strong>
          </div>
        </div>

        <div className="AlkaDispatch-kpiCard">
          <div className="AlkaDispatch-kpiIcon delivered">
            <FiCheckCircle />
          </div>
          <div className="AlkaDispatch-kpiInfo">
            <span className="AlkaDispatch-kpiLabel">Delivered Today</span>
            <strong className="AlkaDispatch-kpiValue">{stats.delivered}</strong>
          </div>
        </div>

        <div className="AlkaDispatch-kpiCard">
          <div className="AlkaDispatch-kpiIcon empties">
            <FiAlertTriangle />
          </div>
          <div className="AlkaDispatch-kpiInfo">
            <span className="AlkaDispatch-kpiLabel">Empties Pending</span>
            <strong className="AlkaDispatch-kpiValue">{stats.emptiesDueCount}</strong>
          </div>
        </div>
      </div>

      {/* Modern Filter Command Bar */}
      <div className="AlkaDispatch-filterPanel">
        {/* Row 1: Search & Rider & Date & Slot Dropdowns */}
        <div className="AlkaDispatch-filterRow1">
          {/* Search Box */}
          <div className="AlkaDispatch-searchWrap">
            <FiSearch className="AlkaDispatch-searchIcon" />
            <input
              type="text"
              placeholder="Search by order #, customer, mobile, locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="AlkaDispatch-searchInput"
            />
            {search && (
              <button
                type="button"
                className="AlkaDispatch-clearSearch"
                onClick={() => setSearch("")}
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Delivery Boy Selector */}
          <div className="AlkaDispatch-selectWrap">
            <FiUser className="AlkaDispatch-selectIcon" />
            <select
              value={selectedRiderId}
              onChange={(e) => setSelectedRiderId(e.target.value)}
              className="AlkaDispatch-select"
            >
              <option value="all">👥 All Delivery Partners ({unifiedTasks.length})</option>
              {deliveryBoys.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.partnerId || "Rider"}) • {riderCounters[b._id] || 0} tasks
                </option>
              ))}
              <option value="unassigned">⚠️ Unassigned Runs ({riderCounters.unassigned || 0})</option>
            </select>
          </div>

          {/* Time Slot Filter */}
          <div className="AlkaDispatch-selectWrap">
            <FiClock className="AlkaDispatch-selectIcon" />
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="AlkaDispatch-select"
            >
              <option value="all">⏰ All Time Slots</option>
              <option value="morning">🌅 Morning (7 AM - 10 AM)</option>
              <option value="afternoon">☀️ Afternoon (11 AM - 3 PM)</option>
              <option value="evening">🌆 Evening (4 PM - 8 PM)</option>
            </select>
          </div>

          {/* Date Scope Filter */}
          <div className="AlkaDispatch-selectWrap dateWrap">
            <FiCalendar className="AlkaDispatch-selectIcon" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="AlkaDispatch-select"
            >
              <option value="all">📅 All Schedule Dates</option>
              <option value="today">⚡ Today's Runs Only</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category & Status Segmented Pills + Reset */}
        <div className="AlkaDispatch-filterRow2">
          {/* Order Type Pills */}
          <div className="AlkaDispatch-pillGroup">
            <button
              type="button"
              className={`AlkaDispatch-pill ${typeFilter === "all" ? "active" : ""}`}
              onClick={() => setTypeFilter("all")}
            >
              All Types <span className="pillCount">{unifiedTasks.length}</span>
            </button>
            <button
              type="button"
              className={`AlkaDispatch-pill ${typeFilter === "subscription" ? "active" : ""}`}
              onClick={() => setTypeFilter("subscription")}
            >
              💧 Subscriptions <span className="pillCount">{stats.subCount}</span>
            </button>
            <button
              type="button"
              className={`AlkaDispatch-pill ${typeFilter === "shop" ? "active" : ""}`}
              onClick={() => setTypeFilter("shop")}
            >
              🛒 Shop Orders <span className="pillCount">{stats.shopCount}</span>
            </button>
          </div>

          <div className="AlkaDispatch-divider"></div>

          {/* Status Pills */}
          <div className="AlkaDispatch-pillGroup">
            <button
              type="button"
              className={`AlkaDispatch-pill status ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All Status
            </button>
            <button
              type="button"
              className={`AlkaDispatch-pill status pending ${statusFilter === "pending" ? "active" : ""}`}
              onClick={() => setStatusFilter("pending")}
            >
              ⏳ Pending <span className="pillCount">{stats.pending}</span>
            </button>
            <button
              type="button"
              className={`AlkaDispatch-pill status transit ${
                statusFilter === "out_for_delivery" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("out_for_delivery")}
            >
              🚚 Out for Delivery <span className="pillCount">{stats.outForDelivery}</span>
            </button>
            <button
              type="button"
              className={`AlkaDispatch-pill status delivered ${
                statusFilter === "delivered" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("delivered")}
            >
              ✅ Delivered <span className="pillCount">{stats.delivered}</span>
            </button>
          </div>

          <div className="AlkaDispatch-divider"></div>

          {/* Empties Due Toggle Chip */}
          <button
            type="button"
            className={`AlkaDispatch-emptiesChip ${onlyEmptiesDue ? "active" : ""}`}
            onClick={() => setOnlyEmptiesDue(!onlyEmptiesDue)}
            title="Filter customers who currently owe empty jars"
          >
            <FiAlertTriangle />
            <span>Empties Due ({stats.emptiesDueCount})</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              className="AlkaDispatch-resetBtn"
              onClick={handleResetFilters}
              title="Reset all active filters"
            >
              <FiX /> Clear Filters
            </button>
          )}

          <div className="AlkaDispatch-matchCounter">
            Showing <strong>{filteredTasks.length}</strong> of {unifiedTasks.length} tasks
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredTasks.length === 0 ? (
        <div className="AlkaDispatch-emptyState">
          <div className="AlkaDispatch-emptyIcon">
            <FiCheckCircle />
          </div>
          <h3>No Deliveries Matching Filter</h3>
          <p>Try adjusting your search criteria, rider assignment, or status pills.</p>
          {hasActiveFilters && (
            <button
              type="button"
              className="AlkaDispatch-emptyResetBtn"
              onClick={handleResetFilters}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : viewMode === "cards" ? (
        /* CARDS GRID VIEW */
        <div className="AlkaDispatch-cardsGrid">
          {filteredTasks.map((task) => (
            <div
              key={task.taskId}
              className={`AlkaDispatch-taskCard ${task.isCompleted ? "is-delivered" : ""}`}
            >
              {/* Card Top Strip */}
              <div className="AlkaDispatch-cardHead">
                <div className="AlkaDispatch-badgeRow">
                  <span className={`AlkaDispatch-typeTag ${task.type}`}>
                    {task.type === "subscription" ? "💧 Subscription" : "🛒 Shop Retail"}
                  </span>
                  <span className="AlkaDispatch-orderNum">#{task.orderNumber}</span>
                </div>

                <div className="AlkaDispatch-headRight">
                  <span className="AlkaDispatch-slotChip">
                    <FiClock /> {task.timeSlot.split("(")[0].trim()}
                  </span>
                  <span
                    className={`AlkaDispatch-statusBadge ${
                      task.isCompleted
                        ? "delivered"
                        : task.statusLabel.toLowerCase().includes("out")
                        ? "transit"
                        : "pending"
                    }`}
                  >
                    {task.isCompleted ? "✓ Delivered" : task.statusLabel}
                  </span>
                </div>
              </div>

              {/* Customer Info Row */}
              <div className="AlkaDispatch-custInfo">
                <div className="AlkaDispatch-avatar">
                  {task.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="AlkaDispatch-custDetails">
                  <h4 className="AlkaDispatch-custName">{task.customerName}</h4>
                  <div className="AlkaDispatch-phoneRow">
                    <a
                      href={`tel:${task.phone}`}
                      className="AlkaDispatch-phoneLink"
                      title="Direct Call Customer"
                    >
                      <FiPhone /> <span>{task.phone}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Destination Address */}
              <div className="AlkaDispatch-addressBox">
                <FiMapPin className="AlkaDispatch-addressPin" />
                <span className="AlkaDispatch-addressText" title={task.address}>
                  {task.address}
                </span>
              </div>

              {/* Drop Requirement & Plan Banner */}
              <div className="AlkaDispatch-quotaBanner">
                <div className="AlkaDispatch-quotaItem">
                  <span className="qLabel">Items to Deliver:</span>
                  <strong className="qVal">{task.quotaInfo}</strong>
                </div>
                <div className="AlkaDispatch-jarsCount">
                  <span className="jarsNum">{task.bottlesNeeded}</span>
                  <span className="jarsTxt">Jars Due</span>
                </div>
              </div>

              {/* Empty Jar Status Banner */}
              <div
                className={`AlkaDispatch-emptyBanner ${
                  task.pendingEmptyJars > 0 ? "warning" : "balanced"
                }`}
              >
                <div className="AlkaDispatch-emptyBannerLeft">
                  {task.pendingEmptyJars > 0 ? (
                    <FiAlertTriangle className="iconWarn" />
                  ) : (
                    <FiCheck className="iconOk" />
                  )}
                  <span>
                    {task.pendingEmptyJars > 0
                      ? `${task.pendingEmptyJars} Empty Jar(s) with Customer`
                      : "Empty Jar Balance OK (0 Due)"}
                  </span>
                </div>
                {task.pendingEmptyJars > 0 && (
                  <span className="AlkaDispatch-collectPill">Collect Today</span>
                )}
              </div>

              {/* Assigned Partner Footer */}
              <div className="AlkaDispatch-partnerRow">
                <div className="AlkaDispatch-partnerName">
                  <FiShield style={{ color: "#0d9488" }} />
                  <span>
                    Partner: <strong>{task.assignedRiderName}</strong>{" "}
                    {task.assignedPartnerId && `(${task.assignedPartnerId})`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="AlkaDispatch-cardActions">
                {task.isCompleted ? (
                  <div className="AlkaDispatch-doneNotice">
                    <FiCheckCircle /> Delivered & Empties Reconciled
                  </div>
                ) : (
                  <>
                    {!task.statusLabel.toLowerCase().includes("out") && (
                      <button
                        type="button"
                        className="AlkaDispatch-actionBtn outForDelivery"
                        onClick={() => handleMarkOutForDelivery(task)}
                      >
                        <FiTruck /> Out for Delivery
                      </button>
                    )}
                    <button
                      type="button"
                      className="AlkaDispatch-actionBtn submitDelivered"
                      onClick={() => openSubmitModal(task)}
                    >
                      <FiCheckCircle /> Submit Delivered
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* COMPACT RUN SHEET TABLE VIEW */
        <div className="AlkaDispatch-tableCard">
          <table className="AlkaDispatch-table">
            <thead>
              <tr>
                <th>Order / Task</th>
                <th>Customer & Contact</th>
                <th>Destination Address</th>
                <th>Items to Drop</th>
                <th>Slot</th>
                <th>Assigned Partner</th>
                <th>Empty Jars</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.taskId} className={task.isCompleted ? "is-delivered-row" : ""}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span className="AlkaDispatch-tblOrder">#{task.orderNumber}</span>
                      <span className={`AlkaDispatch-typeTag tbl ${task.type}`}>
                        {task.type === "subscription" ? "💧 Sub Drop" : "🛒 Shop Order"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong className="AlkaDispatch-tblCust">{task.customerName}</strong>
                      <a href={`tel:${task.phone}`} className="AlkaDispatch-tblPhone">
                        <FiPhone /> {task.phone}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="AlkaDispatch-tblAddr" title={task.address}>
                      <FiMapPin style={{ color: "#0d9488", flexShrink: 0, marginTop: "2px" }} />
                      <span>{task.address}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: "12.5px", color: "#0f172a" }}>
                        {task.bottlesNeeded} × 20L Can
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{task.quotaInfo}</span>
                    </div>
                  </td>
                  <td>
                    <span className="AlkaDispatch-tblSlot">{task.timeSlot.split("(")[0].trim()}</span>
                  </td>
                  <td>
                    <span className="AlkaDispatch-tblPartner">
                      {task.assignedRiderName}
                      {task.assignedPartnerId && (
                        <small style={{ color: "#64748b", display: "block" }}>
                          {task.assignedPartnerId}
                        </small>
                      )}
                    </span>
                  </td>
                  <td>
                    {task.pendingEmptyJars > 0 ? (
                      <span className="AlkaDispatch-tblEmpty warn">
                        ⚠️ {task.pendingEmptyJars} Due
                      </span>
                    ) : (
                      <span className="AlkaDispatch-tblEmpty ok">✓ 0 Due</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`AlkaDispatch-statusBadge tbl ${
                        task.isCompleted
                          ? "delivered"
                          : task.statusLabel.toLowerCase().includes("out")
                          ? "transit"
                          : "pending"
                      }`}
                    >
                      {task.isCompleted ? "✓ Delivered" : task.statusLabel}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {task.isCompleted ? (
                      <span className="AlkaDispatch-tblDone">
                        <FiCheck /> Done
                      </span>
                    ) : (
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        {!task.statusLabel.toLowerCase().includes("out") && (
                          <button
                            type="button"
                            className="AlkaDispatch-tblBtn transit"
                            onClick={() => handleMarkOutForDelivery(task)}
                            title="Mark Out for Delivery"
                          >
                            <FiTruck />
                          </button>
                        )}
                        <button
                          type="button"
                          className="AlkaDispatch-tblBtn deliver"
                          onClick={() => openSubmitModal(task)}
                          title="Submit Delivery Confirmation"
                        >
                          <FiCheckCircle /> Deliver
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBMIT DELIVERY MODAL */}
      {submitModal.isOpen && submitModal.item && (
        <div
          className="AlkaDispatch-modalOverlay"
          onClick={() => setSubmitModal((p) => ({ ...p, isOpen: false }))}
        >
          <div className="AlkaDispatch-modalDialog" onClick={(e) => e.stopPropagation()}>
            <div className="AlkaDispatch-modalHeader">
              <div>
                <h3>Submit Delivery Confirmation</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {submitModal.taskType === "subscription" ? "💧 Subscription Drop" : "🛒 Shop Order"}{" "}
                  #{submitModal.item.orderNumber}
                </span>
              </div>
              <button
                type="button"
                className="AlkaDispatch-closeBtn"
                onClick={() => setSubmitModal((p) => ({ ...p, isOpen: false }))}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="AlkaDispatch-modalForm">
              {/* Customer Box */}
              <div className="AlkaDispatch-formCustBox">
                <strong>{submitModal.item.customerName}</strong>
                <p>{submitModal.item.address}</p>
                <span style={{ fontSize: "12px", color: "#0284c7" }}>
                  📞 {submitModal.item.phone}
                </span>
              </div>

              {/* Standard inputs: Jars delivered and empty cans */}
              <div className="AlkaDispatch-formGrid">
                <div className="AlkaDispatch-formGroup">
                  <label>Jars Delivered to Customer:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={submitModal.bottlesDelivered}
                    onChange={(e) =>
                      setSubmitModal((p) => ({
                        ...p,
                        bottlesDelivered: Number(e.target.value) || 1,
                      }))
                    }
                  />
                  <small style={{ color: "#64748b" }}>
                    Expected: {submitModal.item.bottlesNeeded} jar(s)
                  </small>
                </div>

                <div className="AlkaDispatch-formGroup">
                  <label>Empty Jars Collected / Returned:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={submitModal.emptyJarsCollected}
                    onChange={(e) =>
                      setSubmitModal((p) => ({
                        ...p,
                        emptyJarsCollected: Number(e.target.value) || 0,
                      }))
                    }
                  />
                  <small style={{ color: "#64748b" }}>
                    Empty 20L jars taken back (0 if unreturned)
                  </small>
                </div>
              </div>

              {/* If empty jars not taken or partial */}
              {submitModal.emptyJarsCollected < submitModal.bottlesDelivered && (
                <div className="AlkaDispatch-emptyJarWarningBox">
                  <div className="AlkaDispatch-emptyJarWarnTitle">
                    <FiAlertCircle /> Empty Jar Not Collected / Partial Return
                  </div>
                  <p className="AlkaDispatch-emptyJarWarnText">
                    Customer is returning {submitModal.emptyJarsCollected} jar(s) instead of{" "}
                    {submitModal.bottlesDelivered}. The unreturned jar balance will be recorded
                    automatically as pending on customer account for next delivery collection.
                  </p>
                  <label className="AlkaDispatch-emptyJarReasonLabel">
                    Reason for Not Collecting Empty Jar:
                  </label>
                  <select
                    className="AlkaDispatch-emptyJarReasonSelect"
                    value={submitModal.emptyJarReason || "Water jar not finished / still in use"}
                    onChange={(e) =>
                      setSubmitModal((p) => ({ ...p, emptyJarReason: e.target.value }))
                    }
                  >
                    <option value="Water jar not finished / still in use">
                      Water jar not finished / still in use
                    </option>
                    <option value="Customer promised return in next drop">
                      Customer promised return in next drop
                    </option>
                    <option value="Customer not at home / Left with security">
                      Customer not at home / Left with security
                    </option>
                    <option value="First delivery / New customer without initial empty jar">
                      First delivery / New customer
                    </option>
                    <option value="Customer requested extra buffer jar">
                      Customer requested extra buffer jar
                    </option>
                  </select>
                </div>
              )}

              {/* Handed Over To */}
              <div className="AlkaDispatch-formGroup">
                <label>Handed Over To (Customer / Doorstep / Security):</label>
                <input
                  type="text"
                  placeholder="e.g. Saroj Mallik / Security Guard"
                  value={submitModal.proofReceivedBy}
                  onChange={(e) =>
                    setSubmitModal((p) => ({ ...p, proofReceivedBy: e.target.value }))
                  }
                />
              </div>

              {/* Delivery Notes */}
              <div className="AlkaDispatch-formGroup">
                <label>Delivery Confirmation Notes:</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Delivered to 2nd floor, fresh jars placed, empty cans received."
                  value={submitModal.deliveryNotes}
                  onChange={(e) =>
                    setSubmitModal((p) => ({ ...p, deliveryNotes: e.target.value }))
                  }
                />
              </div>

              <div className="AlkaDispatch-modalFooter">
                <button
                  type="button"
                  className="AlkaDispatch-cancelBtn"
                  onClick={() => setSubmitModal((p) => ({ ...p, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="AlkaDispatch-submitBtn"
                  disabled={submitModal.isSubmitting}
                >
                  {submitModal.isSubmitting ? (
                    "Saving & Updating..."
                  ) : (
                    <>
                      <FiCheckCircle /> Confirm & Mark as Delivered
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

export default DeliveryDispatch;
