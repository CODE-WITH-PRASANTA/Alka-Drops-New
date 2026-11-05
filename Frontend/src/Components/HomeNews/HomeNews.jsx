import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./HomeNews.css";

const AUTOPLAY_DELAY = 3500; // ms between slides
const MAX_PER_VIEW = 3; // clones needed for a seamless loop

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

const getPerView = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 700) return 2;
  return 1;
};

const NewsCard = ({ item, hidden }) => {
  const blogLink = `/blog/${item.slug || item._id}`;
  const imageSrc = item.coverImage || item.featuredImage || item.image;
  const authorName = item.author || item.postedBy || "Admin";
  const dateFormatted = formatDate(item.createdAt || item.date);

  return (
    <article
      className="home-news__card"
      aria-hidden={hidden ? "true" : undefined}
    >
      <div className="home-news__media">
        <div className="home-news__image-wrap">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={hidden ? "" : item.title}
              className="home-news__image"
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
          <span className="home-news__media-overlay" aria-hidden="true" />
        </div>

        <span className="home-news__date">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
            <path d="M3.5 10H20.5M8 3V7M16 3V7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
          {dateFormatted}
        </span>
      </div>

      <div className="home-news__body">
        <ul className="home-news__meta">
          <li className="home-news__meta-item">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4.5 20C4.5 16 7.9 13.5 12 13.5C16.1 13.5 19.5 16 19.5 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            By {authorName}
          </li>
          <li className="home-news__meta-item">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 7.5C3 6.4 3.9 5.5 5 5.5H9.5L11.5 8H19C20.1 8 21 8.9 21 10V17.5C21 18.6 20.1 19.5 19 19.5H5C3.9 19.5 3 18.6 3 17.5V7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            {item.category || "Alkaline Water"}
          </li>
        </ul>

        <h3 className="home-news__card-title">{item.title}</h3>

        <Link
          className="home-news__read-more"
          to={blogLink}
          tabIndex={hidden ? -1 : undefined}
          aria-label={hidden ? undefined : `Read more: ${item.title}`}
        >
          <span>Read More</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  );
};

const HomeNews = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const lockRef = useRef(false);
  const lockTimerRef = useRef(null);
  const touchStartRef = useRef(null);

  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isVisible, setIsVisible] = useState(false);
  const [perView, setPerView] = useState(getPerView);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  /* Fetch live articles using Axios */
  useEffect(() => {
    let isMounted = true;
    API.get("/blogs")
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.blogs || [];
        const published = list.filter(
          (b) => !b.status || b.status.toLowerCase() === "published"
        );
        setArticles(published);
      })
      .catch((err) => {
        console.error("HomeNews: failed to fetch blogs with axios:", err);
        setArticles([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const TOTAL = articles.length;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      { threshold: 0.12 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* Cards per screen: 3 desktop, 2 tablet, 1 mobile */
  useEffect(() => {
    const handleResize = () => setPerView(getPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Pause while browser tab is hidden */
  useEffect(() => {
    const handleVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => () => clearTimeout(lockTimerRef.current), []);

  const lock = useCallback(() => {
    lockRef.current = true;
    clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      lockRef.current = false;
    }, 1000);
  }, []);

  const unlock = useCallback(() => {
    clearTimeout(lockTimerRef.current);
    lockRef.current = false;
  }, []);

  const next = useCallback(() => {
    if (lockRef.current || TOTAL <= 1) return;
    lock();
    setAnimate(true);
    setIndex((current) => current + 1);
  }, [lock, TOTAL]);

  const prev = useCallback(() => {
    if (lockRef.current || TOTAL <= 1) return;
    lock();

    if (index === 0) {
      setAnimate(false);
      setIndex(TOTAL);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(TOTAL - 1);
        });
      });
    } else {
      setAnimate(true);
      setIndex((current) => current - 1);
    }
  }, [index, lock, TOTAL]);

  const goTo = useCallback(
    (target) => {
      if (lockRef.current || target === index % TOTAL) return;
      lock();
      setAnimate(true);
      setIndex(target);
    },
    [index, lock, TOTAL]
  );

  const handleTransitionEnd = (event) => {
    if (event.target !== trackRef.current || TOTAL === 0) return;

    if (index >= TOTAL) {
      setAnimate(false);
      setIndex(index - TOTAL);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
          unlock();
        });
      });
    } else {
      unlock();
    }
  };

  const isPaused = hoverPaused || tabHidden || reducedMotion;

  useEffect(() => {
    if (isPaused || !isVisible || TOTAL <= perView) return undefined;
    const timer = setTimeout(next, AUTOPLAY_DELAY);
    return () => clearTimeout(timer);
  }, [index, isPaused, isVisible, next, TOTAL, perView]);

  const handleTouchStart = (event) => {
    touchStartRef.current = event.touches[0].clientX;
    setHoverPaused(true);
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    setHoverPaused(false);
    if (start === null) return;

    const distance = event.changedTouches[0].clientX - start;
    if (Math.abs(distance) > 50) {
      if (distance < 0) next();
      else prev();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") next();
    if (event.key === "ArrowLeft") prev();
  };

  if (isLoading || TOTAL === 0) {
    return null; // Don't show empty or loading section on home if no published blogs
  }

  const activeDot = index % TOTAL;
  const clones = articles.slice(0, MAX_PER_VIEW);

  return (
    <section
      ref={sectionRef}
      className={`home-news ${isVisible ? "home-news--visible" : ""}`}
      id="news"
      aria-labelledby="home-news-title"
    >
      <div className="home-news__bg" aria-hidden="true">
        <span className="home-news__orb home-news__orb--one" />
        <span className="home-news__orb home-news__orb--two" />
      </div>

      <div className="home-news__container">
        <div className="home-news__header">
          <div className="home-news__titles">
            <span className="home-news__eyebrow">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              Latest Articles
            </span>
            <h2 id="home-news-title" className="home-news__main-title">
              Fresh News &amp; Hydration Guides
            </h2>
          </div>

          <div
            className="home-news__controls"
            role="group"
            aria-label="Slider navigation"
          >
            <button
              type="button"
              className="home-news__arrow-btn"
              onClick={prev}
              aria-label="Previous article"
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
            <button
              type="button"
              className="home-news__arrow-btn"
              onClick={next}
              aria-label="Next article"
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
          </div>
        </div>

        <div
          className="home-news__slider"
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Latest articles slider"
        >
          <div
            ref={trackRef}
            className={`home-news__track ${
              animate ? "home-news__track--animating" : ""
            }`}
            style={{
              transform: `translateX(-${(index * 100) / perView}%)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {articles.map((item) => (
              <div
                className="home-news__slide"
                key={item._id || item.id}
                style={{ flex: `0 0 ${100 / perView}%` }}
              >
                <NewsCard item={item} />
              </div>
            ))}

            {clones.map((item, cloneIndex) => (
              <div
                className="home-news__slide"
                key={`clone-${item._id || item.id}-${cloneIndex}`}
                style={{ flex: `0 0 ${100 / perView}%` }}
                aria-hidden="true"
              >
                <NewsCard item={item} hidden />
              </div>
            ))}
          </div>
        </div>

        <div
          className="home-news__dots"
          role="tablist"
          aria-label="Article slides"
        >
          {articles.map((item, dotIndex) => (
            <button
              key={item._id || item.id}
              type="button"
              role="tab"
              aria-selected={activeDot === dotIndex}
              aria-label={`Go to article ${dotIndex + 1}`}
              className={`home-news__dot ${
                activeDot === dotIndex ? "home-news__dot--active" : ""
              }`}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeNews;
