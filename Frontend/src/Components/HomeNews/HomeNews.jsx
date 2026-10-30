import React, { useCallback, useEffect, useRef, useState } from "react";
import "./HomeNews.css";

import news1 from "../../assets/homenews-1.jpg";
import news2 from "../../assets/homenews-2.jpg";
import news3 from "../../assets/homenews-3.jpg";
import news4 from "../../assets/homenews-4.jpg";
import news5 from "../../assets/homenews-5.jpg";
import news6 from "../../assets/homenews-6.webp";

const AUTOPLAY_DELAY = 3000; // ms between slides
const MAX_PER_VIEW = 3; // clones needed for a seamless loop

/* Replace with your real articles. "link" is where Read More goes. */
const articles = [
  {
    id: 1,
    image: news1,
    date: "28 October 2026",
    author: "Admin",
    category: "Alkaline Water",
    title: "5 Reasons Families Are Switching to Alkaline Water",
    link: "/news/alkaline-water-for-families",
  },
  {
    id: 2,
    image: news2,
    date: "21 October 2026",
    author: "Admin",
    category: "Health Tips",
    title: "How Much Water Should You Really Drink Every Day?",
    link: "/news/daily-water-intake",
  },
  {
    id: 3,
    image: news3,
    date: "14 October 2026",
    author: "Admin",
    category: "Water Care",
    title: "Storing Drinking Water Safely: Simple Hygiene Tips",
    link: "/news/storing-drinking-water",
  },
  {
    id: 4,
    image: news4,
    date: "07 October 2026",
    author: "Admin",
    category: "Lifestyle",
    title: "Stay Hydrated at Work: Easy Habits That Make a Difference",
    link: "/news/hydration-at-work",
  },
  {
    id: 5,
    image: news5,
    date: "30 September 2026",
    author: "Admin",
    category: "Buying Guide",
    title: "20L Jar, 5L Can or 1L Bottles? Choosing the Right Pack",
    link: "/news/choosing-the-right-pack",
  },
  {
    id: 6,
    image: news6,
    date: "23 September 2026",
    author: "Admin",
    category: "Alkaline Water",
    title: "What Does pH 8.5+ Mean and Why Does It Matter?",
    link: "/news/what-is-ph-8-5",
  },
];

const TOTAL = articles.length;

const getPerView = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 700) return 2;
  return 1;
};

const NewsCard = ({ item, hidden }) => (
  <article
    className="home-news__card"
    aria-hidden={hidden ? "true" : undefined}
  >
    <div className="home-news__media">
      <div className="home-news__image-wrap">
        <img
          src={item.image}
          alt={hidden ? "" : item.title}
          className="home-news__image"
          loading="lazy"
          decoding="async"
          draggable="false"
        />
        <span className="home-news__media-overlay" aria-hidden="true"></span>
      </div>

      <span className="home-news__date">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
          <path d="M3.5 10H20.5M8 3V7M16 3V7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
        {item.date}
      </span>
    </div>

    <div className="home-news__body">
      <ul className="home-news__meta">
        <li className="home-news__meta-item">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4.5 20C4.5 16 7.9 13.5 12 13.5C16.1 13.5 19.5 16 19.5 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          By {item.author}
        </li>
        <li className="home-news__meta-item">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 7.5C3 6.4 3.9 5.5 5 5.5H9.5L11.5 8H19C20.1 8 21 8.9 21 10V17.5C21 18.6 20.1 19.5 19 19.5H5C3.9 19.5 3 18.6 3 17.5V7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          {item.category}
        </li>
      </ul>

      <h3 className="home-news__card-title">{item.title}</h3>

      <a
        className="home-news__read-more"
        href={item.link}
        tabIndex={hidden ? -1 : undefined}
        aria-label={hidden ? undefined : `Read more: ${item.title}`}
      >
        <span>Read More</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  </article>
);

