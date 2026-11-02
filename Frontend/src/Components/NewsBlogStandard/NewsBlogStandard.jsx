import React, { useEffect, useMemo, useState } from "react";
import "./NewsBlogStandard.css";

import heroImage from "../../assets/news-hero-children.jpg";
import articleImage from "../../assets/news-delivery-article.jpg";
import recentChildren from "../../assets/news-recent-children.jpg";
import recentDelivery from "../../assets/news-recent-delivery.jpg";
import recentWater from "../../assets/news-recent-water.jpg";
import contactImage from "../../assets/news-contact-delivery.jpg";

/* ---------------------------------------------------------
   Edit the content below (dates, contact details, posts)
--------------------------------------------------------- */
const ALL = "All Posts";

const categories = [
  ALL,
  "Hydration Tips",
  "Delivery Updates",
  "Water Quality",
  "Eco & Refills",
];

const recentNews = [
  {
    id: 1,
    title: "Easy ways to help kids drink more water every day",
    date: "21 Oct 2026",
    category: "Hydration Tips",
    image: recentChildren,
  },
  {
    id: 2,
    title: "How to plan your weekly Alka Drops delivery",
    date: "14 Oct 2026",
    category: "Delivery Updates",
    image: recentDelivery,
  },
  {
    id: 3,
    title: "Why sealed and hygienic packing matters",
    date: "07 Oct 2026",
    category: "Water Quality",
    image: recentWater,
  },
  {
    id: 4,
    title: "Refill your jar and cut down on plastic waste",
    date: "30 Sep 2026",
    category: "Eco & Refills",
    image: recentDelivery,
  },
  {
    id: 5,
    title: "Simple hydration habits for the office",
    date: "22 Sep 2026",
    category: "Hydration Tips",
    image: recentChildren,
  },
];

const paragraphs = {
  intro1:
    "Drinking enough water is one of the simplest habits for everyday wellbeing, yet it is easy to forget when life gets busy. Having clean, good-tasting water always within reach is often the first step, and that is where a reliable doorstep delivery service makes a real difference.",
  intro2:
    "Alka Drops delivers pH 8.5+ alkaline drinking water in sealed, hygienic jars and bottles. Many families and offices choose it for its smooth, refreshing taste and for the convenience of never having to carry heavy water home.",
  intro3:
    "Our team handles every order with care, from filling and sealing to scheduling and delivery, so the water you open at home is the same fresh water that left our plant.",
  after1:
    "A steady supply changes small habits. Keeping a jar or dispenser at home or at the office makes it easy to refill a bottle, offer water to guests, or prepare tea and meals with water you trust.",
  after2:
    "Scheduled deliveries also remove the last-minute worry of running out. Choose the pack size that fits your household or workplace, and we will be there on the day you pick.",
  body1:
    "Not all water delivery services are the same. Whether you are choosing for your family, your shop or your office, a few simple points can help you decide with confidence.",
  body2:
    "At Alka Drops we focus on exactly these points, because dependable service is just as important as the water itself.",
  more1:
    "A note on alkaline water: choosing it is a matter of personal taste and preference. Alka Drops is made for everyday drinking, and it is not a substitute for medical advice. If you have a medical condition or special hydration needs, please speak with your doctor.",
  more2:
    "Getting started is easy. Browse the shop, pick your jars or bottles, and tell us where to deliver. Our team will take care of the rest and keep your supply fresh and on time.",
};

const checklist = [
  "Sealed, hygienic packing from the plant to your door",
  "Clear scheduling and on-time home delivery",
  "Consistent quality and a smooth, refreshing taste",
  "Friendly support whenever you have a question",
];

const tags = ["Alkaline Water", "Hydration", "Home Delivery"];

const CONTACT_PHONE_LABEL = "+91 98765 43210";
const CONTACT_PHONE_HREF = "tel:+919876543210";
const CONTACT_EMAIL = "info@example.com";

/* ---------------------------------------------------------
   Icons
--------------------------------------------------------- */
function Icon({ name }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
          <path d="M8 3v4M16 3v4M3.5 10h17" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "chat":
      return (
        <svg {...props}>
          <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="10.8" cy="10.8" r="6.3" />
          <path d="m15.5 15.5 4 4" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...props}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...props} strokeWidth={2.4}>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      );
    case "phone":
      return (
        <svg {...props}>
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "drop":
      return (
        <svg {...props}>
          <path d="M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z" />
          <path d="M9 15a3 3 0 0 0 3 3" />
        </svg>
      );
    case "link":
      return (
        <svg {...props}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...props}>
          <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...props}>
          <path d="M4 4l16 16M20 4 4 20" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...props}>
          <path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12Z" />
          <path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .7c-.8-.4-1.6-1.2-2-2l.7-1-1-2L9 9Z" />
        </svg>
      );
    default:
      return null;
  }
}

