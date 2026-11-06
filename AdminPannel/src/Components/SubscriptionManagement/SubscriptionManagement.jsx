import React, { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiCheckCircle,
  FiRefreshCw,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiStar,
  FiEye,
  FiEyeOff,
  FiAward,
} from "react-icons/fi";
import { Crown } from "lucide-react";
import API from "../../services/api";
import "./SubscriptionManagement.css";

const emptyPlanForm = {
  title: "",
  subtitle: "",
  price: "",
  period: "MO",
  description: "",
  features: ["Free Doorstep Delivery", "Max 10 Bottles / Month (20L)", "Empty Bottle Pickup"],
  featured: false,
  status: "Active",
  order: 1,
};

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyPlanForm);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch plans from Backend
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await API.get("/subscription-plans");
      if (res.data?.plans) {
        setPlans(res.data.plans);
      }
    } catch (err) {
      console.error("Failed to fetch subscription plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...emptyPlanForm,
      order: plans.length + 1,
    });
    setNewFeatureText("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plan) => {
    setEditingId(plan._id);
    setFormData({
      title: plan.title || "",
      subtitle: plan.subtitle || "",
      price: plan.price || "",
      period: plan.period || "MO",
      description: plan.description || "",
      features: Array.isArray(plan.features) ? [...plan.features] : [],
      featured: Boolean(plan.featured),
      status: plan.status || "Active",
      order: plan.order || 1,
    });
    setNewFeatureText("");
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyPlanForm);
  };

  // Feature list manipulation
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureText.trim()],
    }));
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Submit Plan (Create or Update)
  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.toString().trim()) {
      alert("Please enter Plan Title and Price.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await API.put(`/subscription-plans/${editingId}`, formData);
        setPlans((prev) =>
          prev.map((p) => (p._id === editingId ? res.data.plan : p))
        );
        alert("Subscription plan updated successfully!");
      } else {
        const res = await API.post("/subscription-plans", formData);
        setPlans((prev) => [...prev, res.data.plan]);
        alert("New subscription plan posted successfully!");
      }
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save subscription plan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Plan
  const handleDeletePlan = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    try {
      await API.delete(`/subscription-plans/${id}`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete plan.");
    }
  };

  // Toggle Plan Status
  const handleToggleStatus = async (plan) => {
    const newStatus = plan.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await API.put(`/subscription-plans/${plan._id}`, {
        status: newStatus,
      });
      setPlans((prev) =>
        prev.map((p) => (p._id === plan._id ? res.data.plan : p))
      );
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (plan) => {
    const newFeatured = !plan.featured;
    try {
      const res = await API.put(`/subscription-plans/${plan._id}`, {
        featured: newFeatured,
      });
      setPlans((prev) =>
        prev.map((p) => (p._id === plan._id ? res.data.plan : p))
      );
    } catch (err) {
      alert("Failed to toggle featured status.");
    }
  };

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(search.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
        p.features.some((f) => f.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "featured" ? p.featured : p.status.toLowerCase() === statusFilter.toLowerCase());

      return matchSearch && matchStatus;
    });
  }, [plans, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((p) => p.status === "Active").length;
    const featured = plans.filter((p) => p.featured).length;
    return { total, active, featured };
  }, [plans]);

  return (
    <div className="SubscriptionManagement">
      {/* Header */}
      <header className="SubscriptionManagement-header">
        <div className="SubscriptionManagement-heading">
          <div className="SubscriptionManagement-headingIcon">
            <Crown size={24} />
          </div>
          <div>
            <h1>Subscription Management</h1>
            <p className="SubscriptionManagement-subtitle">
              Post, manage, and configure subscription pricing cards displayed on http://localhost:5173/pricing
            </p>
          </div>
        </div>

        <div className="SubscriptionManagement-actions">
          <button
            type="button"
            className="SubscriptionManagement-btn secondary"
            onClick={fetchPlans}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "spin" : ""} /> <span>Sync</span>
          </button>
          <button
            type="button"
            className="SubscriptionManagement-btn primary"
            onClick={handleOpenAdd}
          >
            <FiPlus /> <span>Post Subscription Plan</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="SubscriptionManagement-statsGrid">
        <div className="SubscriptionManagement-statCard">
          <div className="SubscriptionManagement-statIcon plans">
            <Crown size={20} />
          </div>
          <div>
            <span className="SubscriptionManagement-statLabel">Total Plans</span>
            <span className="SubscriptionManagement-statValue">{stats.total} Plans</span>
          </div>
        </div>
        <div className="SubscriptionManagement-statCard">
          <div className="SubscriptionManagement-statIcon subs">
            <FiCheckCircle />
          </div>
          <div>
            <span className="SubscriptionManagement-statLabel">Active on Pricing Page</span>
            <span className="SubscriptionManagement-statValue">{stats.active} Active</span>
          </div>
        </div>
        <div className="SubscriptionManagement-statCard">
          <div className="SubscriptionManagement-statIcon mrr">
            <FiStar />
          </div>
          <div>
            <span className="SubscriptionManagement-statLabel">Featured Highlight Plans</span>
            <span className="SubscriptionManagement-statValue">{stats.featured} Featured</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="SubscriptionManagement-controlBar">
        <div className="SubscriptionManagement-searchBox">
          <FiSearch className="SubscriptionManagement-searchIcon" />
          <input
            type="text"
            placeholder="Search plans by title, subtitle, or feature..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="SubscriptionManagement-statusTabs">
          <button
            type="button"
            className={statusFilter === "all" ? "active" : ""}
            onClick={() => setStatusFilter("all")}
          >
            All ({plans.length})
          </button>
          <button
            type="button"
            className={statusFilter === "active" ? "active" : ""}
            onClick={() => setStatusFilter("active")}
          >
            Active ({stats.active})
          </button>
          <button
            type="button"
            className={statusFilter === "featured" ? "active" : ""}
            onClick={() => setStatusFilter("featured")}
          >
            Featured ({stats.featured})
          </button>
          <button
            type="button"
            className={statusFilter === "inactive" ? "active" : ""}
            onClick={() => setStatusFilter("inactive")}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="SubscriptionManagement-grid">
        {loading && (
          <div className="SubscriptionManagement-loading">
            <FiRefreshCw className="spin" />
            <p>Loading subscription plans from database...</p>
          </div>
        )}

        {!loading &&
          filteredPlans.map((plan) => (
            <div
              key={plan._id}
              className={`SubscriptionManagement-card ${
                plan.featured ? "featured" : ""
              }`}
            >
              {/* Card Header */}
              <div className="SubscriptionManagement-cardHeader">
                <div className="SubscriptionManagement-priceBadge">
                  <span className="currency">₹</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>

                <div className="SubscriptionManagement-badges">
                  <button
                    type="button"
                    className={`SubscriptionManagement-badge featured-toggle ${
                      plan.featured ? "is-featured" : "not-featured"
                    }`}
                    onClick={() => handleToggleFeatured(plan)}
                    title={
                      plan.featured
                        ? "Click to remove Featured highlight"
                        : "Click to set as Featured highlight"
                    }
                  >
                    <FiStar className={plan.featured ? "star-fill" : ""} />
                    <span>{plan.featured ? "Featured" : "Set Featured"}</span>
                  </button>

                  <button
                    type="button"
                    className={`SubscriptionManagement-badge status-toggle ${plan.status.toLowerCase()}`}
                    onClick={() => handleToggleStatus(plan)}
                    title={`Click to ${plan.status === "Active" ? "deactivate" : "activate"}`}
                  >
                    <span>{plan.status}</span>
                  </button>
                </div>
              </div>

              {/* Card Title & Subtitle */}
              <div className="SubscriptionManagement-cardTitles">
                <h3 className="SubscriptionManagement-planTitle">{plan.title}</h3>
                {plan.subtitle && (
                  <span className="SubscriptionManagement-planSubtitle">
                    {plan.subtitle}
                  </span>
                )}
              </div>

              {/* Description */}
              {plan.description && (
                <p className="SubscriptionManagement-planDesc">
                  {plan.description}
                </p>
              )}

              {/* Features List */}
              <div className="SubscriptionManagement-featuresBox">
                <span className="SubscriptionManagement-featuresHeader">
                  Plan Highlights:
                </span>
                <ul className="SubscriptionManagement-featuresList">
                  {(plan.features || []).map((feat, idx) => (
                    <li key={idx}>
                      <FiCheckCircle className="feat-check" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Actions */}
              <div className="SubscriptionManagement-cardFooter">
                <button
                  type="button"
                  className="SubscriptionManagement-btnAction edit"
                  onClick={() => handleOpenEdit(plan)}
                >
                  <FiEdit2 size={14} /> <span>Edit Plan</span>
                </button>

                <button
                  type="button"
                  className={`SubscriptionManagement-btnAction toggle ${
                    plan.status === "Active" ? "inactive" : "active"
                  }`}
                  onClick={() => handleToggleStatus(plan)}
                  title={
                    plan.status === "Active"
                      ? "Hide from pricing page"
                      : "Show on pricing page"
                  }
                >
                  {plan.status === "Active" ? (
                    <>
                      <FiEyeOff size={14} /> <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <FiEye size={14} /> <span>Activate</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="SubscriptionManagement-btnAction delete"
                  onClick={() => handleDeletePlan(plan._id, plan.title)}
                  title="Delete subscription plan"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}

        {!loading && filteredPlans.length === 0 && (
          <div className="SubscriptionManagement-empty">
            <Crown size={38} />
            <h3>No Subscription Plans Found</h3>
            <p>Click "+ Post Subscription Plan" above to create and publish a new pricing plan.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Subscription Plan Modal */}
      {isModalOpen && (
        <div className="SubscriptionManagement-modalBackdrop" onClick={handleCloseModal}>
          <div
            className="SubscriptionManagement-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="SubscriptionManagement-modalHeader">
              <h3>
                {editingId ? "Edit Subscription Plan" : "Post New Subscription Plan"}
              </h3>
              <button type="button" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitPlan} className="SubscriptionManagement-modalForm">
              <div className="form-grid">
                {/* Plan Title */}
                <div className="form-group">
                  <label htmlFor="planTitle">
                    Plan Title <span>*</span>
                  </label>
                  <input
                    id="planTitle"
                    type="text"
                    placeholder="e.g. Basic Plan, Premium Plan"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Subtitle / Tagline */}
                <div className="form-group">
                  <label htmlFor="planSubtitle">Subtitle / Tagline</label>
                  <input
                    id="planSubtitle"
                    type="text"
                    placeholder="e.g. *Home & Small Families"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                  />
                </div>

                {/* Price */}
                <div className="form-group">
                  <label htmlFor="planPrice">
                    Price (₹) <span>*</span>
                  </label>
                  <input
                    id="planPrice"
                    type="text"
                    placeholder="e.g. 1,499"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Period */}
                <div className="form-group">
                  <label htmlFor="planPeriod">Billing Period</label>
                  <select
                    id="planPeriod"
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({ ...formData, period: e.target.value })
                    }
                  >
                    <option value="MO">MO (Monthly / Per Month)</option>
                    <option value="YR">YR (Yearly / Annual)</option>
                    <option value="WK">WK (Weekly)</option>
                    <option value="DAY">DAY (Daily)</option>
                  </select>
                </div>

                {/* Status */}
                <div className="form-group">
                  <label htmlFor="planStatus">Status</label>
                  <select
                    id="planStatus"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Active">Active (Visible on Frontend)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>

                {/* Order */}
                <div className="form-group">
                  <label htmlFor="planOrder">Display Order</label>
                  <input
                    id="planOrder"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label htmlFor="planDesc">Short Description</label>
                <textarea
                  id="planDesc"
                  rows="2"
                  placeholder="Ideal 20 litre water supply home delivery package designed for..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Featured Checkbox */}
              <div className="form-checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                  />
                  <span>
                    <strong>Featured Plan</strong> (Render as highlighted card like "Premium Plan")
                  </span>
                </label>
              </div>

              {/* Features List Section */}
              <div className="form-features-section">
                <label>Plan Features / Bullet Points</label>
                <div className="add-feature-bar">
                  <input
                    type="text"
                    placeholder="e.g. Free Doorstep Delivery, Max 10 Bottles / Month (20L)..."
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="add-feat-btn"
                  >
                    <FiPlus /> Add Feature
                  </button>
                </div>

                <div className="features-tags-list">
                  {formData.features.map((feat, index) => (
                    <div key={index} className="feature-chip">
                      <FiCheck size={12} />
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        title="Remove feature"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  {formData.features.length === 0 && (
                    <span className="no-features">No features added yet. Type above and click Add.</span>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="SubscriptionManagement-modalActions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : editingId ? "Update Plan" : "Publish Subscription Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
