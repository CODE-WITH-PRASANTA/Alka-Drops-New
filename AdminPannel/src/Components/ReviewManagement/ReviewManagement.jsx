import React, { useState, useMemo } from "react";
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
} from "react-icons/fi";
import "./ReviewManagement.css";

const defaultReviews = [
  {
    _id: "REV-201",
    customer: "Dr. Ananya Sharma",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    verified: true,
    product: "20L Alkaline Mineral Water Jar",
    rating: 5,
    title: "Best alkaline water taste & noticeable health benefits!",
    comment: "Switched our clinic and home water to Alka Drops pH 8.5+ three months ago. Acidity issues have drastically reduced and the natural mineral taste is crisp and clean.",
    date: "05 Nov 2026",
    status: "Published",
    helpful: 24,
    adminReply: "Thank you Dr. Sharma! We take extreme care with our multi-stage ionization process.",
  },
  {
    _id: "REV-202",
    customer: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    verified: true,
    product: "Monthly Alkaline Household Plan (15 Jars)",
    rating: 5,
    title: "On-time morning 7 AM delivery without fail",
    comment: "The doorstep delivery boy brings jars right up to our 4th floor flat every Monday and Thursday morning. Dispenser jar seal is always tamper-proof and spotless.",
    date: "04 Nov 2026",
    status: "Published",
    helpful: 18,
    adminReply: null,
  },
  {
    _id: "REV-203",
    customer: "Meera Deshmukh",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    verified: true,
    product: "Alka Drops 500ml Bottled Water (Pack of 24)",
    rating: 4,
    title: "Premium packaging, eco-friendly bottle material",
    comment: "Ordered 2 cases for our annual corporate seminar. Guests appreciated the premium matte bottle design. Highly recommended for events.",
    date: "02 Nov 2026",
    status: "Published",
    helpful: 9,
    adminReply: null,
  },
  {
    _id: "REV-204",
    customer: "Rajesh Kulkarni",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    verified: false,
    product: "Smart Hot & Cold Bottom Load Dispenser",
    rating: 3,
    title: "Good water, dispenser initial setup took a day",
    comment: "Water quality is 5-star, but the technician arrived late in the evening for dispenser installation. Alka Drops support resolved it promptly though.",
    date: "30 Oct 2026",
    status: "Pending",
    helpful: 3,
    adminReply: null,
  },
  {
    _id: "REV-205",
    customer: "Pooja Batra",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    verified: true,
    product: "20L Alkaline Mineral Water Jar",
    rating: 5,
    title: "TDS levels tested personally - strictly 120-150!",
    comment: "I checked with a digital TDS meter at home and the reading was 134 with neutral-alkaline pH of 8.8. Truly authentic mineralized water.",
    date: "28 Oct 2026",
    status: "Published",
    helpful: 31,
    adminReply: "We test every batch before dispatch. Thank you for validating our quality!",
  },
];

