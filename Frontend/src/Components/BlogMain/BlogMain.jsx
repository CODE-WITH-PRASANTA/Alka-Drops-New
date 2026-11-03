import React, { useEffect, useMemo, useRef, useState } from "react";
import "./BlogMain.css";

import blog1 from "../../assets/blog-1.png";
import blog2 from "../../assets/blog-2.png";
import blog3 from "../../assets/blog-3.png";
import blog4 from "../../assets/blog-4.png";
import blog5 from "../../assets/blog-5.png";
import blog6 from "../../assets/blog-6.png";

const POSTS_PER_PAGE = 6;
const ALL_CATEGORY = "All Blogs";

/*
 * Replace with your real articles.
 * "slug" is used for the Read More link: /blog/<slug>
 * Posts 7 to 12 reuse the six images, add more images when you have them.
 */
const posts = [
  {
    id: 1,
    image: blog1,
    category: "Hydration Tips",
    title: "Staying Hydrated Made Simple: Fresh Alkaline Water at Your Door",
    excerpt:
      "Drinking enough water is one of the simplest habits for everyday well-being, yet it is easy to forget when life gets busy…",
    date: "28 Oct 2026",
    readTime: 4,
    slug: "staying-hydrated-made-simple",
  },
  {
    id: 2,
    image: blog2,
    category: "Delivery Updates",
    title: "How Alka Drops Home Delivery Keeps Life More Convenient",
    excerpt:
      "A steady supply of clean, alkaline water at your doorstep means no more last-minute runs or worries about running out…",
    date: "21 Oct 2026",
    readTime: 3,
    slug: "alka-drops-home-delivery",
  },
  {
    id: 3,
    image: blog3,
    category: "Water Quality",
    title: "Why pH 8.5+ Alkaline Water Makes a Real Difference",
    excerpt:
      "Alkaline water with a pH of 8.5+ helps maintain better hydration and balance in your daily routine…",
    date: "14 Oct 2026",
    readTime: 4,
    slug: "why-ph-8-5-alkaline-water",
  },
  {
    id: 4,
    image: blog4,
    category: "Eco & Refills",
    title: "Refill, Reuse, Reduce: A Simple Step Towards Less Plastic",
    excerpt:
      "Learn how choosing refill packs from Alka Drops can help you stay hydrated while reducing plastic waste…",
    date: "21 Sep 2026",
    readTime: 3,
    slug: "refill-reuse-reduce",
  },
  {
    id: 5,
    image: blog5,
    category: "Hydration Tips",
    title: "Simple Hydration Habits for the Office",
    excerpt:
      "Busy at work? These easy hydration habits can help you stay focused, energetic and healthy throughout the day…",
    date: "22 Sep 2026",
    readTime: 4,
    slug: "hydration-habits-for-the-office",
  },
  {
    id: 6,
    image: blog6,
    category: "Hydration Tips",
    title: "Easy Ways to Help Kids Drink More Water Every Day",
    excerpt:
      "Getting kids to drink enough water can be simple and fun with the right approach. Here are practical tips for families…",
    date: "15 Sep 2026",
    readTime: 3,
    slug: "help-kids-drink-more-water",
  },
  {
    id: 7,
    image: blog1,
    category: "Hydration Tips",
    title: "Hydration on the Go: Keeping Water With You All Day",
    excerpt:
      "Whether you are commuting, travelling or running errands, a few small habits make it easy to keep sipping through the day…",
    date: "10 Sep 2026",
    readTime: 3,
    slug: "hydration-on-the-go",
  },
  {
    id: 8,
    image: blog2,
    category: "Delivery Updates",
    title: "Schedule Your Water Delivery in Minutes",
    excerpt:
      "Ordering your next jar or bottle pack is quick and simple, so you can spend less time planning and more time enjoying fresh water…",
    date: "03 Sep 2026",
    readTime: 3,
    slug: "schedule-your-water-delivery",
  },
  {
    id: 9,
    image: blog3,
    category: "Delivery Updates",
    title: "Free Home Delivery: What You Need to Know",
    excerpt:
      "From ordering to your doorstep, here is a clear look at how our free home delivery works for homes and offices…",
    date: "27 Aug 2026",
    readTime: 4,
    slug: "free-home-delivery",
  },
  {
    id: 10,
    image: blog4,
    category: "Water Quality",
    title: "From Source to Sip: How We Keep Every Drop Pure",
    excerpt:
      "Take a closer look at the care that goes into filling, sealing and packing each Alka Drops jar, can and bottle…",
    date: "20 Aug 2026",
    readTime: 5,
    slug: "from-source-to-sip",
  },
  {
    id: 11,
    image: blog5,
    category: "Eco & Refills",
    title: "Why Reusable Jars Are Better for Your Home",
    excerpt:
      "Reusable water jars are practical, cost friendly and kinder to the environment. Here is why more families are making the switch…",
    date: "13 Aug 2026",
    readTime: 4,
    slug: "why-reusable-jars",
  },
  {
    id: 12,
    image: blog6,
    category: "Eco & Refills",
    title: "Small Steps to a Greener Kitchen",
    excerpt:
      "Tiny changes in how you store and use water can add up to less waste and a more sustainable home…",
    date: "06 Aug 2026",
    readTime: 3,
    slug: "small-steps-greener-kitchen",
  },
];

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

  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);

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

  /* Categories with live counts */
  const categories = useMemo(() => {
    const names = [...new Set(posts.map((post) => post.category))];

    return [
      { name: ALL_CATEGORY, count: posts.length },
      ...names.map((name) => ({
        name,
        count: posts.filter((post) => post.category === name).length,
      })),
    ];
  }, []);

  const filteredPosts = useMemo(
    () =>
      activeCategory === ALL_CATEGORY
        ? posts
        : posts.filter((post) => post.category === activeCategory),
    [activeCategory]
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

          <p className="blog-main-sr-only" role="status" aria-live="polite">
            Showing {pagePosts.length} of {filteredPosts.length} articles
            {activeCategory !== ALL_CATEGORY ? ` in ${activeCategory}` : ""}, page {page} of{" "}
            {totalPages}.
          </p>

          {/* Articles */}
          <div
            className={`blog-main-grid ${hasInteracted ? "blog-main-grid--animate" : ""}`}
            key={`${activeCategory}-${page}`}
          >
            {pagePosts.map((post, index) => (
              <article
                className="blog-main-card"
                key={post.id}
                style={{ "--blog-main-delay": `${index * 0.09}s` }}
              >
                <a
                  className="blog-main-media"
                  href={`/blog/${post.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img
                    src={post.image}
                    alt=""
                    className="blog-main-image"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                  <span className="blog-main-media-shade"></span>
                  <span className="blog-main-category">{post.category}</span>
                </a>

                <div className="blog-main-body">
                  <h3 className="blog-main-title">
                    <a href={`/blog/${post.slug}`}>{post.title}</a>
                  </h3>

                  <p className="blog-main-excerpt">{post.excerpt}</p>

                  <div className="blog-main-footer">
                    <ul className="blog-main-meta">
                      <li>
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
                          <path d="M3.5 10H20.5M8 3V7M16 3V7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                        </svg>
                        {post.date}
                      </li>
                      <li>
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
                          <path d="M12 7.5V12L15 14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {post.readTime} min read
                      </li>
                    </ul>

                    <a
                      className="blog-main-read-more"
                      href={`/blog/${post.slug}`}
                      aria-label={`Read more: ${post.title}`}
                    >
                      <span>Read More</span>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            ))}
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
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
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
                  <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogMain;