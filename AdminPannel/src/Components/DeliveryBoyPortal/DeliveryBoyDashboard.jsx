import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiCalendar,
  FiAlertTriangle,
  FiCheck,
  FiRefreshCw,
  FiUser,
  FiShield,
  FiArrowRight,
  FiAlertCircle,
  FiX,
  FiNavigation,
  FiFilter,
  FiDroplet,
  FiShoppingCart,
  FiActivity,
  FiExternalLink,
  FiCompass,
  FiSearch,
  FiRotateCcw,
} from "react-icons/fi";
import { useAdminAuth } from "../../context/AdminAuthContext";
import API from "../../services/api";
import "./DeliveryBoyDashboard.css";

// Safely format any address input into a clean string (prevents object rendering errors)
const safeAddressText = (addr, fallback = "") => {
  if (!addr) return fallback;
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    return addr.full || addr.primary || addr.address || fallback;
  }
  return String(addr);
};

// Reverse geocode longitude & latitude into accurate street / area address (Swiggy & Flipkart style)
const reverseGeocodeCoords = async (latitude, longitude) => {
  if (!latitude || !longitude) return { primary: "", full: "" };

  const cleanCity = (c) =>
    c
      ? c
          .replace(
            /\s+(Municipal Corporation|taluku|North City Corporation|South City Corporation|\(M\.Corp\.\))/gi,
            ""
          )
          .trim()
      : "";

  // 1. High-Precision OpenStreetMap Nominatim (zoom=18 for exact street & building)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { "User-Agent": "AlkaDropsFleet/2.0" },
      }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const a = data.address || {};

      const street = [a.house_number, a.building, a.road, a.pedestrian]
        .filter(Boolean)
        .join(" ");
      const locality =
        a.neighbourhood || a.quarter || a.suburb || a.residential || "";
      const subArea =
        a.suburb && a.suburb !== locality
          ? a.suburb
          : a.city_district && a.city_district !== locality
          ? cleanCity(a.city_district)
          : "";
      const city = cleanCity(a.city || a.town || a.county) || "Bhubaneswar";
      const pin = a.postcode
        ? a.postcode.startsWith("PIN")
          ? a.postcode
          : `PIN: ${a.postcode}`
        : "";

      const rawParts = [street, locality, subArea, city, pin].filter(Boolean);
      const seen = new Set();
      const parts = [];
      for (const p of rawParts) {
        const k = p.toLowerCase().trim();
        if (!seen.has(k) && k.length > 0) {
          seen.add(k);
          parts.push(p);
        }
      }

      if (parts.length > 0) {
        const primary = [locality || street, city].filter(Boolean).join(", ");
        const full = parts.join(", ");
        return { primary, full };
      }
    }
  } catch (err) {
    // fallback to secondary reverse geocoder
  }

  // 2. Fallback: BigDataCloud Reverse Geocoder with deduplication
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const locality =
        data.locality || data.localityInfo?.administrative?.[3]?.name || "";
      const city = cleanCity(data.city || data.principalSubdivision || "Bhubaneswar");
      const pin = data.postcode ? `PIN: ${data.postcode}` : "";

      const rawParts = [locality, city !== locality ? city : "", pin].filter(Boolean);
      const seen = new Set();
      const parts = [];
      for (const p of rawParts) {
        const k = p.toLowerCase().trim();
        if (!seen.has(k) && k.length > 0) {
          seen.add(k);
          parts.push(p);
        }
      }

      if (parts.length > 0) {
        const primary = [locality, city].filter(Boolean).join(", ");
        const full = parts.join(", ");
        return { primary, full };
      }
    }
  } catch (err) {
    // fallback
  }

  return {
    primary: "Delivery Operations Zone",
    full: "Central Logistics Route, Bhubaneswar",
  };
};

