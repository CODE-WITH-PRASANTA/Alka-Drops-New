import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import "./BlogCommentsSection.css";

import jamesImage from "../../assets/1st-comment.jpg";
import tysonImage from "../../assets/2nd-comment.jpg";

const MAX_MESSAGE_LENGTH = 1000;

// Fallback initial comments if database is fresh
const defaultStaticComments = [
  {
    id: "seed-1",
    name: "James Hayden",
    date: "JAN 31, 2021 at 2:40pm",
    message:
      "Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare non ante sed, ultricies",
    avatar: jamesImage,
    replies: [
      {
        id: "seed-2",
        name: "Tyson Matthew",
        date: "JAN 31, 2021 at 2:40pm",
        message:
          "Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare non ante sed, ultricies",
        avatar: tysonImage,
        replies: [],
      },
    ],
  },
];

const countComments = (items) =>
  items.reduce(
    (total, comment) => total + 1 + countComments(comment.replies || []),
    0
  );

const getInitials = (name) =>
  (name || "A")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const validateForm = ({ name, email, message }) => {
  const errors = {};

  if (!name.trim() || name.trim().length < 2) {
    errors.name = "Please enter your name (minimum 2 characters).";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email.trim() || !emailRegex.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!message.trim() || message.trim().length < 5) {
    errors.message = "Please write your comment (minimum 5 characters).";
  }

  return errors;
};

