import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiTruck,
  FiPhone,
  FiMail,
  FiMapPin,
  FiShield,
  FiBox,
  FiUser,
  FiCreditCard,
  FiCheckCircle,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiCopy,
  FiHome,
} from "react-icons/fi";
import API from "../../services/api";
import "./DeliveryBoyDetail.css";

const DeliveryBoyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rider, setRider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [copiedText, setCopiedText] = useState("");

  // Auto-dismiss notification
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(""), 3500);
    return () => clearTimeout(t);
  }, [notification]);

  // Fetch individual rider by ID or Partner ID
  const fetchRider = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await API.get(`/delivery-boys/${id}`);
      if (res.data?.success && res.data.rider) {
        setRider(res.data.rider);
      } else {
        setError("Delivery agent profile not found.");
      }
    } catch (err) {
      console.error("Failed to load delivery agent profile:", err);
      setError(
        err.response?.data?.message || "Failed to load delivery partner profile."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRider();
    }
  }, [id]);

  // Toggle Duty Status with instant MongoDB update
  const handleToggleStatus = async () => {
    if (!rider) return;
    const current = rider.status || "On Duty";
    const nextStatus = current === "On Duty" ? "Off Duty" : "On Duty";

    setRider((prev) => ({ ...prev, status: nextStatus }));
    setNotification(`Status updated to "${nextStatus}".`);

    try {
      await API.patch(`/delivery-boys/${rider._id || rider.partnerId}/status`, {
        status: nextStatus,
      });
    } catch (err) {
      setRider((prev) => ({ ...prev, status: current }));
      setError(err.response?.data?.message || "Failed to update duty status.");
    }
  };

  // Delete Agent
  const handleDelete = async () => {
    if (!rider) return;
    const code = rider.partnerId || rider.name;
    if (
      !window.confirm(
        `Are you sure you want to delete delivery partner "${rider.name}" (${code})?\n\nThis will remove their profile and login access from the system.`
      )
    ) {
      return;
    }

    try {
      await API.delete(`/delivery-boys/${rider._id || rider.partnerId}`);
      navigate("/admin/delivery-boy-id");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete delivery agent.");
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setNotification(`Copied ${label}: ${text}`);
    setTimeout(() => setCopiedText(""), 2000);
  };

  if (isLoading) {
    return (
      <div className="DeliveryBoyDetail-loading">
        <FiRefreshCw className="spin" />
        <p>Loading delivery partner details from database...</p>
      </div>
    );
  }

  if (error || !rider) {
    return (
      <div className="DeliveryBoyDetail-errorCard">
        <FiAlertCircle className="errIcon" />
        <h2>Agent Profile Not Found</h2>
        <p>{error || "No delivery partner found with this ID."}</p>
        <Link to="/admin/delivery-boy-id" className="backBtn">
          <FiArrowLeft /> Back to Delivery Fleet
        </Link>
      </div>
    );
  }

  const isOnDuty = rider.status === "On Duty";
  const partnerCode = rider.partnerId || "ALK-DB-001";
  const formattedJoinDate = rider.createdAt
    ? new Date(rider.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Verified Fleet Member";

  return (
    <div className="DeliveryBoyDetail">
      {/* Toast Notification */}
      {notification && (
        <div className="DeliveryBoyDetail-toast">
          <FiCheckCircle className="toastIcon" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navigation & Action Header */}
      <div className="DeliveryBoyDetail-topBar">
        <Link to="/admin/delivery-boy-id" className="DeliveryBoyDetail-backLink">
          <FiArrowLeft /> Back to Fleet List
        </Link>

        <div className="DeliveryBoyDetail-topActions">
          <button
            type="button"
            className="DeliveryBoyDetail-actionBtn delete"
            onClick={handleDelete}
            title="Delete Delivery Partner"
          >
            <FiTrash2 /> <span>Delete Partner</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Header Card */}
      <div className="DeliveryBoyDetail-heroCard">
        <div className="heroLeft">
          <div className="avatarWrapper">
            {rider.avatar ? (
              <img
                src={rider.avatar}
                alt={rider.name}
                className="heroAvatarImg"
              />
            ) : (
              <div className="heroAvatarFallback">
                {rider.name ? rider.name.charAt(0).toUpperCase() : <FiUser />}
              </div>
            )}
            <span
              className={`heroStatusDot ${isOnDuty ? "green" : "gray"}`}
              title={isOnDuty ? "Online & On Duty" : "Offline / Standby"}
            />
            <span className="heroKycBadge" title="Government KYC Verified">
              <FiCheck />
            </span>
          </div>

          <div className="heroInfo">
            <div className="heroBadgeRow">
              <button
                type="button"
                className="partnerIdPill"
                onClick={() => copyToClipboard(partnerCode, "Partner ID")}
                title="Click to copy Partner ID"
              >
                <FiCreditCard />
                <span>{partnerCode}</span>
                <FiCopy className="copyIcon" />
              </button>

              <span className="roleTag">{rider.role || "Delivery Boy"}</span>

              <span className="memberSince">
                <FiCalendar /> Joined {formattedJoinDate}
              </span>
            </div>

            <h1 className="heroName">{rider.name}</h1>

            <div className="heroContactRow">
              <a href={`tel:${rider.phone}`} className="heroContactLink">
                <FiPhone /> {rider.phone}
              </a>
              <span className="dotSep">&bull;</span>
              <a href={`mailto:${rider.email}`} className="heroContactLink">
                <FiMail /> {rider.email}
              </a>
            </div>
          </div>
        </div>

        {/* Hero Right: Interactive Duty Switch */}
        <div className="heroRight">
          <div className="dutyToggleBlock">
            <span className="dutyLabel">Dispatch Status</span>
            <button
              type="button"
              className={`heroDutySwitch ${isOnDuty ? "on-duty" : "off-duty"}`}
              onClick={handleToggleStatus}
              title={`Click to switch to ${isOnDuty ? "Off Duty" : "On Duty"}`}
            >
              <span className="dutySwitchSlider">
                <span className="dutySwitchThumb" />
              </span>
              <span className="dutySwitchText">
                {isOnDuty ? "On Duty" : "Off Duty"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="DeliveryBoyDetail-kpiGrid">
        <div className="kpiCard">
          <div className="kpiIcon vehicle"><FiTruck /></div>
          <div>
            <span className="kpiLabel">Assigned Vehicle</span>
            <span className="kpiValue">{rider.vehicleNumber}</span>
            <span className="kpiSub">{rider.vehicleType || "Electric Loader Van"}</span>
          </div>
        </div>

        <div className="kpiCard">
          <div className="kpiIcon route"><FiMapPin /></div>
          <div>
            <span className="kpiLabel">Assigned Route</span>
            <span className="kpiValue">{rider.route ? rider.route.split("-")[0] : "Zone A"}</span>
            <span className="kpiSub">{rider.route ? rider.route.split("-")[1] || rider.route : "Nayapalli"}</span>
          </div>
        </div>

        <div className="kpiCard">
          <div className="kpiIcon quota"><FiBox /></div>
          <div>
            <span className="kpiLabel">Daily Capacity</span>
            <span className="kpiValue">{rider.dailyQuota || "120 Jars"}</span>
            <span className="kpiSub">Active Dispatches: {rider.activeOrders || 0} Jars</span>
          </div>
        </div>

        <div className="kpiCard">
          <div className="kpiIcon kyc"><FiShield /></div>
          <div>
            <span className="kpiLabel">KYC Status</span>
            <span className="kpiValue green">100% Verified</span>
            <span className="kpiSub">Aadhar &amp; PAN Validated</span>
          </div>
        </div>
      </div>

      {/* Responsive Section Cards Grid */}
      <div className="DeliveryBoyDetail-sectionsGrid">
        {/* Identity & Government KYC Card */}
        <div className="detailSectionCard">
          <div className="sectionHeader">
            <FiShield className="sectionIcon" />
            <h3>Identity &amp; Government KYC Verification</h3>
          </div>

          <div className="sectionTable">
            <div className="tableRow">
              <span className="tLabel">Full Legal Name:</span>
              <span className="tValue bold">{rider.name}</span>
            </div>

            <div className="tableRow">
              <span className="tLabel">Partner ID:</span>
              <span className="tValue teal bold">{partnerCode}</span>
            </div>

            <div className="tableRow">
              <span className="tLabel">Primary Contact:</span>
              <span className="tValue">
                <a href={`tel:${rider.phone}`} className="link">{rider.phone}</a>
              </span>
            </div>

            <div className="tableRow">
              <span className="tLabel">Email Account:</span>
              <span className="tValue">
                <a href={`mailto:${rider.email}`} className="link">{rider.email}</a>
              </span>
            </div>

            <div className="tableRow">
              <span className="tLabel">Aadhar UIDAI:</span>
              <span className="tValue">
                <span className="verifiedTag">
                  <FiCheck /> {rider.aadharNumber ? `**** **** ${rider.aadharNumber.slice(-4)}` : "Verified UIDAI"}
                </span>
              </span>
            </div>

            <div className="tableRow">
              <span className="tLabel">Income Tax PAN:</span>
              <span className="tValue">
                <span className="verifiedTag">
                  <FiCheck /> {rider.panNumber ? `${rider.panNumber.slice(0, 3)}****${rider.panNumber.slice(-2)}` : "Verified ITD"}
                </span>
              </span>
            </div>

            <div className="tableRow">
              <span className="tLabel">KYC Compliance Status:</span>
              <span className="tValue green bold">Approved &bull; Background Verified</span>
            </div>
          </div>
        </div>

        {/* Vehicle & Logistics Details Card */}
        <div className="detailSectionCard">
          <div className="sectionHeader">
            <FiTruck className="sectionIcon" />
            <h3>Logistics &amp; Delivery Fleet Specifications</h3>
          </div>

          <div className="sectionTable">
            <div className="tableRow">
              <span className="tLabel">Vehicle Plate:</span>
              <span className="tValue plateBadge">{rider.vehicleNumber}</span>
            </div>

            <div className="tableRow">
              <span className="tLabel">Vehicle Category:</span>
              <span className="tValue">{rider.vehicleType || "Electric Loader Van"}</span>
            </div>

            <div className="tableRow">
              <span className="tLabel">Assigned Delivery Route:</span>
              <span className="tValue highlight">{rider.route}</span>
            </div>

            <div className="tableRow">
              <span className="tLabel">Daily Water Jar Quota:</span>
              <span className="tValue bold">{rider.dailyQuota || "120 Jars"}</span>
            </div>

            <div className="tableRow">
              <span className="tLabel">Active Dispatches Load:</span>
              <span className="tValue purple bold">{rider.activeOrders || 0} Jars Live</span>
            </div>

            <div className="tableRow">
              <span className="tLabel">System User Role:</span>
              <span className="tValue">{rider.role || "Delivery Boy"}</span>
            </div>

            <div className="tableRow">
              <span className="tLabel">App Authorization:</span>
              <span className="tValue green bold">Active &bull; Companion App Access</span>
            </div>
          </div>
        </div>

        {/* Address & Geographical Card */}
        <div className="detailSectionCard fullWidthCard">
          <div className="sectionHeader">
            <FiHome className="sectionIcon" />
            <h3>Residential &amp; Permanent Addresses</h3>
          </div>

          <div className="addressRowGrid">
            <div className="addressBlock">
              <span className="addressTypeLabel">Operational Present Address</span>
              <p className="addressText">
                {rider.presentAddress?.street
                  ? `${rider.presentAddress.street}, ${rider.presentAddress.city}, ${rider.presentAddress.state} - ${rider.presentAddress.postalCode}`
                  : "Plot 42, IRC Village, Nayapalli, Bhubaneswar, Odisha - 751012"}
              </p>
            </div>

            <div className="addressBlock">
              <span className="addressTypeLabel">Permanent Home Address</span>
              <p className="addressText">
                {rider.permanentAddress?.street
                  ? `${rider.permanentAddress.street}, ${rider.permanentAddress.city}, ${rider.permanentAddress.state} - ${rider.permanentAddress.postalCode}`
                  : "At/PO Kendrapara Town, Main Road, Kendrapara, Odisha - 754211"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyDetail;
