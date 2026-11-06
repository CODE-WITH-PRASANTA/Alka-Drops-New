import React, { useEffect, useMemo, useState } from "react";
import {
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiTrash2,
  FiCornerDownRight,
  FiExternalLink,
  FiRefreshCw,
  FiX,
  FiAlertCircle,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiSend,
  FiMail,
  FiBookOpen,
} from "react-icons/fi";
import API from "../../services/api";
import "./BlogComments.css";

const BlogComments = () => {
  const [comments, setComments] = useState([]);
  const [blogsList, setBlogsList] = useState([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, published: 0, blogsCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedBlog, setSelectedBlog] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'draft' | 'published'

  // Modals
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  /* =====================================================
     FETCH ALL COMMENTS & BLOGS VIA AXIOS
  ===================================================== */
  const fetchComments = async () => {
    try {
      setIsLoading(true);

      const [commentsRes, blogsRes] = await Promise.all([
        API.get("/comments", {
          params: {
            status: statusFilter !== "all" ? statusFilter : undefined,
            blogId: selectedBlog !== "all" ? selectedBlog : undefined,
            search: search.trim() || undefined,
          },
        }),
        API.get("/blogs"),
      ]);

      if (commentsRes.data?.success) {
        setComments(commentsRes.data.comments || []);
        if (commentsRes.data.stats) {
          setStats(commentsRes.data.stats);
        }
      }

      if (blogsRes.data?.blogs) {
        setBlogsList(blogsRes.data.blogs);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      showToast("Failed to load blog comments from database.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [selectedBlog, statusFilter]);

  /* Format date helper */
  const formatDate = (dateString) => {
    if (!dateString) return "Recent";
    const d = new Date(dateString);
    const day = d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${day} at ${time}`;
  };

  /* Get initials */
  const getInitials = (name) =>
    (name || "A")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  /* =====================================================
     INSTANT STATUS TOGGLE (DRAFT <-> PUBLISHED)
  ===================================================== */
  const handleToggleStatus = async (comment) => {
    const newStatus = comment.status === "published" ? "draft" : "published";

    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) => (c._id === comment._id ? { ...c, status: newStatus } : c))
    );

    // Update stats optimistically
    setStats((prev) => ({
      ...prev,
      draft: newStatus === "draft" ? prev.draft + 1 : Math.max(0, prev.draft - 1),
      published: newStatus === "published" ? prev.published + 1 : Math.max(0, prev.published - 1),
    }));

    try {
      const res = await API.patch(`/comments/${comment._id}/status`, {
        status: newStatus,
      });

      if (res.data?.success) {
        showToast(
          newStatus === "published"
            ? `Comment by "${comment.name}" is now published and live on the blog!`
            : `Comment by "${comment.name}" was moved back to Drafts.`
        );
      } else {
        fetchComments(); // Revert
        showToast(res.data?.message || "Could not update status.", "error");
      }
    } catch (err) {
      fetchComments();
      showToast("Server error while updating comment status.", "error");
    }
  };

  /* =====================================================
     ADMIN REPLY
  ===================================================== */
  const handleOpenReply = (comment) => {
    setReplyTarget(comment);
    setReplyText("");
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setIsSubmittingReply(true);
      const res = await API.post(`/comments/${replyTarget._id}/reply`, {
        replyText: replyText.trim(),
        adminName: "Alka Drops Admin",
      });

      if (res.data?.success) {
        showToast(`Reply published to ${replyTarget.name}'s comment!`);
        setReplyTarget(null);
        setReplyText("");
        fetchComments();
      } else {
        showToast(res.data?.message || "Failed to post reply.", "error");
      }
    } catch (err) {
      console.error("Admin reply error:", err);
      showToast("Error posting reply.", "error");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  /* =====================================================
     DELETE COMMENT
  ===================================================== */
  const handleDeleteComment = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await API.delete(`/comments/${deleteTarget._id}`);

      if (res.data?.success) {
        showToast("Comment deleted successfully.");
        setComments((prev) => prev.filter((c) => c._id !== deleteTarget._id));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          draft: deleteTarget.status === "draft" ? Math.max(0, prev.draft - 1) : prev.draft,
          published: deleteTarget.status === "published" ? Math.max(0, prev.published - 1) : prev.published,
        }));
      } else {
        showToast(res.data?.message || "Could not delete comment.", "error");
      }
    } catch (err) {
      console.error("Delete comment error:", err);
      showToast("Server error while deleting comment.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* Filtered comments by client search */
  const filteredComments = useMemo(() => {
    if (!search.trim()) return comments;
    const q = search.toLowerCase();
    return comments.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.comment?.toLowerCase().includes(q) ||
        c.blogTitle?.toLowerCase().includes(q)
    );
  }, [comments, search]);

  return (
    <div className="BlogComments">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`BlogComments-toast BlogComments-toast--${toast.type}`}>
          {toast.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header - Single Line Layout */}
      <header className="BlogComments-header">
        <div className="BlogComments-heading">
          <div className="BlogComments-headingIcon">
            <FiMessageSquare />
          </div>
          <h1>Blog Comments</h1>
        </div>

        <div className="BlogComments-headerActions">
          <button
            type="button"
            className="BlogComments-refreshButton"
            onClick={fetchComments}
            title="Refresh comments from database"
          >
            <FiRefreshCw className={isLoading ? "spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="BlogComments-statsGrid">
        <div className="BlogComments-statCard">
          <div className="BlogComments-statIcon BlogComments-statIcon--total">
            <FiMessageSquare />
          </div>
          <div className="BlogComments-statContent">
            <span className="BlogComments-statLabel">Total Comments</span>
            <span className="BlogComments-statValue">{stats.total}</span>
          </div>
        </div>

        <div className="BlogComments-statCard">
          <div className="BlogComments-statIcon BlogComments-statIcon--draft">
            <FiClock />
          </div>
          <div className="BlogComments-statContent">
            <span className="BlogComments-statLabel">Drafts (Needs Review)</span>
            <span className="BlogComments-statValue">{stats.draft}</span>
          </div>
        </div>

        <div className="BlogComments-statCard">
          <div className="BlogComments-statIcon BlogComments-statIcon--published">
            <FiCheckCircle />
          </div>
          <div className="BlogComments-statContent">
            <span className="BlogComments-statLabel">Published on Website</span>
            <span className="BlogComments-statValue">{stats.published}</span>
          </div>
        </div>

        <div className="BlogComments-statCard">
          <div className="BlogComments-statIcon BlogComments-statIcon--blogs">
            <FiBookOpen />
          </div>
          <div className="BlogComments-statContent">
            <span className="BlogComments-statLabel">Articles with Comments</span>
            <span className="BlogComments-statValue">{stats.blogsCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Blog Filter, Status Tabs */}
      <div className="BlogComments-controlBar">
        <div className="BlogComments-searchBox">
          <FiSearch className="BlogComments-searchIcon" />
          <input
            type="text"
            placeholder="Search commenter name, email, comment, or article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="BlogComments-clearSearch"
              onClick={() => setSearch("")}
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="BlogComments-filterGroup">
          {/* Filter by Blog */}
          <div className="BlogComments-selectWrapper">
            <FiFilter className="BlogComments-selectIcon" />
            <select
              value={selectedBlog}
              onChange={(e) => setSelectedBlog(e.target.value)}
              title="Filter by specific blog article"
            >
              <option value="all">All Blog Articles</option>
              {blogsList.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title.length > 40 ? `${b.title.slice(0, 40)}...` : b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="BlogComments-statusTabs">
            <button
              type="button"
              className={`BlogComments-statusTab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              className={`BlogComments-statusTab ${statusFilter === "draft" ? "active" : ""}`}
              onClick={() => setStatusFilter("draft")}
            >
              Drafts ({stats.draft})
            </button>
            <button
              type="button"
              className={`BlogComments-statusTab ${statusFilter === "published" ? "active" : ""}`}
              onClick={() => setStatusFilter("published")}
            >
              Published ({stats.published})
            </button>
          </div>
        </div>
      </div>

      {/* Main Comments List */}
      {isLoading ? (
        <div className="BlogComments-loadingState">
          <FiRefreshCw className="spin" />
          <p>Loading comments from database...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="BlogComments-emptyState">
          <div className="BlogComments-emptyIcon">
            <FiMessageSquare />
          </div>
          <h3>No comments found</h3>
          <p>
            {search || selectedBlog !== "all" || statusFilter !== "all"
              ? "Try adjusting your search query or blog filter."
              : "When users comment on your blog articles, they will appear here as drafts for your moderation."}
          </p>
          {(search || selectedBlog !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              className="BlogComments-secondaryBtn"
              onClick={() => {
                setSearch("");
                setSelectedBlog("all");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="BlogComments-list">
          {filteredComments.map((comment) => (
            <div
              key={comment._id}
              className={`BlogComments-card ${
                comment.status === "draft" ? "BlogComments-card--draft" : ""
              }`}
            >
              {/* Blog Title Badge */}
              <div className="BlogComments-cardTop">
                <div className="BlogComments-blogBadge">
                  <FiBookOpen />
                  <span className="BlogComments-blogTitle">
                    {comment.blog?.title || comment.blogTitle || "Alka Drops Blog Post"}
                  </span>
                  {(comment.blogSlug || comment.blog?.slug) && (
                    <a
                      href={`http://localhost:5173/blog/${comment.blogSlug || comment.blog?.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="BlogComments-viewLiveLink"
                      title="View article on live website"
                    >
                      <FiExternalLink /> Live Post
                    </a>
                  )}
                </div>

                {/* Status Indicator */}
                <span
                  className={`BlogComments-statusBadge BlogComments-statusBadge--${comment.status}`}
                >
                  {comment.status === "published" ? (
                    <>
                      <FiCheckCircle /> Published (Live)
                    </>
                  ) : (
                    <>
                      <FiClock /> Draft (Pending Review)
                    </>
                  )}
                </span>
              </div>

              {/* Replying notice if child */}
              {comment.parentComment && (
                <div className="BlogComments-replyingNotice">
                  <FiCornerDownRight />
                  <span>
                    Reply to <strong>{comment.parentComment.name || "Commenter"}</strong>
                  </span>
                </div>
              )}

              {/* Commenter Info & Body */}
              <div className="BlogComments-cardContent">
                <div className="BlogComments-avatarRing">
                  <div className="BlogComments-avatar">
                    {getInitials(comment.name)}
                  </div>
                </div>

                <div className="BlogComments-details">
                  <div className="BlogComments-authorRow">
                    <span className="BlogComments-authorName">{comment.name}</span>
                    <span className="BlogComments-authorEmail">
                      <FiMail /> {comment.email}
                    </span>
                    <span className="BlogComments-date">
                      <FiClock /> {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  <p className="BlogComments-text">{comment.comment}</p>

                  {/* Actions Row */}
                  <div className="BlogComments-actionsRow">
                    <button
                      type="button"
                      className={`BlogComments-statusBtn ${
                        comment.status === "published" ? "unpublish" : "publish"
                      }`}
                      onClick={() => handleToggleStatus(comment)}
                      title={
                        comment.status === "published"
                          ? "Hide from website"
                          : "Approve and show live on website"
                      }
                    >
                      {comment.status === "published" ? (
                        <>
                          <FiEyeOff />
                          <span>Move to Draft</span>
                        </>
                      ) : (
                        <>
                          <FiCheck />
                          <span>Publish to Website</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="BlogComments-actionBtn reply"
                      onClick={() => handleOpenReply(comment)}
                      title="Reply as Administrator"
                    >
                      <FiCornerDownRight />
                      <span>Reply</span>
                    </button>

                    <button
                      type="button"
                      className="BlogComments-actionBtn delete"
                      onClick={() => setDeleteTarget(comment)}
                      title="Delete this comment"
                    >
                      <FiTrash2 />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN REPLY MODAL */}
      {replyTarget && (
        <div
          className="BlogComments-modalBackdrop"
          onClick={() => setReplyTarget(null)}
        >
          <div
            className="BlogComments-modalContent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="BlogComments-modalHeader">
              <div className="BlogComments-modalTitle">
                <FiCornerDownRight />
                <h3>Reply to {replyTarget.name}</h3>
              </div>
              <button
                type="button"
                className="BlogComments-modalClose"
                onClick={() => setReplyTarget(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="BlogComments-replyOriginal">
              <span className="BlogComments-replyOriginalLabel">Original Comment:</span>
              <p>"{replyTarget.comment}"</p>
            </div>

            <form onSubmit={handleSubmitReply} className="BlogComments-replyForm">
              <label>Your Admin Reply (Will be published immediately):</label>
              <textarea
                rows="4"
                placeholder="Write your response to the user..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              />

              <div className="BlogComments-modalFooter">
                <button
                  type="button"
                  className="BlogComments-cancelBtn"
                  onClick={() => setReplyTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="BlogComments-submitBtn"
                  disabled={isSubmittingReply || !replyText.trim()}
                >
                  <FiSend />
                  <span>{isSubmittingReply ? "Posting..." : "Publish Admin Reply"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          className="BlogComments-modalBackdrop"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="BlogComments-confirmModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="BlogComments-confirmIcon">
              <FiTrash2 />
            </div>
            <h3>Delete Comment?</h3>
            <p>
              Are you sure you want to permanently delete this comment from{" "}
              <strong>"{deleteTarget.name}"</strong>? This will also remove any nested
              replies to this comment.
            </p>
            <div className="BlogComments-confirmActions">
              <button
                type="button"
                className="BlogComments-cancelBtn"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="BlogComments-deleteConfirmBtn"
                onClick={handleDeleteComment}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Comment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogComments;