/* Compact Avatar with glowing ring */
const BlogAvatar = ({ name, avatar }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="blog-comment-avatar-ring">
      {avatar && !imgFailed ? (
        <img
          src={avatar}
          alt={name}
          className="blog-comment-avatar"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="blog-comment-avatar avatar-placeholder" aria-hidden="true">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

/* Single Comment Card matching exact UI in user screenshot */
const BlogCommentCard = ({ comment, onReply, nested = false }) => (
  <div
    id={`blog-comment-${comment.id}`}
    className={`blog-comment-card ${nested ? "nested-comment" : ""}`}
  >
    <BlogAvatar name={comment.name} avatar={comment.avatar} />

    <div className="blog-comment-content">
      <div className="blog-comment-header">
        <h4 className="blog-comment-author">{comment.name}</h4>

        <span className="blog-comment-date">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
            <path
              d="M12 7.5V12L15 14"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {comment.date}
        </span>
      </div>

      <p className="blog-comment-message">{comment.message}</p>

      <button
        type="button"
        className="blog-reply-btn"
        onClick={() => onReply(comment)}
        aria-label={`Reply to ${comment.name}`}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10 8L4 13L10 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 13H14C17.3 13 20 15.7 20 19"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        Reply
      </button>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="blog-comment-replies">
          {comment.replies.map((reply) => (
            <BlogCommentCard
              key={reply.id}
              comment={reply}
              onReply={onReply}
              nested
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

const BlogCommentsSection = () => {
  const { slug } = useParams();

  const sectionRef = useRef(null);
  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [resolvedSlug, setResolvedSlug] = useState(slug || "");
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const [replyTo, setReplyTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const commentCount = countComments(comments);

  /* Fetch live published comments for this blog article */
  const fetchPublishedComments = useCallback(async () => {
    try {
      setIsLoading(true);

      // If no slug in URL, resolve from first published blog
      let targetSlug = slug;
      if (!targetSlug) {
        const blogsRes = await API.get("/blogs");
        if (blogsRes.data?.blogs && blogsRes.data.blogs.length > 0) {
          targetSlug = blogsRes.data.blogs[0].slug || blogsRes.data.blogs[0]._id;
        }
      }

      if (targetSlug) {
        setResolvedSlug(targetSlug);
        const res = await API.get(`/comments/blog/${targetSlug}`);
        if (res.data?.success && Array.isArray(res.data.comments)) {
          if (res.data.comments.length > 0) {
            setComments(res.data.comments);
          } else {
            setComments(defaultStaticComments);
          }
        } else {
          setComments(defaultStaticComments);
        }
      } else {
        setComments(defaultStaticComments);
      }
    } catch (err) {
      console.error("Error loading blog comments:", err);
      setComments(defaultStaticComments);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPublishedComments();
  }, [fetchPublishedComments]);

  /* Reveal on scroll observer */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleReply = (comment) => {
    setReplyTo(comment);
    setSubmitSuccess("");
    setSubmitError("");

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => nameInputRef.current?.focus({ preventScroll: true }), 400);
  };

  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (submitError) setSubmitError("");
  };

  /* Submit comment -> Sent as DRAFT to backend */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const foundErrors = validateForm({ name, email, message });
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const payload = {
        blogSlug: resolvedSlug || slug,
        name: name.trim(),
        email: email.trim(),
        comment: message.trim(),
        parentCommentId: replyTo ? replyTo.id : null,
      };

      const res = await API.post("/comments", payload);

      if (res.data?.success) {
        // Success: comment was saved as draft for moderation
        setSubmitSuccess(
          "Thank you! Your comment has been submitted as a draft and will appear once approved by the administrator."
        );
        setName("");
        setEmail("");
        setMessage("");
        setErrors({});
        setReplyTo(null);
      } else {
        setSubmitError(res.data?.message || "Failed to submit comment.");
      }
    } catch (err) {
      console.error("Submit comment error:", err);
      const errMsg =
        err.response?.data?.message ||
        "Could not post your comment. Please check your connection and try again.";
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`blog-comments-section ${
        isVisible ? "blog-comments-section--visible" : ""
      }`}
      aria-labelledby="blog-comments-heading"
    >
      <div className="blog-comments-container">
        {/* Comments Header: '02 Comments' matching screenshot */}
        <div className="blog-comments-heading">
          <h2 className="blog-comments-title" id="blog-comments-heading">
            <span className="blog-comments-count">
              {String(commentCount).padStart(2, "0")}
            </span>
            {commentCount === 1 ? "Comment" : "Comments"}
          </h2>
        </div>

        {/* Comments List */}
        <div className="blog-comments-list">
          {isLoading ? (
            <div className="blog-comments-loading">
              <span className="blog-comments-spinner"></span>
              <p>Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <p className="blog-comments-empty">
              No comments yet. Be the first to share your thoughts on this article!
            </p>
          ) : (
            comments.map((comment) => (
              <BlogCommentCard
                key={comment.id}
                comment={comment}
                onReply={handleReply}
              />
            ))
          )}
        </div>

        {/* Reply / Comment Form */}
        <div className="blog-reply-section" ref={formRef}>
          <div className="blog-reply-header">
            <h3 className="blog-reply-title">
              {replyTo ? (
                <>
                  Reply to <span>{replyTo.name}</span>
                </>
              ) : (
                <>
                  Leave A <span>Reply</span>
                </>
              )}
            </h3>

            <p className="blog-reply-subtitle">
              Your email address will not be published. Required fields are marked{" "}
              <b>*</b>
            </p>
          </div>

          {replyTo && (
            <div className="blog-replying-chip">
              <span>
                Replying to <strong>{replyTo.name}</strong>
              </span>

              <button
                type="button"
                className="blog-cancel-reply"
                onClick={() => setReplyTo(null)}
                aria-label="Cancel reply"
                title="Cancel reply"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Success Notification */}
          {submitSuccess && (
            <div className="blog-comment-success" role="status">
              <span className="blog-comment-success-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5L10 17.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="blog-comment-success-text">
                <strong>Submission Received!</strong>
                <p>{submitSuccess}</p>
              </div>
            </div>
          )}

          {/* Error Notification */}
          {submitError && (
            <div className="blog-comment-error" role="alert">
              <span className="blog-comment-error-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="0.75" fill="currentColor" />
                </svg>
              </span>
              <span>{submitError}</span>
            </div>
          )}

          <form className="blog-comment-form" onSubmit={handleSubmit} noValidate>
            <div className="blog-form-row">
              <div className="blog-form-field">
                <label htmlFor="blog-comment-name">
                  Your Name <b>*</b>
                </label>
                <input
                  id="blog-comment-name"
                  ref={nameInputRef}
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  autoComplete="name"
                  maxLength={100}
                  className={errors.name ? "has-error" : ""}
                />
                {errors.name && (
                  <span className="blog-field-error">{errors.name}</span>
                )}
              </div>

              <div className="blog-form-field">
                <label htmlFor="blog-comment-email">
                  Email Address <b>*</b>
                </label>
                <input
                  id="blog-comment-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  autoComplete="email"
                  maxLength={254}
                  className={errors.email ? "has-error" : ""}
                />
                {errors.email && (
                  <span className="blog-field-error">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="blog-form-field">
              <label htmlFor="blog-comment-message">
                Your Comment <b>*</b>
              </label>
              <textarea
                id="blog-comment-message"
                rows="4"
                placeholder="Write your comment here..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  clearError("message");
                }}
                maxLength={MAX_MESSAGE_LENGTH}
                className={errors.message ? "has-error" : ""}
              />

              <div className="blog-textarea-footer">
                {errors.message ? (
                  <span className="blog-field-error">{errors.message}</span>
                ) : (
                  <span></span>
                )}
                <span className="blog-character-count">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="blog-post-comment-btn"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Submitting..." : "Post Comment"}</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 12L20 4L14 20L11.5 13L4 12Z"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BlogCommentsSection;