const ReviewManagement = () => {
  const [reviews, setReviews] = useState(defaultReviews);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");

  const toggleStatus = (id) => {
    setReviews((prev) =>
      prev.map((r) =>
        r._id === id
          ? { ...r, status: r.status === "Published" ? "Hidden" : "Published" }
          : r
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer review?")) {
      setReviews((prev) => prev.filter((r) => r._id !== id));
    }
  };

  const handleSaveReply = (e) => {
    e.preventDefault();
    if (!replyModal) return;
    setReviews((prev) =>
      prev.map((r) =>
        r._id === replyModal._id ? { ...r, adminReply: replyText } : r
      )
    );
    setReplyModal(null);
    setReplyText("");
  };

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        !search ||
        r.customer.toLowerCase().includes(search.toLowerCase()) ||
        r.product.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase());

      const matchRating =
        ratingFilter === "all" || r.rating === parseInt(ratingFilter, 10);

      const matchStatus =
        statusFilter === "all" || r.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchRating && matchStatus;
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : "0.0";
    const published = reviews.filter((r) => r.status === "Published").length;
    const pending = reviews.filter((r) => r.status === "Pending").length;
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
            <h1>Customer Reviews & Ratings</h1>
            <p className="ReviewManagement-sub">
              Monitor verified buyer feedback, ratings, and customer testimonials.
            </p>
          </div>
        </div>
        <div className="ReviewManagement-actions">
          <button
            type="button"
            className="ReviewManagement-btn secondary"
            onClick={() => setReviews(defaultReviews)}
          >
            <FiRefreshCw /> <span>Reset Default</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="ReviewManagement-statsGrid">
        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon total"><FiStar /></div>
          <div>
            <span className="ReviewManagement-statLabel">Average Rating</span>
            <span className="ReviewManagement-statValue">{stats.avg} ★</span>
          </div>
        </div>
        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon all"><FiMessageSquare /></div>
          <div>
            <span className="ReviewManagement-statLabel">Total Reviews</span>
            <span className="ReviewManagement-statValue">{stats.total}</span>
          </div>
        </div>
        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon published"><FiCheckCircle /></div>
          <div>
            <span className="ReviewManagement-statLabel">Published Live</span>
            <span className="ReviewManagement-statValue">{stats.published}</span>
          </div>
        </div>
        <div className="ReviewManagement-statCard">
          <div className="ReviewManagement-statIcon pending"><FiEyeOff /></div>
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
            <label htmlFor="ratingFilterSelect"><FiFilter /> Rating:</label>
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

      {/* Reviews List */}
      <div className="ReviewManagement-list">
        {filtered.map((item) => (
          <div key={item._id} className="ReviewManagement-card">
            <div className="ReviewManagement-cardTop">
              <div className="ReviewManagement-userBlock">
                <img
                  src={item.avatar}
                  alt={item.customer}
                  className="ReviewManagement-avatar"
                />
                <div>
                  <div className="ReviewManagement-userNameRow">
                    <h3 className="ReviewManagement-userName">{item.customer}</h3>
                    {item.verified && (
                      <span className="ReviewManagement-verifiedBadge">
                        <FiCheckCircle /> Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="ReviewManagement-productTag">{item.product}</span>
                </div>
              </div>

              <div className="ReviewManagement-ratingBox">
                <div className="ReviewManagement-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={i < item.rating ? "star filled" : "star empty"}
                    />
                  ))}
                  <span className="ReviewManagement-ratingNum">{item.rating}.0</span>
                </div>
                <span className="ReviewManagement-date">{item.date}</span>
                <span className={`ReviewManagement-pill ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="ReviewManagement-body">
              <h4 className="ReviewManagement-title">{item.title}</h4>
              <p className="ReviewManagement-text">{item.comment}</p>
            </div>

            {item.adminReply && (
              <div className="ReviewManagement-replySnippet">
                <strong>Alka Drops Official Response:</strong>
                <p>{item.adminReply}</p>
              </div>
            )}

            <div className="ReviewManagement-cardFooter">
              <div className="ReviewManagement-helpful">
                <FiThumbsUp /> <span>{item.helpful} people found this helpful</span>
              </div>

              <div className="ReviewManagement-footerActions">
                <button
                  type="button"
                  className="ReviewManagement-actionBtn"
                  onClick={() => {
                    setReplyModal(item);
                    setReplyText(item.adminReply || "");
                  }}
                >
                  <FiMessageSquare /> {item.adminReply ? "Edit Reply" : "Reply as Admin"}
                </button>

                <button
                  type="button"
                  className={`ReviewManagement-actionBtn toggle ${
                    item.status === "Published" ? "hide" : "publish"
                  }`}
                  onClick={() => toggleStatus(item._id)}
                >
                  {item.status === "Published" ? (
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
                  onClick={() => handleDelete(item._id)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="ReviewManagement-empty">
            <FiStar />
            <h3>No customer reviews found</h3>
            <p>Try clearing your search query or changing the rating filters.</p>
          </div>
        )}
      </div>

      {/* Admin Reply Modal */}
      {replyModal && (
        <div className="ReviewManagement-modalBackdrop" onClick={() => setReplyModal(null)}>
          <div className="ReviewManagement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ReviewManagement-modalHeader">
              <h3>Official Response to {replyModal.customer}</h3>
              <button type="button" onClick={() => setReplyModal(null)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSaveReply} className="ReviewManagement-modalForm">
              <div className="ReviewManagement-modalReviewPreview">
                <em>"{replyModal.comment}"</em>
              </div>
              <textarea
                rows="4"
                placeholder="Write Alka Drops team's official public response to this review..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              />
              <div className="ReviewManagement-modalActions">
                <button type="button" onClick={() => setReplyModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="save">
                  <FiSend /> Save Response
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