const NewsBlogStandard = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [showAll, setShowAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");

  /* ---------- reading progress ---------- */
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min((window.scrollY / total) * 100, 100) : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- copied toast ---------- */
  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  /* ---------- filtering ---------- */
  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recentNews.filter((news) => {
      const matchesSearch = news.title.toLowerCase().includes(query);
      const matchesCategory =
        activeCategory === ALL || news.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const categoryCount = (category) =>
    category === ALL
      ? recentNews.length
      : recentNews.filter((news) => news.category === category).length;

  /* ---------- sharing ---------- */
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = "Staying hydrated made simple with Alka Drops";

  const shareLinks = [
    {
      label: "Share on Facebook",
      icon: "facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    },
    {
      label: "Share on X",
      icon: "x",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      label: "Share on WhatsApp",
      icon: "whatsapp",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${pageUrl}`)}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
    } catch (error) {
      setCopied(false);
    }
  };

  /* ---------- comments ---------- */
  const submitComment = (event) => {
    event.preventDefault();

    const name = commentName.trim();
    const text = commentText.trim();

    if (!name || !text) return;

    setComments((previous) => [
      { id: Date.now(), name, text, date: "Just now" },
      ...previous,
    ]);
    setCommentName("");
    setCommentText("");
  };

  return (
    <section className="news-detail-page">
      <div className="news-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <span className="news-bg news-bg-left" aria-hidden="true"></span>
      <span className="news-bg news-bg-right" aria-hidden="true"></span>

      <div className="news-detail-container">
        {/* ================= ARTICLE ================= */}
        <main className="news-article">
          <div className="news-hero-image">
            <img src={heroImage} alt="Children holding drinking water bottles" />
            <div className="news-hero-overlay" />
            <span className="news-hero-tag">Hydration Tips</span>
            <span className="news-hero-ph">
              <Icon name="drop" /> pH 8.5+ Alkaline
            </span>
          </div>

          <div className="news-meta">
            <span>
              <Icon name="user" />
              Alka Drops Team
            </span>
            <span>
              <Icon name="calendar" />
              28 Oct 2026
            </span>
            <span>
              <Icon name="clock" />
              4 min read
            </span>
            <span>
              <Icon name="chat" />
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </span>
          </div>

          <h1 className="news-main-title">
            Staying Hydrated Made Simple: Fresh Alkaline Water Delivered to
            Your Door
          </h1>

          <div className="news-article-text">
            <p className="news-lead">{paragraphs.intro1}</p>
            <p>{paragraphs.intro2}</p>
            <p>{paragraphs.intro3}</p>
          </div>

          <blockquote className="news-quote">
            <span className="news-quote-mark" aria-hidden="true">“</span>
            <p>
              Good water should be simple: clean, fresh and at your door
              exactly when you need it.
            </p>
            <strong>The Alka Drops Team</strong>
          </blockquote>

          <div className="news-article-text">
            <p>{paragraphs.after1}</p>
            <p>{paragraphs.after2}</p>
          </div>

          <div className="news-second-image">
            <img
              src={articleImage}
              alt="Alka Drops delivery professional handing a water bottle to a customer"
            />
            <span className="news-image-chip">
              <Icon name="check" /> Free home delivery
            </span>
          </div>

          <h2 className="news-secondary-title">
            What to look for in a water delivery service
          </h2>

          <div className="news-article-text">
            <p>{paragraphs.body1}</p>
          </div>

          <ul className="news-check-list">
            {checklist.map((item) => (
              <li key={item}>
                <span>
                  <Icon name="check" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="news-article-text">
            <p>{paragraphs.body2}</p>

            {showAll && (
              <>
                <p>{paragraphs.more1}</p>
                <p>{paragraphs.more2}</p>
              </>
            )}
          </div>

          <button
            type="button"
            className="news-read-more"
            onClick={() => setShowAll((previous) => !previous)}
            aria-expanded={showAll}
          >
            {showAll ? "Show Less" : "Read More"}
            <span className={`news-read-more-icon ${showAll ? "open" : ""}`}>
              <Icon name="arrow" />
            </span>
          </button>

          {/* tags + share */}
          <div className="news-article-footer">
            <div className="news-tags">
              <strong>Related Tags</strong>
              <div>
                {tags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSearch(tag)}
                    title={`Search news for ${tag}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="news-share">
              <strong>Share</strong>
              <div className="news-social-links">
                {shareLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    title={item.label}
                  >
                    <Icon name={item.icon} />
                  </a>
                ))}
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label="Copy link"
                  title="Copy link"
                >
                  <Icon name="link" />
                </button>
              </div>
            </div>
          </div>

          {/* comments */}
          <div className="news-comments">
            <h3>
              {comments.length === 0
                ? "Comments"
                : `${String(comments.length).padStart(2, "0")} ${
                    comments.length === 1 ? "Comment" : "Comments"
                  }`}
            </h3>

            {comments.length === 0 ? (
              <p className="news-comments-empty">
                Be the first to share your thoughts on this article.
              </p>
            ) : (
              <div className="news-comment-list">
                {comments.map((comment) => (
                  <div className="news-comment" key={comment.id}>
                    <span className="news-comment-avatar">
                      {comment.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{comment.name}</strong>
                      <small>{comment.date}</small>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form className="news-comment-form" onSubmit={submitComment}>
              <input
                type="text"
                placeholder="Your name"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                aria-label="Your name"
                required
              />
              <textarea
                rows="4"
                placeholder="Write your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                aria-label="Your comment"
                required
              />
              <button type="submit">
                Post Comment
                <Icon name="arrow" />
              </button>
            </form>
          </div>
        </main>

        {/* ================= SIDEBAR ================= */}
        <aside className="news-sidebar">
          {/* search */}
          <div className="news-widget">
            <h3>Search</h3>

            <form className="news-search-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="search"
                placeholder="Search news..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search news"
              />
              <button type="submit" aria-label="Search">
                <Icon name="search" />
              </button>
            </form>
          </div>

          {/* category */}
          <div className="news-widget">
            <h3>Category</h3>

            <div className="news-category-list">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={`news-category-btn ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                >
                  <span>{category}</span>
                  <span className="news-category-count">
                    {categoryCount(category)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* recent news */}
          <div className="news-widget">
            <h3>Recent News</h3>

            <div className="news-recent-list">
              {filteredNews.length > 0 ? (
                filteredNews.map((news) => (
                  <a
                    className="news-recent-card"
                    href={`#recent-${news.id}`}
                    key={news.id}
                  >
                    <img src={news.image} alt="" />

                    <div className="news-recent-info">
                      <small>{news.category}</small>
                      <p>{news.title}</p>
                      <span>
                        <Icon name="calendar" /> {news.date}
                      </span>
                    </div>
                  </a>
                ))
              ) : (
                <div className="news-no-results">
                  <p>No news found.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory(ALL);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* contact card */}
          <div className="news-contact-card">
            <div className="news-contact-media">
              <img
                className="news-contact-image"
                src={contactImage}
                alt="Alka Drops delivery professional"
              />
              <div className="news-contact-overlay" />
              <div className="news-contact-badge" aria-hidden="true">
                <small>pH</small>
                <strong>8.5+</strong>
              </div>
            </div>

            <div className="news-contact-body">
              <h4>Need pure water today?</h4>
              <p>Order Alka Drops and get free home delivery.</p>

              <div className="news-contact-details">
                <a href={CONTACT_PHONE_HREF} className="news-contact-item">
                  <span className="news-contact-icon">
                    <Icon name="phone" />
                  </span>
                  <span>
                    <strong>Call Us</strong>
                    <small>{CONTACT_PHONE_LABEL}</small>
                  </span>
                </a>

                <a href={`mailto:${CONTACT_EMAIL}`} className="news-contact-item">
                  <span className="news-contact-icon">
                    <Icon name="mail" />
                  </span>
                  <span>
                    <strong>Our Mail</strong>
                    <small>{CONTACT_EMAIL}</small>
                  </span>
                </a>
              </div>

              <a className="news-contact-cta" href="/shop">
                Shop Now
                <Icon name="arrow" />
              </a>
            </div>
          </div>
        </aside>
      </div>

      {copied && (
        <div className="news-toast" role="status">
          <Icon name="check" /> Link copied
        </div>
      )}
    </section>
  );
};

export default NewsBlogStandard;