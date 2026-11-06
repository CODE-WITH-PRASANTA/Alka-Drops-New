import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  FaCheckCircle,
  FaWater,
  FaTruck,
  FaRecycle,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaShieldAlt,
} from "react-icons/fa";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiTruck,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiAlertCircle,
  FiPackage,
  FiRefreshCw,
  FiDollarSign,
} from "react-icons/fi";

import "./SubscriptionOne.css";

const businessNAP = {
  name: "Alka Drops",
  phone: "+917327092477",
  displayPhone: "+91 7327092477",
  address: {
    street: "Plot-N5/22, Main Street, Block N5, IRC Village, Nayapalli",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
    country: "India",
  },
};

const subscriptionPlans = [
  {
    id: "basic",
    title: "Basic Plan",
    subtitle: "*Home & Small Families",
    price: "1,499",
    period: "MO",
    description:
      "Ideal 20 litre water supply home delivery package designed for small households in Bhubaneswar.",
    features: [
      { text: "Free Doorstep Delivery", icon: <FaTruck /> },
      { text: "Max 10 Bottles / Month (20L)", icon: <FaWater /> },
      { text: "Empty Bottle Pickup", icon: <FaRecycle /> },
      { text: "Max 120 Bottles / Year", icon: <FaWater /> },
      { text: "Mineral Wellness Water", icon: <FaCheckCircle /> },
    ],
    featured: false,
  },
  {
    id: "premium",
    title: "Premium Plan",
    subtitle: "*BEST VALUE ANNUAL SUBSCRIPTION",
    price: "2,999",
    period: "YR",
    description:
      "Premium mineral water supply with enriched alkalinity and essential minerals for total wellness.",
    features: [
      { text: "Free Express Delivery", icon: <FaTruck /> },
      { text: "Max 10 Bottles / Month (20L)", icon: <FaWater /> },
      { text: "Empty Bottle Pickup", icon: <FaRecycle /> },
      { text: "Max 120 Bottles / Year", icon: <FaWater /> },
      { text: "Mineral Wellness Water", icon: <FaCheckCircle /> },
    ],
    featured: true,
  },
  {
    id: "advanced",
    title: "Advanced Plan",
    subtitle: "*Workplaces, Gyms & Studios",
    price: "2,199",
    period: "MO",
    description:
      "High-demand drinking water supply for corporate offices, gyms, and commercial centers across Bhubaneswar.",
    features: [
      { text: "Priority Free Delivery", icon: <FaTruck /> },
      { text: "Max 15 Bottles / Month (20L)", icon: <FaWater /> },
      { text: "Empty Bottle Pickup", icon: <FaRecycle /> },
      { text: "Flexible Bottle Replacements", icon: <FaRecycle /> },
      { text: "Certified Pure Mineral Water", icon: <FaCheckCircle /> },
    ],
    featured: false,
  },
];

const getFeatureIcon = (text = "") => {
  const lower = text.toLowerCase();
  if (lower.includes("delivery") || lower.includes("express") || lower.includes("truck")) return <FaTruck />;
  if (lower.includes("pickup") || lower.includes("recycle") || lower.includes("replacement")) return <FaRecycle />;
  if (lower.includes("bottle") || lower.includes("water") || lower.includes("can")) return <FaWater />;
  return <FaCheckCircle />;
};

