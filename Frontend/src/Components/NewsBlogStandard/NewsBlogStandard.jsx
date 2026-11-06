import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import "./NewsBlogStandard.css";
import contactImage from "../../assets/news-contact-delivery.png";

const ALL = "All Posts";
const CONTACT_PHONE_LABEL = "+91 98765 43210";
const CONTACT_PHONE_HREF = "tel:+919876543210";
const CONTACT_EMAIL = "info@alkadrops.com";

function Icon({ name }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "user":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "chat":
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "drop":
      return (
        <svg {...props}>
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...props}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case "phone":
      return (
        <svg {...props}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "link":
      return (
        <svg {...props}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...props}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
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

const formatDate = (dateString) => {
  if (!dateString) return "Recent";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recent";
  }
};

const NewsBlogStandard = () => {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [recentNews, setRecentNews] = useState([]);
  const [categories, setCategories] = useState([ALL]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  /* ---------- Fetch Blog Details and Recent Blogs using Axios ---------- */
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadBlogData = async () => {
      try {
        // 1. Fetch all blogs for recent list & categories
        const res = await API.get("/blogs");
        if (!isMounted) return;

        const list = res.data?.blogs || [];
        const publishedList = list.filter(
          (b) => !b.status || b.status.toLowerCase() === "published"
        );
        setAllBlogs(publishedList);
        setRecentNews(publishedList.slice(0, 5));

        const cats = [
          ALL,
          ...new Set(
            publishedList
              .map((b) => b.category?.trim())
              .filter((c) => Boolean(c))
          ),
        ];
        setCategories(cats);

        // 2. Resolve current blog by slug or id, or pick first published
        let activeTargetBlog = null;
        if (slug) {
          const detailRes = await API.get(`/blogs/${slug}`).catch(() => null);
          if (detailRes?.data?.blog) {
            activeTargetBlog = detailRes.data.blog;
          } else {
            activeTargetBlog = publishedList.find(
              (b) => b.slug === slug || b._id === slug
            );
          }
        } else if (publishedList.length > 0) {
          activeTargetBlog = publishedList[0];
        }

        if (activeTargetBlog && isMounted) {
          setBlog(activeTargetBlog);
          // Fetch live published comments
          try {
            const commentRes = await API.get(
              `/comments/blog/${activeTargetBlog.slug || activeTargetBlog._id}`
            );
            if (commentRes.data?.success && Array.isArray(commentRes.data.comments)) {
              setComments(commentRes.data.comments);
            } else {
              setComments([]);
            }
          } catch {
            setComments([]);
          }
        } else if (isMounted) {
          setError("Blog post not found.");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading blog details with axios:", err);
        setError("Failed to connect to database. Please check your backend.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadBlogData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

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

  /* ---------- category count calculation ---------- */
  const categoryCount = (category) =>
    category === ALL
      ? allBlogs.length
      : allBlogs.filter((news) => news.category?.trim() === category).length;

  /* ---------- filtering sidebar recent news ---------- */
  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allBlogs.filter((news) => {
      const titleMatch = (news.title || "").toLowerCase().includes(query);
      const categoryMatch =
        activeCategory === ALL || news.category?.trim() === activeCategory;

      return titleMatch && categoryMatch;
    });
  }, [search, activeCategory, allBlogs]);

  /* ---------- sharing ---------- */
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = blog?.title || "Alka Drops Alkaline Water Blog";

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
    } catch {
      setCopied(false);
    }
  };

  /* ---------- comments submission with Axios ---------- */
  const submitComment = async (event) => {
    event.preventDefault();

    const name = commentName.trim();
    const text = commentText.trim();
    if (!name || !text || !blog) return;

    setIsSubmittingComment(true);
    try {
      // Try sending comment to backend if endpoint available
      const blogId = blog._id || blog.id;
      if (blogId) {
        await API.post(`/blogs/${blogId}/comments`, {
          name,
          comment: text,
        }).catch(() => {});
      }

      setComments((prev) => [
        { id: Date.now(), name, comment: text, text, createdAt: new Date() },
        ...prev,
      ]);
      setCommentName("");
      setCommentText("");
    } catch (err) {
      console.warn("Could not save comment to server:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "120px 20px" }}>
        <div
          style={{
            display: "inline-block",
            width: "50px",
            height: "50px",
            border: "4px solid rgba(10, 63, 184, 0.15)",
            borderTopColor: "#0a3fb8",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ marginTop: "18px", color: "#4f6288", fontWeight: 650 }}>
          Loading article details from database...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 20px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ color: "#07225f", marginBottom: "12px" }}>
          Article Not Found
        </h2>
        <p style={{ color: "#4f6288", marginBottom: "24px" }}>
          {error || "The requested blog article does not exist or has been removed."}
        </p>
        <Link
          to="/blog"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            backgroundColor: "#0a3fb8",
            color: "#ffffff",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          &larr; Back to All Blogs
        </Link>
      </div>
    );
  }

  const imageSrc = blog.coverImage || blog.featuredImage || blog.image;
  const authorName = blog.author || blog.postedBy || "Alka Drops Team";
  const dateFormatted = formatDate(blog.createdAt || blog.date);
  const readTimeStr = blog.readTime || "4 min read";
  const tagsList = Array.isArray(blog.tags)
    ? blog.tags
    : typeof blog.tags === "string" && blog.tags
    ? blog.tags.split(",").map((t) => t.trim())
    : [];

  return (
    <section className="news-detail-page">
      <div className="news-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <span className="news-bg news-bg-left" aria-hidden="true" />
      <span className="news-bg news-bg-right" aria-hidden="true" />

      <div className="news-detail-container">
        {/* ================= ARTICLE ================= */}
        <main className="news-article">
          {imageSrc && (
            <div className="news-hero-image">
              <img
                src={imageSrc}
                alt={blog.title}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="news-hero-overlay" />
              <span className="news-hero-tag">
                {blog.category || "Alkaline Water"}
              </span>
              <span className="news-hero-ph">
                <Icon name="drop" /> pH 8.5+ Alkaline
              </span>
            </div>
          )}

          <div className="news-meta">
            <span>
              <Icon name="user" />
              {authorName}
            </span>
            <span>
              <Icon name="calendar" />
              {dateFormatted}
            </span>
            <span>
              <Icon name="clock" />
              {readTimeStr.includes("read") ? readTimeStr : `${readTimeStr} min read`}
            </span>
            <span>
              <Icon name="chat" />
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </span>
          </div>

          <h1 className="news-main-title">{blog.title}</h1>

          {/* Excerpt if present */}
          {blog.excerpt && (
            <div className="news-article-text">
              <p className="news-lead">{blog.excerpt}</p>
            </div>
          )}

          {/* Full Rich Article Content from TinyMCE */}
          <div
            className="news-article-text"
            style={{ marginTop: "20px", lineHeight: "1.8", color: "#334155" }}
            dangerouslySetInnerHTML={{
              __html: blog.content || blog.description || "<p>No content available.</p>",
            }}
          />

          {/* Blockquote if present */}
          {blog.quote && (
            <blockquote className="news-quote">
              <span className="news-quote-mark" aria-hidden="true">
                “
              </span>
              <p>{blog.quote}</p>
              <strong>{authorName}</strong>
            </blockquote>
          )}

          {/* tags + share */}
          <div className="news-article-footer">
            <div className="news-tags">
              <strong>Tags</strong>
              <div>
                {tagsList.length > 0 ? (
                  tagsList.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setSearch(tag)}
                      title={`Filter by ${tag}`}
                    >
                      {tag}
                    </button>
                  ))
                ) : (
                  <span style={{ fontSize: "13px", color: "#81796f" }}>
                    {blog.category || "Alkaline Water"}
                  </span>
                )}
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
        </main>

        {/* ================= SIDEBAR ================= */}
        <aside className="news-sidebar">
          {/* search */}
          <div className="news-widget">
            <h3>Search</h3>

            <form className="news-search-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search articles"
              />
              <button type="submit" aria-label="Search">
                <Icon name="search" />
              </button>
            </form>
          </div>

          {/* category */}
          <div className="news-widget">
            <h3>Categories</h3>

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
            <h3>Recent Articles</h3>

            <div className="news-recent-list">
              {filteredNews.length > 0 ? (
                filteredNews.slice(0, 5).map((news) => {
                  const rImg = news.coverImage || news.featuredImage || news.image;
                  const rDate = formatDate(news.createdAt || news.date);
                  const targetSlug = news.slug || news._id;

                  return (
                    <Link
                      className="news-recent-card"
                      to={`/blog/${targetSlug}`}
                      key={news._id || news.id}
                    >
                      {rImg ? (
                        <img
                          src={rImg}
                          alt={news.title}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "74px",
                            height: "74px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#0a3fb8",
                            color: "#ffffff",
                            borderRadius: "12px",
                          }}
                        >
                          💧
                        </div>
                      )}

                      <div className="news-recent-info">
                        <small>{news.category || "Alkaline Water"}</small>
                        <p>{news.title}</p>
                        <span>
                          <Icon name="calendar" /> {rDate}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="news-no-results">
                  <p>No articles found.</p>
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

              <Link className="news-contact-cta" to="/shop">
                Shop Now
                <Icon name="arrow" />
              </Link>
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