const DeliveryBoyDashboard = ({ initialTab = "all" }) => {
  const { adminUser, refreshUser } = useAdminAuth();
  const location = useLocation();

  const [workData, setWorkData] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [currentCoords, setCurrentCoords] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentPrimaryArea, setCurrentPrimaryArea] = useState("");
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Detect exact page type based on route path
  const pageType = location.pathname.includes("delivery-subscriptions")
    ? "subscription"
    : location.pathname.includes("delivery-shop-orders")
    ? "shop"
    : location.pathname.includes("delivery-attendance")
    ? "attendance"
    : initialTab !== "all"
    ? initialTab
    : "dashboard";

  // Tab state - strictly matches the current dedicated view
  const [activeTab, setActiveTab] = useState(
    pageType === "dashboard" ? "all" : pageType
  );
  // Period Filter Tabs: 'today' (default), 'week', 'month', 'year', 'all'
  const [periodFilter, setPeriodFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'delivered'
  const [search, setSearch] = useState("");

  const resetAllFilters = () => {
    setSearch("");
    setPeriodFilter("today");
    setStatusFilter("all");
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    periodFilter !== "today" ||
    statusFilter !== "all"
  );

  // Sync tab if URL route or initialTab changes
  useEffect(() => {
    if (location.pathname.includes("delivery-subscriptions")) {
      setActiveTab("subscription");
    } else if (location.pathname.includes("delivery-shop-orders")) {
      setActiveTab("shop");
    } else if (location.pathname.includes("delivery-attendance")) {
      setActiveTab("attendance");
    } else if (initialTab && initialTab !== "all") {
      setActiveTab(initialTab);
    } else {
      setActiveTab("all");
    }
  }, [location.pathname, initialTab]);

  // Submit Modal state
  const [submitModal, setSubmitModal] = useState({
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // Obtain Live Geolocation and Resolve Address
  const getLiveLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setIsResolvingAddress(false);
        resolve(null);
        return;
      }
      setIsResolvingAddress(true);

      const onSuccess = async (position) => {
        try {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy || 0),
          };
          setCurrentCoords(coords);

          // Reverse geocode accurate Swiggy / Flipkart style address
          const resolved = await reverseGeocodeCoords(coords.latitude, coords.longitude);
          const fullAddr = safeAddressText(resolved?.full || resolved?.primary, "Bhubaneswar Logistics Zone");
          const primArea = safeAddressText(resolved?.primary, "");
          setCurrentAddress(fullAddr);
          setCurrentPrimaryArea(primArea);
          setIsResolvingAddress(false);

          resolve({ ...coords, address: fullAddr });
        } catch (err) {
          setIsResolvingAddress(false);
          resolve(null);
        }
      };

      const onError = (error) => {
        // If high accuracy times out, fallback to fast network location
        if (error.code === 3 /* TIMEOUT */) {
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            () => {
              setIsResolvingAddress(false);
              resolve(null);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
          return;
        }
        setIsResolvingAddress(false);
        resolve(null);
      };

      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onError,
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    });
  };

  const fetchWorkAndAttendance = async () => {
    try {
      setIsLoading(true);
      const [workRes, attRes, ordersRes, subsRes] = await Promise.all([
        API.get("/admin-users/delivery-work").catch(() => ({ data: { success: false } })),
        API.get("/admin-users/attendance").catch(() => ({ data: { attendance: [] } })),
        API.get("/orders?paymentStatus=paid").catch(() => ({ data: { orders: [] } })),
        API.get("/subscription-orders").catch(() => ({ data: { orders: [] } })),
      ]);

      const wData = workRes.data?.success ? { ...workRes.data } : {};
      const directOrders = ordersRes.data?.orders || [];
      const directSubs = subsRes.data?.orders || [];

      // Guarantee shop orders list is populated
      if (!Array.isArray(wData.assignedShopOrders) || wData.assignedShopOrders.length === 0) {
        wData.assignedShopOrders = directOrders;
      }

      // Guarantee subscription orders list is populated
      if (!Array.isArray(wData.assignedSubscriptionOrders) || wData.assignedSubscriptionOrders.length === 0) {
        wData.assignedSubscriptionOrders = directSubs;
      }

      setWorkData(wData);

      const logs = attRes.data?.attendance || [];
      setAttendanceLogs(logs);
    } catch (err) {
      console.error("Failed to load delivery boy dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkAndAttendance();
    getLiveLocation();
  }, []);

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  // Check today's attendance record
  const todayAttendance = useMemo(() => {
    return attendanceLogs.find((a) => a.date === todayStr) || null;
  }, [attendanceLogs, todayStr]);

  const isOnDuty =
    adminUser?.dutyStatus === "On Duty" || (todayAttendance && !todayAttendance.clockOut);

  // Clock In Action with GPS Geolocation & Resolved Address
  const handleClockIn = async () => {
    try {
      setIsClocking(true);
      const loc = await getLiveLocation();
      const addr = safeAddressText(loc?.address) || safeAddressText(currentAddress) || "Bhubaneswar Logistics Zone";

      const payload = {
        notes: "Marked Present - Shift started on schedule",
        ...(loc && {
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
        }),
        address: addr,
      };

      const res = await API.post("/admin-users/attendance/clock-in", payload);
      if (res.data?.success) {
        showToast(`Marked Present! Shift started at ${addr}`);
        await refreshUser();
        fetchWorkAndAttendance();
      }
    } catch (err) {
      showToast("Error: " + (err.response?.data?.message || "Failed to clock in."));
    } finally {
      setIsClocking(false);
    }
  };

  // Clock Out Action with GPS Geolocation & Resolved Address
  const handleClockOut = async () => {
    try {
      setIsClocking(true);
      const loc = await getLiveLocation();
      const addr = safeAddressText(loc?.address) || safeAddressText(currentAddress) || "Bhubaneswar Return Hub";

      const payload = {
        notes: "Completed delivery shift and returned empty jars",
        ...(loc && {
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
        }),
        address: addr,
      };

      const res = await API.post("/admin-users/attendance/clock-out", payload);
      if (res.data?.success) {
        showToast(`Shift ended! Clocked out at ${addr}`);
        await refreshUser();
        fetchWorkAndAttendance();
      }
    } catch (err) {
      showToast("Error: " + (err.response?.data?.message || "Failed to clock out."));
    } finally {
      setIsClocking(false);
    }
  };

  // Mark task Out for Delivery
  const handleMarkOut = async (taskId, type) => {
    try {
      if (type === "shop") {
        await API.put(`/orders/${taskId}/status`, { orderStatus: "out_for_delivery" });
      } else {
        await API.patch(`/subscription-orders/${taskId}/status`, { status: "Active" });
      }
      showToast("Status updated to Out for Delivery.");
      fetchWorkAndAttendance();
    } catch (err) {
      showToast("Failed to update status.");
    }
  };

  // Open Submit Delivery Modal
  const openSubmit = (task, type) => {
    setSubmitModal({
      isOpen: true,
      taskType: type,
      item: task,
      bottlesDelivered: Number(task.bottlesPerDelivery) || Number(task.items?.length) || 1,
      emptyJarsCollected: Number(task.bottlesPerDelivery) || 1,
      emptyJarReason: "Water jar not finished / still in use",
      deliveryNotes: "",
      proofReceivedBy: task.customerName || task.shippingAddress?.fullName || "",
      isSubmitting: false,
    });
  };

  // Confirm Delivery
  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!submitModal.item) return;

    try {
      setSubmitModal((p) => ({ ...p, isSubmitting: true }));
      const task = submitModal.item;

      if (submitModal.taskType === "subscription") {
        await API.post(`/subscription-orders/${task._id}/record-drop`, {
          bottlesDelivered: submitModal.bottlesDelivered,
          emptyJarsCollected: submitModal.emptyJarsCollected,
          emptyJarReason: submitModal.emptyJarReason,
          deliveredBy: adminUser.name,
          partnerId: adminUser.partnerId,
          notes: submitModal.deliveryNotes,
          proofReceivedBy: submitModal.proofReceivedBy,
        });
      } else {
        await API.post(`/orders/${task._id}/submit-delivery`, {
          deliveredBy: adminUser.name,
          partnerId: adminUser.partnerId,
          emptyJarsCollected: submitModal.emptyJarsCollected,
          emptyJarReason: submitModal.emptyJarReason,
          deliveryNotes: submitModal.deliveryNotes,
          proofReceivedBy: submitModal.proofReceivedBy,
        });
      }

      setSubmitModal({ isOpen: false, item: null, isSubmitting: false });
      showToast("Delivery confirmed and empties recorded.");
      fetchWorkAndAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit delivery confirmation.");
      setSubmitModal((p) => ({ ...p, isSubmitting: false }));
    }
  };

  // Compile unified deliveries list
  const allDeliveries = useMemo(() => {
    const list = [];
    if (!workData) return list;

    // Subscriptions
    (workData.assignedSubscriptionOrders || []).forEach((sub) => {
      const droppedToday = Array.isArray(sub.dailyDrops)
        ? sub.dailyDrops.some(
            (d) =>
              d.status === "Delivered" &&
              new Date(d.dropDate || d.deliveredAt).toISOString().slice(0, 10) === todayStr
          )
        : false;

      const subDate = sub.startDate ? new Date(sub.startDate) : new Date(sub.createdAt);

      list.push({
        _id: sub._id,
        type: "subscription",
        orderNumber: sub.orderNumber,
        customerName: sub.customerName || "Customer",
        phone: sub.customerPhone || "N/A",
        address: `${sub.deliveryAddress?.street ? sub.deliveryAddress.street + ", " : ""}${
          sub.deliveryAddress?.city || "Bhubaneswar"
        }`,
        bottles: Number(sub.bottlesPerDelivery) || 2,
        slot: sub.deliverySlot || "Morning (7 AM - 10 AM)",
        isCompleted: sub.status === "Completed" || droppedToday,
        pendingEmptyJars: Number(sub.pendingEmptyJars) || 0,
        dateObj: subDate,
        dateStr: subDate.toISOString().slice(0, 10),
        monthStr: String(subDate.getMonth() + 1).padStart(2, "0"),
        yearStr: String(subDate.getFullYear()),
        raw: sub,
      });
    });

    // Shop Orders
    (workData.assignedShopOrders || []).forEach((ord) => {
      const isDelivered = (ord.orderStatus || "").toLowerCase() === "delivered";
      const ordDate = ord.createdAt ? new Date(ord.createdAt) : new Date();

      list.push({
        _id: ord._id,
        type: "shop",
        orderNumber: ord.orderNumber,
        customerName: ord.shippingAddress?.fullName || ord.customer || "Customer",
        phone: ord.shippingAddress?.phone || ord.phone || "N/A",
        address: ord.shippingAddress?.addressLine1 || ord.shippingAddress?.address || "Bhubaneswar",
        bottles: ord.items?.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0) || 1,
        slot: ord.deliverySlot || "Standard Dispatch",
        isCompleted: isDelivered,
        pendingEmptyJars: Number(ord.deliveryDetails?.pendingEmptyJars) || 0,
        dateObj: ordDate,
        dateStr: ordDate.toISOString().slice(0, 10),
        monthStr: String(ordDate.getMonth() + 1).padStart(2, "0"),
        yearStr: String(ordDate.getFullYear()),
        raw: ord,
      });
    });

    return list;
  }, [workData, todayStr]);

  // Filter deliveries based on controls
  const filteredDeliveries = useMemo(() => {
    return allDeliveries.filter((item) => {
      // 1. Channel tab
      if (activeTab === "subscription" && item.type !== "subscription") return false;
      if (activeTab === "shop" && item.type !== "shop") return false;

      // 2. Period filter: today, week, month, year, all
      if (periodFilter === "today") {
        if (item.type === "subscription") {
          if (item.raw?.status !== "Active" && item.dateStr !== todayStr) return false;
        } else {
          if (item.isCompleted && item.dateStr !== todayStr) return false;
        }
      } else if (periodFilter === "week") {
        const itemTime = item.dateObj.getTime();
        const nowTime = Date.now();
        const diffDays = (nowTime - itemTime) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < -1) return false;
      } else if (periodFilter === "month") {
        const currMonth = String(new Date().getMonth() + 1).padStart(2, "0");
        const currYear = String(new Date().getFullYear());
        if (item.monthStr !== currMonth || item.yearStr !== currYear) return false;
      } else if (periodFilter === "year") {
        const currYear = String(new Date().getFullYear());
        if (item.yearStr !== currYear) return false;
      }

      // 3. Status filter
      if (statusFilter === "pending" && item.isCompleted) return false;
      if (statusFilter === "delivered" && !item.isCompleted) return false;

      // 4. Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const match =
          item.orderNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    allDeliveries,
    activeTab,
    periodFilter,
    statusFilter,
    search,
    todayStr,
  ]);

  // Attendance Logs: STRICTLY show his Present records only
  const presentAttendanceLogs = useMemo(() => {
    return (attendanceLogs || []).filter((log) => {
      const s = (log.status || "").toLowerCase();
      return (
        s === "present" ||
        s === "on duty" ||
        s === "completed" ||
        Boolean(log.clockIn)
      );
    });
  }, [attendanceLogs]);

  // Total Hours across present attendance
  const totalPresentHours = useMemo(() => {
    return presentAttendanceLogs.reduce((acc, l) => acc + (Number(l.totalHours) || 0), 0);
  }, [presentAttendanceLogs]);

  // Work metrics
  const metrics = useMemo(() => {
    const total = filteredDeliveries.length;
    const delivered = filteredDeliveries.filter((d) => d.isCompleted).length;
    const pending = total - delivered;
    const emptiesDue = filteredDeliveries.reduce((sum, d) => sum + d.pendingEmptyJars, 0);

    const subCount = allDeliveries.filter((d) => d.type === "subscription").length;
    const shopCount = allDeliveries.filter((d) => d.type === "shop").length;

    return { total, delivered, pending, emptiesDue, subCount, shopCount };
  }, [filteredDeliveries, allDeliveries]);

  const partner = workData?.deliveryPartner || {
    name: adminUser?.name || "Delivery Partner",
    partnerId: adminUser?.partnerId || "ALK-DB-001",
    phone: adminUser?.phone || "N/A",
    route: "Central Bhubaneswar",
    vehicleType: "Electric Van",
    vehicleNumber: "OD-02-AK-2026",
  };

  return (
    <div className="RiderDash">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="RiderDash-toast">
          <FiCheckCircle /> <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Profile & Live Geolocation Attendance Hero Bar (Only on Dashboard Page) */}
      {activeTab === "all" && (
        <div className="RiderDash-heroBar">
          {/* LEFT DESIGN: Rider Identity & Fleet Details */}
          <div className="RiderDash-heroLeft">
            <div className="RiderDash-avatarWrap">
              <div className="RiderDash-avatar">
                {adminUser?.avatar ? (
                  <img src={adminUser.avatar} alt="Profile" />
                ) : (
                  (partner.name || "D").charAt(0).toUpperCase()
                )}
              </div>
              <span className={`RiderDash-avatarDot ${isOnDuty ? "online" : "offline"}`}></span>
            </div>

            <div className="RiderDash-profileInfo">
              <div className="RiderDash-badgeRow">
                <span className="RiderDash-partnerIdBadge">{partner.partnerId}</span>
                <span className={`RiderDash-dutyBadge ${isOnDuty ? "onDuty" : "offDuty"}`}>
                  <span className="dot"></span>
                  {isOnDuty ? "On Duty • Present" : "Off Duty / Standby"}
                </span>
              </div>

              <h2 className="RiderDash-riderName">{partner.name}</h2>

              <div className="RiderDash-metaTags">
                <span className="metaItem" title="Assigned Delivery Zone">
                  <FiCompass /> {partner.route}
                </span>
                <span className="metaItem" title="Assigned Fleet Vehicle">
                  <FiTruck /> {partner.vehicleType} ({partner.vehicleNumber})
                </span>
                <a href={`tel:${partner.phone}`} className="metaItem phoneLink" title="Direct Contact">
                  <FiPhone /> {partner.phone}
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT DESIGN: Shift Attendance & Live Location */}
          <div className="RiderDash-heroRight">
            <div className="RiderDash-gpsCommandCard">
              <div className="RiderDash-commandTop">
                <div className="RiderDash-shiftMeta">
                  <span className="RiderDash-dateTxt">{formattedToday}</span>
                  <span className="RiderDash-metaDot">•</span>
                  <div className={`RiderDash-shiftStatus ${isOnDuty ? "onDuty" : "offDuty"}`}>
                    <span className="statusDot"></span>
                    <span>
                      {todayAttendance?.clockIn
                        ? `Shift Active • Started ${new Date(todayAttendance.clockIn).toLocaleTimeString(
                            "en-IN",
                            { hour: "2-digit", minute: "2-digit" }
                          )}`
                        : "Shift Standby • Not Checked In"}
                    </span>
                  </div>
                </div>

                <div className="RiderDash-btnWrap">
                  {!isOnDuty ? (
                    <button
                      type="button"
                      className="RiderDash-shiftBtn in"
                      onClick={handleClockIn}
                      disabled={isClocking}
                    >
                      <FiNavigation />
                      <span>{isClocking ? "Checking In..." : "Check In (Start Shift)"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="RiderDash-shiftBtn out"
                      onClick={handleClockOut}
                      disabled={isClocking}
                    >
                      <FiCheckCircle />
                      <span>{isClocking ? "Checking Out..." : "Check Out (End Shift)"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Swiggy & Flipkart Style Clean Accurate Location Box */}
              <div className="RiderDash-locationCard">
                <div className="locationIconWrap">
                  <FiMapPin />
                </div>
                <div className="locationDetails">
                  <div className="locationPrimaryRow">
                    <span className="locationTag">Current Location</span>
                    {safeAddressText(currentPrimaryArea) && (
                      <span className="locationAreaBadge">{safeAddressText(currentPrimaryArea)}</span>
                    )}
                  </div>
                  <strong className="locationAddress">
                    {safeAddressText(currentAddress) ||
                      (isResolvingAddress
                        ? "Detecting live GPS street address..."
                        : "Bhubaneswar Logistics Zone")}
                  </strong>
                </div>
                <button
                  type="button"
                  className="locationRefreshBtn"
                  onClick={getLiveLocation}
                  disabled={isResolvingAddress}
                  title="Recalibrate and refresh live GPS address"
                >
                  <FiRefreshCw className={isResolvingAddress ? "spin" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Work Metric Cards */}
      <div className="RiderDash-kpiGrid">
        <div className="RiderDash-kpiCard">
          <div className="iconWrap total">
            <FiPackage />
          </div>
          <div>
            <span className="kpiLabel">Assigned Deliveries</span>
            <strong className="kpiVal">{metrics.total}</strong>
          </div>
        </div>

        <div className="RiderDash-kpiCard">
          <div className="iconWrap pending">
            <FiClock />
          </div>
          <div>
            <span className="kpiLabel">Pending Drops</span>
            <strong className="kpiVal">{metrics.pending}</strong>
          </div>
        </div>

        <div className="RiderDash-kpiCard">
          <div className="iconWrap delivered">
            <FiCheckCircle />
          </div>
          <div>
            <span className="kpiLabel">Delivered Successfully</span>
            <strong className="kpiVal">{metrics.delivered}</strong>
          </div>
        </div>

        <div className="RiderDash-kpiCard">
          <div className="iconWrap empties">
            <FiAlertTriangle />
          </div>
          <div>
            <span className="kpiLabel">Empty Cans Due</span>
            <strong className="kpiVal">{metrics.emptiesDue} Cans</strong>
          </div>
        </div>
      </div>

      {/* Modern Filter Command Bar (Clean 2-Row Unified Hub) */}
      <div className="RiderDash-filterBar">
        {/* Row 1: Search Box & Calendar Scope & Reset */}
        <div className="RiderDash-filterRow1">
          <div className="RiderDash-searchWrap">
            <FiSearch className="searchIcon" />
            <input
              type="text"
              placeholder="Search customer, mobile, order #, street..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="RiderDash-searchInput"
            />
            {search && (
              <button
                type="button"
                className="clearBtn"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Segmented Period Tabs: Today (Default), Week, Month, Year, All */}
          <div className="RiderDash-periodTabs">
            <button
              type="button"
              className={`RiderDash-periodTab ${periodFilter === "today" ? "active" : ""}`}
              onClick={() => setPeriodFilter("today")}
            >
              Today
            </button>
            <button
              type="button"
              className={`RiderDash-periodTab ${periodFilter === "week" ? "active" : ""}`}
              onClick={() => setPeriodFilter("week")}
            >
              Week
            </button>
            <button
              type="button"
              className={`RiderDash-periodTab ${periodFilter === "month" ? "active" : ""}`}
              onClick={() => setPeriodFilter("month")}
            >
              Month
            </button>
            <button
              type="button"
              className={`RiderDash-periodTab ${periodFilter === "year" ? "active" : ""}`}
              onClick={() => setPeriodFilter("year")}
            >
              Year
            </button>
            <button
              type="button"
              className={`RiderDash-periodTab ${periodFilter === "all" ? "active" : ""}`}
              onClick={() => setPeriodFilter("all")}
            >
              All
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="RiderDash-resetBtn"
              onClick={resetAllFilters}
              title="Reset all filters"
            >
              <FiRotateCcw /> <span>Reset</span>
            </button>
          )}
        </div>

        {/* Row 2: Channel Segmented Pills (Left) & Status Segmented Pills (Right) */}
        <div className="RiderDash-filterRow2">
          {pageType === "dashboard" ? (
            /* Multi-channel Switcher ONLY on the Main Delivery Dashboard */
            <div className="RiderDash-pillGroup channelGroup">
              <button
                type="button"
                className={`RiderDash-pill ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                <span>All Work</span>
                <span className="pillCount">{allDeliveries.length}</span>
              </button>
              <button
                type="button"
                className={`RiderDash-pill sub ${activeTab === "subscription" ? "active" : ""}`}
                onClick={() => setActiveTab("subscription")}
              >
                <FiDroplet className="pillIcon sub" />
                <span>Subscriptions</span>
                <span className="pillCount">{metrics.subCount}</span>
              </button>
              <button
                type="button"
                className={`RiderDash-pill shop ${activeTab === "shop" ? "active" : ""}`}
                onClick={() => setActiveTab("shop")}
              >
                <FiShoppingCart className="pillIcon shop" />
                <span>Shop Orders</span>
                <span className="pillCount">{metrics.shopCount}</span>
              </button>
              <button
                type="button"
                className={`RiderDash-pill att ${activeTab === "attendance" ? "active" : ""}`}
                onClick={() => setActiveTab("attendance")}
              >
                <FiActivity className="pillIcon att" />
                <span>Attendance</span>
                <span className="pillCount">{presentAttendanceLogs.length}</span>
              </button>
            </div>
          ) : (
            /* Dedicated Page Scope Badge (Shows only this specific page's identity) */
            <div className="RiderDash-dedicatedScope">
              {pageType === "shop" && (
                <div className="RiderDash-pageScopeBadge shop">
                  <FiShoppingCart className="scopeIcon" />
                  <span>Retail Shop Orders</span>
                  <span className="pillCount">{metrics.shopCount}</span>
                </div>
              )}
              {pageType === "subscription" && (
                <div className="RiderDash-pageScopeBadge sub">
                  <FiDroplet className="scopeIcon" />
                  <span>Subscription Daily Drops</span>
                  <span className="pillCount">{metrics.subCount}</span>
                </div>
              )}
              {pageType === "attendance" && (
                <div className="RiderDash-pageScopeBadge att">
                  <FiActivity className="scopeIcon" />
                  <span>Attendance</span>
                  <span className="pillCount">{presentAttendanceLogs.length} Days</span>
                </div>
              )}
            </div>
          )}

          {/* Right: Status Switch (Only shown when not on Attendance tab) */}
          {activeTab !== "attendance" && (
            <div className="RiderDash-pillGroup statusGroup">
              <button
                type="button"
                className={`RiderDash-pill statusPill ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All Status
              </button>
              <button
                type="button"
                className={`RiderDash-pill statusPill pending ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                <FiClock className="pillIcon" />
                <span>Pending</span>
                <span className="pillCount">{metrics.pending}</span>
              </button>
              <button
                type="button"
                className={`RiderDash-pill statusPill delivered ${statusFilter === "delivered" ? "active" : ""}`}
                onClick={() => setStatusFilter("delivered")}
              >
                <FiCheckCircle className="pillIcon" />
                <span>Delivered</span>
                <span className="pillCount">{metrics.delivered}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Tasks List or Attendance */}
      {activeTab === "attendance" ? (
        /* ATTENDANCE VIEW (ONLY SHOWS HIS PRESENT RECORDS) */
        <div className="RiderDash-panelCard">
          <div className="RiderDash-panelHead">
            <div>
              <h3>My Attendance Records (Present Days Only)</h3>
              <p>
                Showing verified attendance shifts and completed work hours
              </p>
            </div>
            <button type="button" className="RiderDash-refreshBtn" onClick={fetchWorkAndAttendance}>
              <FiRefreshCw className={isLoading ? "spin" : ""} /> Refresh Logs
            </button>
          </div>

          {/* Attendance KPI Highlights */}
          <div className="RiderDash-attKpiStrip">
            <div className="RiderDash-attKpi">
              <span className="label">Total Shifts Marked Present</span>
              <strong className="val">{presentAttendanceLogs.length} Days</strong>
            </div>
            <div className="RiderDash-attKpi">
              <span className="label">Total Duty Hours Logged</span>
              <strong className="val">{Math.round(totalPresentHours * 10) / 10} Hours</strong>
            </div>
            <div className="RiderDash-attKpi">
              <span className="label">GPS Geolocation Status</span>
              <strong className="val success">
                <FiCheckCircle /> 100% Geotagged
              </strong>
            </div>
          </div>

          <div className="RiderDash-attendanceTableWrap">
            <table className="RiderDash-table">
              <thead>
                <tr>
                  <th>Shift Date</th>
                  <th>Clock In &amp; Location Address</th>
                  <th>Clock Out &amp; Location Address</th>
                  <th>Duty Hours</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {presentAttendanceLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", color: "#94a3b8", padding: "36px" }}
                    >
                      <FiCheckCircle size={32} style={{ color: "#10b981", marginBottom: "8px" }} />
                      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "15px" }}>
                        No Present attendance records logged yet
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                        Use the <strong>Check In (Start Shift)</strong> button above to record your attendance for today.
                      </p>
                    </td>
                  </tr>
                ) : (
                  presentAttendanceLogs.map((log) => {
                    const inAddress =
                      safeAddressText(log.clockInLocation?.address, "Alka Drops Hub, Bhubaneswar");
                    const outAddress =
                      safeAddressText(log.clockOutLocation?.address, log.clockOut ? "Bhubaneswar Return Hub" : "In Progress");

                    return (
                      <tr key={log._id || log.date}>
                        <td>
                          <div className="RiderDash-tblDate">
                            <strong>{log.date}</strong>
                            <small>
                              {new Date(log.date).toLocaleDateString("en-IN", {
                                weekday: "short",
                              })}
                            </small>
                          </div>
                        </td>

                        {/* Clock In Time & Address Only */}
                        <td>
                          <div className="RiderDash-tblGeoCell">
                            <span className="timeText in">
                              {log.clockIn
                                ? new Date(log.clockIn).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </span>
                            <div className="addressLine" title={inAddress}>
                              <FiMapPin className="pin" />
                              <span>{inAddress}</span>
                            </div>
                          </div>
                        </td>

                        {/* Clock Out Time & Address Only */}
                        <td>
                          <div className="RiderDash-tblGeoCell">
                            <span className="timeText out">
                              {log.clockOut
                                ? new Date(log.clockOut).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Shift In Progress"}
                            </span>
                            {log.clockOut && (
                              <div className="addressLine" title={outAddress}>
                                <FiMapPin className="pin" />
                                <span>{outAddress}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Total Hours */}
                        <td>
                          <strong className="RiderDash-tblHours">{log.totalHours || 0} hrs</strong>
                        </td>

                        {/* Status (Strictly Present) */}
                        <td>
                          <span className="RiderDash-attBadge present">
                            <FiCheckCircle /> Present
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DELIVERIES LIST (SUBSCRIPTIONS & SHOP ORDERS) */
        <div className="RiderDash-panelCard">
          <div className="RiderDash-panelHead">
            <div>
              <h3>
                {activeTab === "subscription"
                  ? "Assigned Subscription Daily Drops"
                  : activeTab === "shop"
                  ? "Assigned Shop Retail Orders"
                  : "All Assigned Deliveries & Drops"}
              </h3>
              <p>
                Showing {filteredDeliveries.length} tasks scheduled for {partner.route.split("-")[0]}
              </p>
            </div>
          </div>

          <div className="RiderDash-deliveriesGrid">
            {filteredDeliveries.length === 0 ? (
              <div className="RiderDash-empty">
                <FiCheckCircle size={40} color="#10b981" />
                <h4>No deliveries matching the selected filter</h4>
                <p>Try changing the month, year, or period filter above.</p>
              </div>
            ) : (
              filteredDeliveries.map((task) => (
                <div
                  key={task._id}
                  className={`RiderDash-deliveryCard ${task.isCompleted ? "completed" : ""}`}
                >
                  <div className="RiderDash-cardTop">
                    <div className="tagRow">
                      <span className={`typeTag ${task.type}`}>
                        {task.type === "subscription" ? "Subscription Drop" : "Retail Shop Order"}
                      </span>
                      <span className="orderCode">#{task.orderNumber}</span>
                    </div>

                    <span className="slotTag">
                      <FiClock /> {task.slot.split("(")[0].trim()}
                    </span>
                  </div>

                  <div className="RiderDash-custInfo">
                    <strong className="custName">{task.customerName}</strong>
                    <a href={`tel:${task.phone}`} className="phoneBtn" title="Direct call customer">
                      <FiPhone /> {task.phone}
                    </a>
                  </div>

                  <div className="RiderDash-addressBox">
                    <FiMapPin className="pin" />
                    <span>{task.address}</span>
                  </div>

                  {/* Volume & Empties Status Banner */}
                  <div className="RiderDash-volumeBox">
                    <span className="volLabel">
                      Drop Volume: <strong>{task.bottles} × 20L Can(s)</strong>
                    </span>
                    {task.pendingEmptyJars > 0 ? (
                      <span className="warnEmpties">
                        <FiAlertTriangle /> {task.pendingEmptyJars} Empties Due
                      </span>
                    ) : (
                      <span className="okEmpties">
                        <FiCheck /> 0 Empties Due
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="RiderDash-cardActions">
                    {task.isCompleted ? (
                      <div className="RiderDash-doneStamp">
                        <FiCheckCircle /> Delivered &amp; Synchronized
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="RiderDash-btn transit"
                          onClick={() => handleMarkOut(task._id, task.type)}
                        >
                          <FiTruck /> Out for Delivery
                        </button>
                        <button
                          type="button"
                          className="RiderDash-btn deliver"
                          onClick={() => openSubmit(task.raw, task.type)}
                        >
                          <FiCheckCircle /> Submit Delivered
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Submit Delivered Modal */}
      {submitModal.isOpen && submitModal.item && (
        <div
          className="RiderDash-modalOverlay"
          onClick={() => setSubmitModal((p) => ({ ...p, isOpen: false }))}
        >
          <div className="RiderDash-modalDialog" onClick={(e) => e.stopPropagation()}>
            <div className="RiderDash-modalHead">
              <h3>Submit Delivery Drop Confirmation</h3>
              <button
                type="button"
                className="RiderDash-closeModal"
                onClick={() => setSubmitModal((p) => ({ ...p, isOpen: false }))}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="RiderDash-modalBody">
              <div className="RiderDash-modalInputs">
                <div className="RiderDash-modalField">
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
                </div>

                <div className="RiderDash-modalField">
                  <label>Empty Jars Collected Back:</label>
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
                </div>
              </div>

              {submitModal.emptyJarsCollected < submitModal.bottlesDelivered && (
                <div className="RiderDash-jarNotice">
                  <div className="warnHead">
                    <FiAlertCircle /> Customer returning 0 or partial empty jars
                  </div>
                  <p>
                    Unreturned empty balance will be recorded automatically on the customer's account for collection in next drop.
                  </p>
                  <label>Reason for Not Collecting Empty Jar:</label>
                  <select
                    value={submitModal.emptyJarReason}
                    onChange={(e) =>
                      setSubmitModal((p) => ({ ...p, emptyJarReason: e.target.value }))
                    }
                  >
                    <option value="Water jar not finished / still in use">Water jar not finished / still in use</option>
                    <option value="Customer promised return in next drop">Customer promised return in next drop</option>
                    <option value="Customer not at home / Left with security">Customer not at home / Left with security</option>
                    <option value="First delivery / New customer">First delivery / New customer</option>
                  </select>
                </div>
              )}

              <div className="RiderDash-modalField">
                <label>Handed Over To (Customer / Security):</label>
                <input
                  type="text"
                  placeholder="e.g. Saroj Mallik / Security Guard"
                  value={submitModal.proofReceivedBy}
                  onChange={(e) =>
                    setSubmitModal((p) => ({ ...p, proofReceivedBy: e.target.value }))
                  }
                />
              </div>

              <div className="RiderDash-modalField">
                <label>Delivery Confirmation Notes:</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Fresh jars placed at doorstep, empty jars safely loaded in vehicle."
                  value={submitModal.deliveryNotes}
                  onChange={(e) =>
                    setSubmitModal((p) => ({ ...p, deliveryNotes: e.target.value }))
                  }
                />
              </div>

              <div className="RiderDash-modalActions">
                <button
                  type="button"
                  className="RiderDash-btn cancel"
                  onClick={() => setSubmitModal((p) => ({ ...p, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="RiderDash-btn deliver"
                  disabled={submitModal.isSubmitting}
                >
                  {submitModal.isSubmitting ? "Recording Drop..." : "Confirm & Complete Drop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyDashboard;
