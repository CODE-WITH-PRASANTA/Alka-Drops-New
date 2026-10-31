
import React, { useState } from "react";
import "./BlogCommentsSection.css";

import jamesImage from "../../assets/1st-comment.jpg";
import tysonImage from "../../assets/2nd-comment.jpg";

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
    (total, comment) =>
      total + 1 + countComments(comment.replies || []),
    0
  );

const BlogCommentCard = ({ comment, onReply, nested = false }) => {
  const initials = comment.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

  return (
    <div className={`blog-comment-card ${nested ? "nested-comment" : ""}`}>
      {comment.avatar ? (
        <img
          src={comment.avatar}
          alt={comment.name}
          className="blog-comment-avatar"
        />
      ) : (
        <div className="blog-comment-avatar avatar-placeholder">
          {initials}
        </div>
      )}

      <div className="blog-comment-content">
        <div className="blog-comment-header">
          <h4>{comment.name}</h4>
          <span>{comment.date}</span>
        </div>

        <p>{comment.message}</p>

        <button
          type="button"
          className="blog-reply-btn"
          onClick={() => onReply(comment)}
        >
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
};

const BlogCommentsSection = () => {
  const [comments, setComments] = useState(initialComments);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [replyTo, setReplyTo] = useState(null);
  const [success, setSuccess] = useState(false);

  const commentCount = countComments(comments);

  const addReply = (items, targetId, newComment) => {
    return items.map((item) => {
      if (item.id === targetId) {
        return {
          ...item,
          replies: [...(item.replies || []), newComment],
        };
      }

      return {
        ...item,
        replies: addReply(item.replies || [], targetId, newComment),
      };
    });
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setSuccess(false);

    document
      .getElementById("blog-comment-name")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    const newComment = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).toUpperCase(),
      message: message.trim(),
      avatar: null,
      replies: [],
    };

    if (replyTo) {
      setComments((prev) =>
        addReply(prev, replyTo.id, newComment)
      );
    } else {
      setComments((prev) => [...prev, newComment]);
    }

    setName("");
    setEmail("");
    setMessage("");
    setReplyTo(null);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 3500);
  };

  return (
    <section className="blog-comments-section">
      <div className="blog-comments-container">

        {/* Comments Heading */}

        <h2 className="blog-comments-title">
          {String(commentCount).padStart(2, "0")} Comments
        </h2>

        {/* Comments List */}

        <div className="blog-comments-list">
          {comments.map((comment) => (
            <BlogCommentCard
              key={comment.id}
              comment={comment}
              onReply={handleReply}
            />
          ))}
        </div>

        {/* Reply Form */}

        <div className="blog-reply-section">

          <h2 className="blog-reply-title">
            {replyTo
              ? `Reply to ${replyTo.name}`
              : "Leave A Reply"}
          </h2>

          {replyTo && (
            <button
              type="button"
              className="blog-cancel-reply"
              onClick={() => setReplyTo(null)}
            >
              Cancel reply
            </button>
          )}

          {/* Success Message */}

          {success && (
            <div className="blog-comment-success">
              <span>✓</span>
              Your comment has been posted successfully!
            </div>
          )}

          <form
            className="blog-comment-form"
            onSubmit={handleSubmit}
          >

            <div className="blog-form-row">

              <input
                id="blog-comment-name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

            <textarea
              placeholder="Your Comments"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            {/* Post Comment Button */}

            <button
              type="submit"
              className="blog-post-comment-btn"
            >
              <span>Post Comment</span>
              <span className="blog-button-ripple"></span>
            </button>

          </form>
        </div>

      </div>
    </section>
  );
};

export default BlogCommentsSection;
