import React, { useEffect, useRef, useState } from "react";
import "./BlogCommentsSection.css";

import jamesImage from "../../assets/1st-comment.jpg";
import tysonImage from "../../assets/2nd-comment.jpg";

const MAX_MESSAGE_LENGTH = 1000;

const initialComments = [
  {
    id: 1,
    name: "James Hayden",
    date: "JAN 31, 2021 at 2:40pm",
    message:
      "Proin ac quam et lectus vestibulum blandit. Nunc maximus nibh at placerat tincidunt. Nam sem lacus, ornare non ante sed, ultricies",
    avatar: jamesImage,
    replies: [
      {
        id: 2,
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

const addReply = (items, targetId, newComment) =>
  items.map((item) => {
    if (item.id === targetId) {
      return { ...item, replies: [...(item.replies || []), newComment] };
    }

    return { ...item, replies: addReply(item.replies || [], targetId, newComment) };
  });

/* Example: JAN 31, 2021 at 2:40pm */
const formatDate = (date) => {
  const day = date
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase();

  const time = date
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(/\s/g, "")
    .toLowerCase();

  return `${day} at ${time}`;
};

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const validate = ({ name, email, message }) => {
  const errors = {};

  if (name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (message.trim().length < 5) errors.message = "Please write your comment.";

  return errors;
};

/* Photo, or coloured initials if there is no photo / it fails to load */
const BlogAvatar = ({ name, avatar }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="blog-comment-avatar-ring">
      {avatar && !failed ? (
        <img
          src={avatar}
          alt={name}
          className="blog-comment-avatar"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="blog-comment-avatar avatar-placeholder" aria-hidden="true">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

const BlogCommentCard = ({ comment, onReply, nested = false }) => (
  <div
    id={`blog-comment-${comment.id}`}
    className={`blog-comment-card ${nested ? "nested-comment" : ""}`}
  >
    <BlogAvatar name={comment.name} avatar={comment.avatar} />

    <div className="blog-comment-content">
      <div className="blog-comment-header">
        <h4>{comment.name}</h4>

        <span className="blog-comment-date">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
            <path d="M12 7.5V12L15 14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {comment.date}
        </span>
      </div>

      <p>{comment.message}</p>

      <button
        type="button"
        className="blog-reply-btn"
        onClick={() => onReply(comment)}
        aria-label={`Reply to ${comment.name}`}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 8L4 13L10 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 13H14C17.3 13 20 15.7 20 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        Reply
      </button>

      {comment.replies?.map((reply) => (
        <BlogCommentCard
          key={reply.id}
          comment={reply}
          onReply={onReply}
          nested
        />
      ))}
    </div>
  </div>
);

/*
 * Optional prop: onSubmit(payload) -> Promise
 * Pass a function that saves the comment to your API. Without it,
 * comments are only kept in the page until it is refreshed.
 */
const BlogCommentsSection = ({ onSubmit }) => {
  const sectionRef = useRef(null);
  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState(initialComments);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const [replyTo, setReplyTo] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastAddedId, setLastAddedId] = useState(null);

  const commentCount = countComments(comments);

  /* Reveal on scroll */
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

  /* Scroll to a newly posted comment */
  useEffect(() => {
    if (!lastAddedId) return undefined;

    const timer = setTimeout(() => {
      document
        .getElementById(`blog-comment-${lastAddedId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);

    return () => clearTimeout(timer);
  }, [lastAddedId]);

  /* Hide the success message after a few seconds */
  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(false), 4500);
    return () => clearTimeout(timer);
  }, [success]);

  const handleReply = (comment) => {
    setReplyTo(comment);
    setSuccess(false);

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => nameInputRef.current?.focus({ preventScroll: true }), 450);
  };

  const clearError = (field) => {
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: "" }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const foundErrors = validate({ name, email, message });
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");

    const newComment = {
      id: Date.now(),
      name: name.trim(),
      date: formatDate(new Date()),
      message: message.trim(),
      avatar: null,
      replies: [],
    };

    try {
      if (typeof onSubmit === "function") {
        await onSubmit({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          replyToId: replyTo ? replyTo.id : null,
        });
      }

      if (replyTo) {
        setComments((previous) => addReply(previous, replyTo.id, newComment));
      } else {
        setComments((previous) => [...previous, newComment]);
      }

      setName("");
      setEmail("");
      setMessage("");
      setErrors({});
      setReplyTo(null);
      setSuccess(true);
      setLastAddedId(newComment.id);
    } catch {
      setSubmitError("We could not post your comment. Please try again.");
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
      <div className="blog-comments-bg" aria-hidden="true">
        <span className="blog-comments-orb blog-comments-orb-one" />
        <span className="blog-comments-orb blog-comments-orb-two" />
      </div>

      <div className="blog-comments-container">
        {/* Comments Heading */}
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
          {comments.length === 0 ? (
            <p className="blog-comments-empty">
              No comments yet. Be the first to share your thoughts!
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

        {/* Reply Form */}
        <div className="blog-reply-section" ref={formRef}>
          <h2 className="blog-reply-title">
            {replyTo ? (
              <>
                Reply to <span>{replyTo.name}</span>
              </>
            ) : (
              <>
                Leave A <span>Reply</span>
              </>
            )}
          </h2>

          <p className="blog-reply-subtitle">
            Your email address will not be published. Required fields are
            marked <b>*</b>
          </p>

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
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="blog-comment-success" role="status">
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5L10 17.5L19 7.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Your comment has been posted successfully!
            </div>
          )}

          {submitError && (
            <div className="blog-comment-error" role="alert">
              {submitError}
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
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "blog-comment-name-error" : undefined}
                  className={errors.name ? "has-error" : ""}
                />
                {errors.name && (
                  <span className="blog-field-error" id="blog-comment-name-error">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="blog-form-field">
                <label htmlFor="blog-comment-email">
                  Email <b>*</b>
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
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "blog-comment-email-error" : undefined}
                  className={errors.email ? "has-error" : ""}
                />
                {errors.email && (
                  <span className="blog-field-error" id="blog-comment-email-error">
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="blog-form-field">
              <label htmlFor="blog-comment-message">
                Your Comments <b>*</b>
              </label>
              <textarea
                id="blog-comment-message"
                placeholder="Write your comment here..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  clearError("message");
                }}
                maxLength={MAX_MESSAGE_LENGTH}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "blog-comment-message-error" : undefined}
                className={errors.message ? "has-error" : ""}
              />

              <div className="blog-textarea-footer">
                {errors.message ? (
                  <span className="blog-field-error" id="blog-comment-message-error">
                    {errors.message}
                  </span>
                ) : (
                  <span></span>
                )}
                <span className="blog-character-count">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>

            {/* Post Comment Button */}
            <button
              type="submit"
              className="blog-post-comment-btn"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Posting..." : "Post Comment"}</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12L20 4L14 20L11.5 13L4 12Z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BlogCommentsSection;