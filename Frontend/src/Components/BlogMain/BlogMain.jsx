import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./BlogMain.css";

const POSTS_PER_PAGE = 6;
const ALL_CATEGORY = "All Blogs";

// Helper to strip HTML tags for clean card excerpt preview
const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
};

// Format date helper
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

/* Page numbers with "..." when there are many pages */
const getPageList = (total, current) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const wanted = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const list = [];
  sorted.forEach((number, i) => {
    if (i > 0 && number - sorted[i - 1] > 1) list.push(`gap-${number}`);
    list.push(number);
  });

  return list;
};

const BlogMain = () => {
  const sectionRef = useRef(null);
  const panelRef = useRef(null);

  const [isVisible, setIsVisible] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);

  /* Fetch live blogs from backend MongoDB via Axios */
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    API.get("/blogs")
      .then((res) => {
        if (!isMounted) return;
        if (res.data && Array.isArray(res.data.blogs)) {
          // Filter to only published blogs for the public frontend
          const published = res.data.blogs.filter(
            (b) => !b.status || b.status.toLowerCase() === "published"
          );
          setBlogs(published);
        } else {
          setBlogs([]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching live blogs with axios:", err);
        setError("Failed to load articles. Please check server connection.");
        setBlogs([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      { threshold: 0.08 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* Dynamic Categories with live counts from database blogs */
  const categories = useMemo(() => {
    const rawCategories = blogs
      .map((b) => b.category?.trim())
      .filter((cat) => Boolean(cat));
    const uniqueNames = [...new Set(rawCategories)];

    return [
      { name: ALL_CATEGORY, count: blogs.length },
      ...uniqueNames.map((name) => ({
        name,
        count: blogs.filter((b) => b.category?.trim() === name).length,
      })),
    ];
  }, [blogs]);

  const filteredPosts = useMemo(
    () =>
      activeCategory === ALL_CATEGORY
        ? blogs
        : blogs.filter((b) => b.category?.trim() === activeCategory),
    [activeCategory, blogs]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const pagePosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const scrollToPanel = () => {
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCategory = (name) => {
    if (name === activeCategory) return;
    setHasInteracted(true);
    setActiveCategory(name);
    setPage(1);
  };

  const goToPage = (target) => {
    if (target < 1 || target > totalPages || target === page) return;
    setHasInteracted(true);
    setPage(target);
    scrollToPanel();
  };

  return (
    <section
      ref={sectionRef}
      className={`blog-main ${isVisible ? "blog-main--visible" : ""}`}
      aria-label="Alka Drops blog articles"
    >
      <div className="blog-main-bg" aria-hidden="true">
        <span className="blog-main-orb blog-main-orb-one" />
        <span className="blog-main-orb blog-main-orb-two" />
      </div>

      <div className="blog-main-container">
        <div className="blog-main-panel" ref={panelRef}>
          {/* Category filters */}
          {!isLoading && categories.length > 1 && (
            <div className="blog-main-filters" role="group" aria-label="Filter articles by category">
              {categories.map((category) => {
                const isActive = category.name === activeCategory;

                return (
                  <button
                    key={category.name}
                    type="button"
                    className={`blog-main-filter ${isActive ? "blog-main-filter--active" : ""}`}
                    onClick={() => handleCategory(category.name)}
                    aria-pressed={isActive}
                  >
                    {category.name === ALL_CATEGORY && (
                      <svg className="blog-main-filter-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M12 3C12 3 6 10 6 14.5C6 17.81 8.69 20.5 12 20.5C15.31 20.5 18 17.81 18 14.5C18 10 12 3 12 3Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <span>{category.name}</span>
                    <span className="blog-main-filter-count">{category.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "48px",
                  height: "48px",
                  border: "4px solid rgba(10, 63, 184, 0.15)",
                  borderTopColor: "#0a3fb8",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p style={{ marginTop: "16px", color: "#4f6288", fontWeight: 600 }}>
                Loading fresh articles...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error Message */}
          {!isLoading && error && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#bd3838" }}>
              <p style={{ fontSize: "16px", fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredPosts.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "#ffffff",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(3, 26, 92, 0.05)",
                maxWidth: "600px",
                margin: "30px auto",
              }}
            >
              <h3 style={{ fontSize: "22px", color: "#07225f", marginBottom: "8px" }}>
                No Blog Posts Found
              </h3>
              <p style={{ color: "#4f6288", fontSize: "14.5px" }}>
                {activeCategory === ALL_CATEGORY
                  ? "No published articles found in the database yet. Create and publish posts from the Admin Panel to see them live here."
                  : `No articles found in category "${activeCategory}".`}
              </p>
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && !error && filteredPosts.length > 0 && (
            <>
              <p className="blog-main-sr-only" role="status" aria-live="polite">
                Showing {pagePosts.length} of {filteredPosts.length} articles
                {activeCategory !== ALL_CATEGORY ? ` in ${activeCategory}` : ""}, page {page} of{" "}
                {totalPages}.
              </p>

              <div
                className={`blog-main-grid ${hasInteracted ? "blog-main-grid--animate" : ""}`}
                key={`${activeCategory}-${page}`}
              >
                {pagePosts.map((post, index) => {
                  const blogTarget = `/blog/${post.slug || post._id}`;
                  const imageSrc = post.coverImage || post.featuredImage || post.image;
                  const excerpt =
                    post.excerpt ||
                    stripHtml(post.description || post.content).slice(0, 140) + "…";
                  const dateStr = formatDate(post.createdAt || post.date);
                  const readTime = post.readTime || "4 min read";

                  return (
                    <article
                      className="blog-main-card"
                      key={post._id || post.id || index}
                      style={{ "--blog-main-delay": `${index * 0.09}s` }}
                    >
                      <Link
                        className="blog-main-media"
                        to={blogTarget}
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={post.title}
                            className="blog-main-image"
                            loading="lazy"
                            decoding="async"
                            draggable="false"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "linear-gradient(135deg, #0a3fb8, #1aa7e0)",
                              color: "#ffffff",
                              fontSize: "36px",
                            }}
                          >
                            💧
                          </div>
                        )}
                        <span className="blog-main-media-shade" />
                        <span className="blog-main-category">
                          {post.category || "Alkaline Water"}
                        </span>
                      </Link>

                      <div className="blog-main-body">
                        <h3 className="blog-main-title">
                          <Link to={blogTarget}>{post.title}</Link>
                        </h3>

                        <p className="blog-main-excerpt">{excerpt}</p>

                        <div className="blog-main-footer">
                          <ul className="blog-main-meta">
                            <li>
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <rect
                                  x="3.5"
                                  y="5"
                                  width="17"
                                  height="15.5"
                                  rx="2.5"
                                  stroke="currentColor"
                                  strokeWidth="1.9"
                                />
                                <path
                                  d="M3.5 10H20.5M8 3V7M16 3V7"
                                  stroke="currentColor"
                                  strokeWidth="1.9"
                                  strokeLinecap="round"
                                />
                              </svg>
                              {dateStr}
                            </li>
                            <li>
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="8.5"
                                  stroke="currentColor"
                                  strokeWidth="1.9"
                                />
                                <path
                                  d="M12 7.5V12L15 14"
                                  stroke="currentColor"
                                  strokeWidth="1.9"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {readTime.includes("read") ? readTime : `${readTime} min read`}
                            </li>
                          </ul>

                          <Link
                            className="blog-main-read-more"
                            to={blogTarget}
                            aria-label={`Read more: ${post.title}`}
                          >
                            <span>Read More</span>
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M5 12H19M12 5L19 12L12 19"
                                stroke="currentColor"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="blog-main-pagination" aria-label="Blog pagination">
                  <button
                    type="button"
                    className="blog-main-page-btn blog-main-page-nav"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M19 12H5M12 19L5 12L12 5"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <ul className="blog-main-page-list">
                    {getPageList(totalPages, page).map((item) =>
                      typeof item === "number" ? (
                        <li key={item}>
                          <button
                            type="button"
                            className={`blog-main-page-btn blog-main-page-number ${
                              item === page ? "blog-main-page-number--active" : ""
                            }`}
                            onClick={() => goToPage(item)}
                            aria-label={`Page ${item}`}
                            aria-current={item === page ? "page" : undefined}
                          >
                            {item}
                          </button>
                        </li>
                      ) : (
                        <li key={item} className="blog-main-page-gap" aria-hidden="true">
                          &hellip;
                        </li>
                      )
                    )}
                  </ul>

                  <button
                    type="button"
                    className="blog-main-page-btn blog-main-page-nav"
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 12H19M12 5L19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogMain;