const SubscriptionOne = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(subscriptionPlans);
  const [flippedCards, setFlippedCards] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Form State
  const [subForm, setSubForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
    startDate: "",
    endDate: "",
    deliveryFrequency: "Alternate Days",
    deliverySlot: "Morning (7 AM - 10 AM)",
    bottlesPerDelivery: 2,
    paymentMethod: "cod",
    notes: "",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await API.get("/subscription-plans");
        if (res.data?.plans && res.data.plans.length > 0) {
          const formatted = res.data.plans
            .filter((p) => p.status !== "Inactive")
            .map((p) => ({
              id: p._id,
              title: p.title,
              subtitle: p.subtitle,
              price: p.price,
              period: p.period || "MO",
              description: p.description,
              featured: Boolean(p.featured),
              features: (p.features || []).map((feat) => {
                if (typeof feat === "string") {
                  return { text: feat, icon: getFeatureIcon(feat) };
                }
                return feat;
              }),
            }));
          setPlans(formatted);
        }
      } catch (err) {
        console.error("Failed to load subscription plans:", err);
      }
    };

    fetchPlans();
  }, []);

  const toggleCardFlip = (id, featured) => {
    if (featured) return;
    setFlippedCards((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const handleCardKeyDown = (event, id, featured) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCardFlip(id, featured);
    }
  };

  // Date calculation helpers
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const getCalculatedEndDate = (startDateStr, period = "MO") => {
    if (!startDateStr) return "";
    const d = new Date(startDateStr);
    const p = String(period).toUpperCase();
    if (p === "YR" || p === "YEAR") {
      d.setFullYear(d.getFullYear() + 1);
    } else if (p === "WK" || p === "WEEK") {
      d.setDate(d.getDate() + 7);
    } else {
      // 1 Month default
      d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString().split("T")[0];
  };

  const calculateDaysDuration = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  const handleOpenSubscriptionModal = (plan) => {
    setSelectedPlan(plan);
    setConfirmedOrder(null);
    setErrorMessage("");

    let user = null;
    try {
      const saved = localStorage.getItem("alka_user");
      if (saved) user = JSON.parse(saved);
    } catch {}

    const tomorrow = getTomorrowDate();
    const calculatedEnd = getCalculatedEndDate(tomorrow, plan.period);

    setSubForm({
      customerName: user?.name || "",
      customerEmail: user?.email || "",
      customerPhone: user?.phone || "",
      street: user?.address?.street || "",
      city: user?.address?.city || "Bhubaneswar",
      state: user?.address?.state || "Odisha",
      postalCode: user?.address?.postalCode || "751012",
      startDate: tomorrow,
      endDate: calculatedEnd,
      deliveryFrequency: "Alternate Days",
      deliverySlot: "Morning (7 AM - 10 AM)",
      bottlesPerDelivery: plan.title?.toLowerCase().includes("advanced") ? 3 : 2,
      paymentMethod: "cod",
      notes: "",
    });

    setIsModalOpen(true);
  };

  const handleSubscriptionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!subForm.customerName.trim() || !subForm.customerPhone.trim() || !subForm.customerEmail.trim()) {
      setErrorMessage("Please enter your complete name, phone number, and email.");
      return;
    }
    if (!subForm.street.trim()) {
      setErrorMessage("Please provide your delivery street address in Bhubaneswar.");
      return;
    }
    if (!subForm.startDate || !subForm.endDate) {
      setErrorMessage("Both start date and end date are required.");
      return;
    }
    if (new Date(subForm.endDate) <= new Date(subForm.startDate)) {
      setErrorMessage("Subscription End Date must be after the Start Date.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const payload = {
        planId: selectedPlan.id,
        planTitle: selectedPlan.title,
        planPrice: selectedPlan.price,
        period: selectedPlan.period,
        customerName: subForm.customerName.trim(),
        customerEmail: subForm.customerEmail.trim().toLowerCase(),
        customerPhone: subForm.customerPhone.trim(),
        deliveryAddress: {
          street: subForm.street.trim(),
          city: subForm.city.trim(),
          state: subForm.state.trim(),
          postalCode: subForm.postalCode.trim(),
        },
        startDate: subForm.startDate,
        endDate: subForm.endDate,
        deliveryFrequency: subForm.deliveryFrequency,
        deliverySlot: subForm.deliverySlot,
        bottlesPerDelivery: Number(subForm.bottlesPerDelivery) || 2,
        paymentMethod: subForm.paymentMethod,
        notes: subForm.notes.trim(),
      };

      const res = await API.post("/subscription-orders", payload);

      if (res.data?.success && res.data.order) {
        setConfirmedOrder(res.data.order);

        // Update local session if user is logged in
        if (res.data.user) {
          localStorage.setItem("alka_user", JSON.stringify(res.data.user));
          window.dispatchEvent(new Event("alkaAuthUpdated"));
        }
      } else {
        throw new Error(res.data?.message || "Failed to activate subscription.");
      }
    } catch (err) {
      console.error("Subscription order failed:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to activate subscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysDuration = calculateDaysDuration(subForm.startDate, subForm.endDate);

  return (
    <section className="SubscriptionOne-section">
      {/* HEADER */}
      <header className="SubscriptionOne-header">
        <span className="SubscriptionOne-tagline">
          Pure • Mineral-Rich • Doorstep Delivery
        </span>

        <h1 className="SubscriptionOne-main-title">
          <span className="SubscriptionOne-title-primary">
            Best Water Suppliers in Bhubaneswar
          </span>

          <span className="SubscriptionOne-title-secondary">
            20 Litre Water Bottle Subscription Plans &amp; Pricing
          </span>
        </h1>

        <p className="SubscriptionOne-lead-text">
          Looking for a dependable drinking water supply with home delivery?
          Alka Drops provides quality mineral wellness water directly to homes,
          gyms, and workplaces at transparent prices.
        </p>
      </header>

      {/* SUBSCRIPTION PLANS */}
      <div className="SubscriptionOne-container">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`SubscriptionOne-card ${
              plan.featured
                ? "SubscriptionOne-featured-card"
                : "SubscriptionOne-standard-card"
            } ${flippedCards[plan.id] ? "is-flipped" : ""}`}
            onClick={() => toggleCardFlip(plan.id, plan.featured)}
            onKeyDown={(event) => handleCardKeyDown(event, plan.id, plan.featured)}
            role={plan.featured ? undefined : "button"}
            tabIndex={plan.featured ? undefined : 0}
            aria-label={
              plan.featured
                ? plan.title
                : `${plan.title}. Activate to see plan features.`
            }
            aria-pressed={plan.featured ? undefined : !!flippedCards[plan.id]}
          >
            <div className="SubscriptionOne-card-inner">
              {/* FRONT SIDE */}
              <div className="SubscriptionOne-card-front">
                <div className="SubscriptionOne-price-ring-container">
                  <div className="SubscriptionOne-price-outer-ring">
                    <div className="SubscriptionOne-price-bubble">
                      <span className="SubscriptionOne-currency-symbol">₹</span>
                      <span className="SubscriptionOne-price-amount">{plan.price}</span>
                      <div className="SubscriptionOne-period-badge">{plan.period}</div>
                    </div>
                  </div>
                </div>

                <div className="SubscriptionOne-card-heading">
                  <h3 className="SubscriptionOne-card-title">{plan.title}</h3>
                  <span className="SubscriptionOne-card-subtitle">{plan.subtitle}</span>
                </div>

                {plan.featured ? (
                  <ul className="SubscriptionOne-feature-list">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="SubscriptionOne-feature-item">
                        <span className="SubscriptionOne-feat-icon">{feature.icon}</span>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="SubscriptionOne-card-middle">
                    <p className="SubscriptionOne-card-description">{plan.description}</p>
                    <span className="SubscriptionOne-flip-hint">
                      Hover or tap to explore features
                    </span>
                  </div>
                )}

                {/* MODAL TRIGGER: ORDER NOW */}
                <button
                  type="button"
                  className="SubscriptionOne-order-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenSubscriptionModal(plan);
                  }}
                  title={`Subscribe to ${plan.title}`}
                >
                  <span>Order Now</span>
                  <span className="SubscriptionOne-order-btn-accent">
                    <FiArrowRight />
                  </span>
                </button>
              </div>

              {/* BACK SIDE - STANDARD CARDS */}
              {!plan.featured && (
                <div className="SubscriptionOne-card-back">
                  <div className="SubscriptionOne-price-ring-container">
                    <div className="SubscriptionOne-price-outer-ring variant-blue">
                      <div className="SubscriptionOne-price-bubble variant-blue">
                        <span className="SubscriptionOne-currency-symbol">₹</span>
                        <span className="SubscriptionOne-price-amount">{plan.price}</span>
                        <div className="SubscriptionOne-period-badge">{plan.period}</div>
                      </div>
                    </div>
                  </div>

                  <div className="SubscriptionOne-card-heading">
                    <h3 className="SubscriptionOne-card-title text-white">{plan.title}</h3>
                    <span className="SubscriptionOne-card-subtitle text-lightblue">
                      {plan.subtitle}
                    </span>
                  </div>

                  <ul className="SubscriptionOne-feature-list">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="SubscriptionOne-feature-item">
                        <span className="SubscriptionOne-feat-icon text-white">
                          {feature.icon}
                        </span>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* MODAL TRIGGER: ORDER NOW */}
                  <button
                    type="button"
                    className="SubscriptionOne-order-btn variant-light"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenSubscriptionModal(plan);
                    }}
                    title={`Subscribe to ${plan.title}`}
                  >
                    <span>Order Now</span>
                    <span className="SubscriptionOne-order-btn-accent">
                      <FiArrowRight />
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* INFORMATION SECTION */}
      <div className="SubscriptionOne-info-block">
        <div className="SubscriptionOne-info-heading">
          <span>WHY CHOOSE US</span>
          <h2>Pure Water. Better Living.</h2>
          <p>
            Enjoy convenient water delivery with quality, reliability,
            and customer-focused service.
          </p>
        </div>

        <div className="SubscriptionOne-info-grid">
          <div className="SubscriptionOne-info-box">
            <FaShieldAlt className="SubscriptionOne-info-icon" />
            <h2 className="SubscriptionOne-info-heading-box">Quality Mineral Drinking Water</h2>
            <p>
              We focus on delivering quality drinking water through careful purification and
              quality checks for your everyday hydration needs.
            </p>
          </div>

          <div className="SubscriptionOne-info-box">
            <FaTruck className="SubscriptionOne-info-icon" />
            <h2 className="SubscriptionOne-info-heading-box">Prompt 20 Litre Water Jar Delivery</h2>
            <p>
              Get convenient scheduled and on-demand doorstep delivery across Nayapalli, IRC
              Village, and surrounding areas of Bhubaneswar.
            </p>
          </div>
        </div>

        {/* BUSINESS CONTACT */}
        <footer className="SubscriptionOne-nap-container">
          <div className="SubscriptionOne-nap-item">
            <span className="SubscriptionOne-nap-label">Business:</span>
            <span>{businessNAP.name}</span>
          </div>

          <div className="SubscriptionOne-nap-item">
            <FaMapMarkerAlt />
            <span>
              {businessNAP.address.street}, {businessNAP.address.city},{" "}
              {businessNAP.address.state} - {businessNAP.address.postalCode}
            </span>
          </div>

          <div className="SubscriptionOne-nap-item">
            <FaPhoneAlt />
            <span>
              Helpline:{" "}
              <a href={`tel:${businessNAP.phone}`}>{businessNAP.displayPhone}</a>
            </span>
          </div>
        </footer>
      </div>

      {/* =========================================================
          SUBSCRIPTION BOOKING MODAL
      ========================================================= */}
      {isModalOpen && (
        <div className="SubModal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="SubModal-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="SubModal-close-btn"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <FiX />
            </button>

            {confirmedOrder ? (
              /* CONFIRMATION SCREEN */
              <div className="SubModal-success-view">
                <div className="SubModal-success-icon">
                  <FiCheckCircle />
                </div>
                <h2>Subscription Confirmed!</h2>
                <span className="SubModal-order-badge">#{confirmedOrder.orderNumber}</span>
                <p className="SubModal-success-desc">
                  Your recurring subscription for <strong>{confirmedOrder.planTitle}</strong> is now active. Our delivery team in Bhubaneswar has scheduled your drops.
                </p>

                <div className="SubModal-success-card">
                  <div className="SubModal-summary-row">
                    <span>Plan Duration:</span>
                    <strong>
                      {new Date(confirmedOrder.startDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      —{" "}
                      {new Date(confirmedOrder.endDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </strong>
                  </div>
                  <div className="SubModal-summary-row">
                    <span>Delivery Schedule:</span>
                    <strong>
                      {confirmedOrder.deliveryFrequency} ({confirmedOrder.deliverySlot})
                    </strong>
                  </div>
                  <div className="SubModal-summary-row">
                    <span>Bottles per Drop:</span>
                    <strong>{confirmedOrder.bottlesPerDelivery} x 20L Jars</strong>
                  </div>
                  <div className="SubModal-summary-row">
                    <span>Deliver To:</span>
                    <strong>
                      {confirmedOrder.deliveryAddress?.street}, {confirmedOrder.deliveryAddress?.city}
                    </strong>
                  </div>
                  <div className="SubModal-summary-row">
                    <span>Amount Payable:</span>
                    <strong style={{ color: "#004ea8" }}>
                      ₹{confirmedOrder.totalAmount} ({confirmedOrder.paymentMethod.toUpperCase()})
                    </strong>
                  </div>
                </div>

                <div className="SubModal-actions">
                  <button
                    type="button"
                    className="SubModal-btn-primary"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate("/account?tab=subscriptions");
                    }}
                  >
                    View in My Account <FiArrowRight />
                  </button>
                  <button
                    type="button"
                    className="SubModal-btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* BOOKING FORM */
              <form onSubmit={handleSubscriptionSubmit} className="SubModal-form">
                <div className="SubModal-header">
                  <div>
                    <span className="SubModal-eyebrow">DOORSTEP HYDRATION PASS</span>
                    <h3>Subscribe to {selectedPlan?.title}</h3>
                  </div>
                  <div className="SubModal-plan-badge">
                    <span className="SubModal-plan-price">₹{selectedPlan?.price}</span>
                    <span className="SubModal-plan-period">/{selectedPlan?.period?.toLowerCase()}</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="SubModal-alert-error">
                    <FiAlertCircle /> {errorMessage}
                  </div>
                )}

                {/* DATES ROW (START DATE & END DATE) */}
                <div className="SubModal-dates-box">
                  <div className="SubModal-dates-header">
                    <span className="SubModal-dates-label">
                      <FiCalendar /> Subscription Validity Period
                    </span>
                    {daysDuration && (
                      <span className="SubModal-duration-pill">
                        {daysDuration} Days Plan Duration
                      </span>
                    )}
                  </div>

                  <div className="SubModal-dates-row">
                    <div className="SubModal-field">
                      <label>
                        Start Date <span>*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        min={getTomorrowDate()}
                        value={subForm.startDate}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setSubForm((prev) => ({
                            ...prev,
                            startDate: newStart,
                            endDate: getCalculatedEndDate(newStart, selectedPlan?.period),
                          }));
                        }}
                        required
                      />
                    </div>

                    <div className="SubModal-field">
                      <label>
                        End Date <span>*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        min={subForm.startDate || getTomorrowDate()}
                        value={subForm.endDate}
                        onChange={(e) =>
                          setSubForm({ ...subForm, endDate: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* CUSTOMER & DELIVERY GRID */}
                <div className="SubModal-form-grid">
                  <div className="SubModal-field">
                    <label>
                      <FiUser /> Full Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Patel"
                      value={subForm.customerName}
                      onChange={(e) => setSubForm({ ...subForm, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="SubModal-field">
                    <label>
                      <FiPhone /> Contact Number <span>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={subForm.customerPhone}
                      onChange={(e) => setSubForm({ ...subForm, customerPhone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="SubModal-field full-width">
                    <label>
                      <FiMail /> Email Address <span>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={subForm.customerEmail}
                      onChange={(e) => setSubForm({ ...subForm, customerEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div className="SubModal-field full-width">
                    <label>
                      <FiMapPin /> Delivery Address (Plot / Flat / Street / Landmark) <span>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot No N5/22, IRC Village, Nayapalli"
                      value={subForm.street}
                      onChange={(e) => setSubForm({ ...subForm, street: e.target.value })}
                      required
                    />
                  </div>

                  <div className="SubModal-field">
                    <label>City</label>
                    <input
                      type="text"
                      value={subForm.city}
                      onChange={(e) => setSubForm({ ...subForm, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="SubModal-field">
                    <label>PIN Code</label>
                    <input
                      type="text"
                      value={subForm.postalCode}
                      onChange={(e) => setSubForm({ ...subForm, postalCode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="SubModal-field">
                    <label>
                      <FiRefreshCw /> Delivery Cadence
                    </label>
                    <select
                      value={subForm.deliveryFrequency}
                      onChange={(e) => setSubForm({ ...subForm, deliveryFrequency: e.target.value })}
                    >
                      <option value="Daily">Daily (Every 24 Hours)</option>
                      <option value="Alternate Days">Alternate Days (Every 48 Hours)</option>
                      <option value="Twice a Week">Twice a Week (Mon &amp; Thu)</option>
                      <option value="Weekly">Weekly (1x Every Week)</option>
                    </select>
                  </div>

                  <div className="SubModal-field">
                    <label>
                      <FiClock /> Delivery Time Slot
                    </label>
                    <select
                      value={subForm.deliverySlot}
                      onChange={(e) => setSubForm({ ...subForm, deliverySlot: e.target.value })}
                    >
                      <option value="Morning (7 AM - 10 AM)">Morning (7 AM - 10 AM)</option>
                      <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                      <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                    </select>
                  </div>

                  <div className="SubModal-field">
                    <label>
                      <FiPackage /> Jars per Delivery
                    </label>
                    <select
                      value={subForm.bottlesPerDelivery}
                      onChange={(e) =>
                        setSubForm({ ...subForm, bottlesPerDelivery: Number(e.target.value) })
                      }
                    >
                      <option value={1}>1 Can (20 Litres)</option>
                      <option value={2}>2 Cans (40 Litres) - Recommended</option>
                      <option value={3}>3 Cans (60 Litres)</option>
                      <option value={4}>4 Cans (80 Litres)</option>
                    </select>
                  </div>

                  <div className="SubModal-field">
                    <label>Payment Method</label>
                    <select
                      value={subForm.paymentMethod}
                      onChange={(e) => setSubForm({ ...subForm, paymentMethod: e.target.value })}
                    >
                      <option value="cod">Cash on Delivery (Pay on 1st drop)</option>
                      <option value="upi">UPI / QR Code on Delivery</option>
                    </select>
                  </div>
                </div>

                <div className="SubModal-actions">
                  <button
                    type="button"
                    className="SubModal-btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="SubModal-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FiRefreshCw className="spin" /> Activating...
                      </>
                    ) : (
                      <>
                        Confirm &amp; Activate Plan <FiArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SubscriptionOne;
