import React, { useState, useEffect, useMemo } from "react";
import {
  FiStar,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiMessageSquare,
  FiRefreshCw,
  FiSend,
  FiX,
  FiThumbsUp,
  FiPlus,
  FiInbox,
} from "react-icons/fi";
import API from "../../services/api";
import "./ReviewManagement.css";

const ReviewManagement = () => {
  // Live reviews from MongoDB — zero mock / fallback records
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Admin reply modal
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSavingReply, setIsSavingReply] = useState(false);

  // New review modal
  const [newReviewModal, setNewReviewModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newReview, setNewReview] = useState({
    customer: "",
    role: "Verified Customer, Bhubaneswar",
    product: "20L Alkaline Mineral Water Jar",
    rating: 5,
    title: "",
    comment: "",
    avatar: "",
  });

  // Fetch live reviews from MongoDB
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await API.get("/reviews?limit=200");
      if (res.data?.success && Array.isArray(res.data.reviews)) {
        setReviews(res.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Failed to fetch customer reviews:", err);
      setError(
        err.response?.data?.message ||
          "Could not load customer reviews from server. Please check backend connection."
      );
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Toggle review publication status (Published <-> Hidden)
  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Published" ? "Hidden" : "Published";
    setActionLoadingId(id);

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: nextStatus } : r))
    );

    try {
      const res = await API.patch(`/reviews/${id}/status`, { status: nextStatus });
      if (res.data?.success && res.data.review) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? res.data.review : r))
        );
      }
    } catch (err) {
      // Rollback on error
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: currentStatus } : r))
      );
      alert(err.response?.data?.message || "Failed to update review status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permanently delete a review
  const handleDelete = async (id, customer) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the review by "${customer}"?`
      )
    ) {
      return;
    }

    setActionLoadingId(id);
    try {
      await API.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Save official reply to review
  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!replyModal) return;

    setIsSavingReply(true);
    try {
      const res = await API.post(`/reviews/${replyModal._id}/reply`, {
        adminReply: replyText,
      });

      if (res.data?.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === replyModal._id ? { ...r, adminReply: replyText } : r
          )
        );
        setReplyModal(null);
        setReplyText("");
      } else {
        alert(res.data?.message || "Failed to save reply.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save official reply.");
    } finally {
      setIsSavingReply(false);
    }
  };

  // Create new customer review
  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newReview.customer.trim()) {
      alert("Please enter customer name.");
      return;
    }
    if (!newReview.comment.trim()) {
      alert("Please enter review feedback.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await API.post("/reviews", {
        name: newReview.customer.trim(),
        customer: newReview.customer.trim(),
        role: newReview.role.trim(),
        product: newReview.product.trim(),
        rating: Number(newReview.rating),
        title: newReview.title.trim() || "Customer Review",
        comment: newReview.comment.trim(),
        avatar:
          newReview.avatar.trim() ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        status: "Published",
      });

      if (res.data?.success && res.data.review) {
        setReviews((prev) => [res.data.review, ...prev]);
        setNewReviewModal(false);
        setNewReview({
          customer: "",
          role: "Verified Customer, Bhubaneswar",
          product: "20L Alkaline Mineral Water Jar",
          rating: 5,
          title: "",
          comment: "",
          avatar: "",
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create customer review.");
    } finally {
      setIsCreating(false);
    }
  };

  // Filtered reviews
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const cust = (r.customer || r.name || "").toLowerCase();
      const prod = (r.product || "").toLowerCase();
      const titl = (r.title || "").toLowerCase();
      const comm = (r.comment || r.text || r.feedback || "").toLowerCase();
      const s = search.toLowerCase();

      const matchSearch =
        !s ||
        cust.includes(s) ||
        prod.includes(s) ||
        titl.includes(s) ||
        comm.includes(s);

      const matchRating =
        ratingFilter === "all" || r.rating === parseInt(ratingFilter, 10);

      const status = (r.status || "Published").toLowerCase();
      const matchStatus =
        statusFilter === "all" || status === statusFilter.toLowerCase();

      return matchSearch && matchRating && matchStatus;
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / total).toFixed(1)
        : "0.0";
    const published = reviews.filter(
      (r) => (r.status || "Published") === "Published"
    ).length;
    const pending = reviews.filter(
      (r) => (r.status || "").toLowerCase() === "pending"
    ).length;
    return { total, avg, published, pending };
  }, [reviews]);

  return (
    <div className="ReviewManagement">
      {/* Header */}
      <header className="ReviewManagement-header">
        <div className="ReviewManagement-heading">
          <div className="ReviewManagement-headingIcon">
            <FiStar />
          </div>
          <div>
            <h1>Customer Reviews &amp; Ratings</h1>
            <p className="ReviewManagement-sub">
              Live verified buyer feedback and customer testimonials from MongoDB.
            </p>
          </div>
        </div>
        <div className="ReviewManagement-actions">
          <button
            type="button"
            className="ReviewManagement-btn primary"
            onClick={() => setNewReviewModal(true)}
          >
            <FiPlus /> <span>Add Review</span>
          </button>
          <button
            type="button"
            className="ReviewManagement-btn secondary"
            onClick={fetchReviews}
            disabled={isLoading}
            title="Refresh database records"
          >
            <FiRefreshCw className={isLoading ? "spin" : ""} /> <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="ReviewManagement-statsGrid">
        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon total">
            <FiStar />
          </div>
          <div>
            <span className="ReviewManagement-statLabel">Average Rating</span>
            <span className="ReviewManagement-statValue">{stats.avg} ★</span>
          </div>
        </div>

        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon all">
            <FiMessageSquare />
          </div>
          <div>
            <span className="ReviewManagement-statLabel">Total Reviews</span>
            <span className="ReviewManagement-statValue">{stats.total}</span>
          </div>
        </div>

        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon published">
            <FiCheckCircle />
          </div>
          <div>
            <span className="ReviewManagement-statLabel">Published Live</span>
            <span className="ReviewManagement-statValue">{stats.published}</span>
          </div>
        </div>

        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon pending">
            <FiEyeOff />
          </div>
          <div>
            <span className="ReviewManagement-statLabel">Pending / Moderation</span>
            <span className="ReviewManagement-statValue">{stats.pending}</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="ReviewManagement-controlBar">
        <div className="ReviewManagement-searchBox">
          <FiSearch className="ReviewManagement-searchIcon" />
          <input
            type="text"
            placeholder="Search reviews by customer name, bottle/jar, or feedback text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ReviewManagement-filters">
          <div className="ReviewManagement-filterGroup">
            <label htmlFor="ratingFilterSelect">
              <FiFilter /> Rating:
            </label>
            <select
              id="ratingFilterSelect"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★☆</option>
              <option value="3">3 Stars ★★★☆☆</option>
              <option value="2">2 Stars ★★☆☆☆</option>
              <option value="1">1 Star ★☆☆☆☆</option>
            </select>
          </div>

          <div className="ReviewManagement-statusTabs">
            <button
              type="button"
              className={statusFilter === "all" ? "active" : ""}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={statusFilter === "published" ? "active" : ""}
              onClick={() => setStatusFilter("published")}
            >
              Published
            </button>
            <button
              type="button"
              className={statusFilter === "pending" ? "active" : ""}
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </button>
            <button
              type="button"
              className={statusFilter === "hidden" ? "active" : ""}
              onClick={() => setStatusFilter("hidden")}
            >
              Hidden
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && <div className="ReviewManagement-alert error">{error}</div>}

      {/* Reviews List */}
      <div className="ReviewManagement-list">
        {isLoading ? (
          <div className="ReviewManagement-loadingState">
            <FiRefreshCw className="spin" />
            <span>Loading verified customer reviews from MongoDB...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ReviewManagement-empty">
            <FiInbox size={42} />
            <h3>No Customer Reviews Found</h3>
            <p>
              {reviews.length === 0
                ? "No reviews in the database yet. Click 'Add Review' to create one."
                : "No customer reviews match your current search and rating filter."}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isActing = actionLoadingId === item._id;
            const reviewStatus = item.status || "Published";
            const reviewDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : item.date || "Verified";

            return (
              <div key={item._id} className="ReviewManagement-card">
                <div className="ReviewManagement-cardTop">
                  <div className="ReviewManagement-userBlock">
                    <img
                      src={
                        item.avatar ||
                        item.image ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      }
                      alt={item.customer || item.name}
                      className="ReviewManagement-avatar"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                      }}
                    />
                    <div>
                      <div className="ReviewManagement-userNameRow">
                        <h3 className="ReviewManagement-userName">
                          {item.customer || item.name}
                        </h3>
                        {item.verified !== false && (
                          <span className="ReviewManagement-verifiedBadge">
                            <FiCheckCircle /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="ReviewManagement-productTag">
                        {item.product} {item.role ? `• ${item.role}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="ReviewManagement-ratingBox">
                    <div className="ReviewManagement-stars">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={
                            i < (item.rating || 5) ? "star filled" : "star empty"
                          }
                        />
                      ))}
                      <span className="ReviewManagement-ratingNum">
                        {item.rating}.0
                      </span>
                    </div>
                    <span className="ReviewManagement-date">{reviewDate}</span>
                    <span
                      className={`ReviewManagement-pill ${reviewStatus.toLowerCase()}`}
                    >
                      {reviewStatus}
                    </span>
                  </div>
                </div>

                <div className="ReviewManagement-body">
                  {item.title && (
                    <h4 className="ReviewManagement-title">{item.title}</h4>
                  )}
                  <p className="ReviewManagement-text">
                    {item.comment || item.text || item.feedback}
                  </p>
                </div>

                {item.adminReply && (
                  <div className="ReviewManagement-replySnippet">
                    <strong>Alka Drops Official Response:</strong>
                    <p>{item.adminReply}</p>
                  </div>
                )}

                <div className="ReviewManagement-cardFooter">
                  <div className="ReviewManagement-helpful">
                    <FiThumbsUp />{" "}
                    <span>
                      {item.helpful || 0} people found this helpful
                    </span>
                  </div>

                  <div className="ReviewManagement-footerActions">
                    <button
                      type="button"
                      className="ReviewManagement-actionBtn"
                      onClick={() => {
                        setReplyModal(item);
                        setReplyText(item.adminReply || "");
                      }}
                      disabled={isActing}
                    >
                      <FiMessageSquare />{" "}
                      {item.adminReply ? "Edit Reply" : "Reply as Admin"}
                    </button>

                    <button
                      type="button"
                      className={`ReviewManagement-actionBtn toggle ${
                        reviewStatus === "Published" ? "hide" : "publish"
                      }`}
                      onClick={() => toggleStatus(item._id, reviewStatus)}
                      disabled={isActing}
                    >
                      {reviewStatus === "Published" ? (
                        <>
                          <FiEyeOff /> Hide
                        </>
                      ) : (
                        <>
                          <FiEye /> Publish
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="ReviewManagement-actionBtn danger"
                      onClick={() =>
                        handleDelete(item._id, item.customer || item.name)
                      }
                      disabled={isActing}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Reply Modal */}
      {replyModal && (
        <div
          className="ReviewManagement-modalBackdrop"
          onClick={() => !isSavingReply && setReplyModal(null)}
        >
          <div
            className="ReviewManagement-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ReviewManagement-modalHeader">
              <h3>
                Official Response to {replyModal.customer || replyModal.name}
              </h3>
              <button
                type="button"
                onClick={() => !isSavingReply && setReplyModal(null)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSaveReply} className="ReviewManagement-modalForm">
              <div className="ReviewManagement-modalReviewPreview">
                <em>
                  "{replyModal.comment || replyModal.text || replyModal.feedback}"
                </em>
              </div>
              <textarea
                rows="4"
                placeholder="Write Alka Drops team's official public response to this review..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              />
              <div className="ReviewManagement-modalActions">
                <button
                  type="button"
                  onClick={() => !isSavingReply && setReplyModal(null)}
                  disabled={isSavingReply}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save"
                  disabled={isSavingReply}
                >
                  {isSavingReply ? (
                    <>
                      <FiRefreshCw className="spin" /> <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSend /> <span>Save Response</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Review Modal */}
      {newReviewModal && (
        <div
          className="ReviewManagement-modalBackdrop"
          onClick={() => !isCreating && setNewReviewModal(false)}
        >
          <div
            className="ReviewManagement-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ReviewManagement-modalHeader">
              <h3>Add Verified Customer Review</h3>
              <button
                type="button"
                onClick={() => !isCreating && setNewReviewModal(false)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateReview} className="ReviewManagement-modalForm">
              <div className="ReviewManagement-formGroup">
                <label>Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyabrata Mohanty"
                  value={newReview.customer}
                  onChange={(e) =>
                    setNewReview({ ...newReview, customer: e.target.value })
                  }
                />
              </div>

              <div className="ReviewManagement-formRow">
                <div className="ReviewManagement-formGroup">
                  <label>Designation / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Homemaker, Nayapalli"
                    value={newReview.role}
                    onChange={(e) =>
                      setNewReview({ ...newReview, role: e.target.value })
                    }
                  />
                </div>
                <div className="ReviewManagement-formGroup">
                  <label>Star Rating (1 - 5)</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) =>
                      setNewReview({
                        ...newReview,
                        rating: Number(e.target.value),
                      })
                    }
                  >
                    <option value="5">5 Stars ★★★★★</option>
                    <option value="4">4 Stars ★★★★☆</option>
                    <option value="3">3 Stars ★★★☆☆</option>
                    <option value="2">2 Stars ★★☆☆☆</option>
                    <option value="1">1 Star ★☆☆☆☆</option>
                  </select>
                </div>
              </div>

              <div className="ReviewManagement-formGroup">
                <label>Water Product / Plan Purchased</label>
                <input
                  type="text"
                  placeholder="e.g. 20L Alkaline Mineral Water Jar"
                  value={newReview.product}
                  onChange={(e) =>
                    setNewReview({ ...newReview, product: e.target.value })
                  }
                />
              </div>

              <div className="ReviewManagement-formGroup">
                <label>Review Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Noticeable health benefits & crisp mineral taste"
                  value={newReview.title}
                  onChange={(e) =>
                    setNewReview({ ...newReview, title: e.target.value })
                  }
                />
              </div>

              <div className="ReviewManagement-formGroup">
                <label>Customer Feedback / Testimonial *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Write the customer's authentic review details..."
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                />
              </div>

              <div className="ReviewManagement-modalActions">
                <button
                  type="button"
                  onClick={() => !isCreating && setNewReviewModal(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <FiRefreshCw className="spin" /> <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle /> <span>Save Review to Database</span>
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

export default ReviewManagement;