const HomeNews = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const lockRef = useRef(false);
  const lockTimerRef = useRef(null);
  const touchStartRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [perView, setPerView] = useState(getPerView);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

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

  /* Pause while the browser tab is hidden */
  useEffect(() => {
    const handleVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => () => clearTimeout(lockTimerRef.current), []);

  /* Lock so quick clicks can't break the animation */
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
    if (lockRef.current) return;
    lock();
    setAnimate(true);
    setIndex((current) => current + 1);
  }, [lock]);

  const prev = useCallback(() => {
    if (lockRef.current) return;
    lock();

    if (index === 0) {
      // jump to the cloned end without animation, then slide back one
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
  }, [index, lock]);

  const goTo = useCallback(
    (target) => {
      if (lockRef.current || target === index % TOTAL) return;
      lock();
      setAnimate(true);
      setIndex(target);
    },
    [index, lock]
  );

  /* After sliding onto the cloned cards, silently jump back to the real ones */
  const handleTransitionEnd = (event) => {
    if (event.target !== trackRef.current) return;

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

  /* Automatic scroll, one card at a time */
  const isPaused = hoverPaused || tabHidden || reducedMotion;

  useEffect(() => {
    if (isPaused || !isVisible) return undefined;
    const timer = setTimeout(next, AUTOPLAY_DELAY);
    return () => clearTimeout(timer);
  }, [index, isPaused, isVisible, next]);

  /* Swipe on touch screens */
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

  const activeDot = index % TOTAL;
  const clones = articles.slice(0, MAX_PER_VIEW);

  return (
    <section
      ref={sectionRef}
      className={`home-news ${isVisible ? "home-news--visible" : ""}`}
      id="news"
      aria-labelledby="home-news-title"
    >
      {/* Background decoration */}
      <div className="home-news__bg" aria-hidden="true">
        <span className="home-news__orb home-news__orb--one" />
        <span className="home-news__orb home-news__orb--two" />
      </div>

      <div className="home-news__container">
        {/* Heading + arrows */}
        <div className="home-news__heading">
          <div className="home-news__heading-text">
            <span className="home-news__eyebrow">
              <span className="home-news__eyebrow-line"></span>
              NEWS &amp; ARTICLES
            </span>

            <h2 className="home-news__title" id="home-news-title">
              Latest <span>Articles</span>
            </h2>

            <p className="home-news__subtitle">
              Tips, guides and updates on healthy hydration and pure alkaline
              water from the Alka Drops team.
            </p>
          </div>

          <div className="home-news__arrows">
            <button
              type="button"
              className="home-news__arrow"
              onClick={prev}
              aria-label="Previous articles"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              className="home-news__arrow"
              onClick={next}
              aria-label="Next articles"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          className="home-news__slider"
          role="region"
          aria-roledescription="carousel"
          aria-label="Latest articles"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
          onFocus={() => setHoverPaused(true)}
          onBlur={() => setHoverPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="home-news__viewport">
            <div
              ref={trackRef}
              className="home-news__track"
              style={{
                "--home-news-per-view": perView,
                transform: `translateX(-${index * (100 / perView)}%)`,
                transition: animate ? undefined : "none",
              }}
              onTransitionEnd={handleTransitionEnd}
              aria-live={isPaused ? "polite" : "off"}
            >
              {articles.map((item) => (
                <div className="home-news__slide" key={item.id}>
                  <NewsCard item={item} />
                </div>
              ))}

              {clones.map((item) => (
                <div className="home-news__slide" key={`clone-${item.id}`}>
                  <NewsCard item={item} hidden />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="home-news__dots" role="tablist" aria-label="Choose article">
          {articles.map((item, i) => (
            <button
              type="button"
              key={item.id}
              role="tab"
              aria-selected={activeDot === i}
              aria-label={`Show article ${i + 1}`}
              className={`home-news__dot ${
                activeDot === i ? "home-news__dot--active" : ""
              }`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeNews;