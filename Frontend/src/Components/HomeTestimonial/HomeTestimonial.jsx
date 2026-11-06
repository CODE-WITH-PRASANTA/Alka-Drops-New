import React, { useCallback, useEffect, useRef, useState } from "react";
import "./HomeTestimonial.css";
import API from "../../services/api";

const AUTOPLAY_DELAY = 3000; // ms between slides
const MAX_PER_VIEW = 3; // clones needed for a seamless loop
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";

const getPerView = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 700) return 2;
  return 1;
};

const Stars = ({ rating }) => (
  <div
    className="home-testimonial__stars"
    role="img"
    aria-label={`Rated ${rating} out of 5`}
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        viewBox="0 0 24 24"
        className={i < rating ? "is-filled" : ""}
        aria-hidden="true"
      >
        <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
      </svg>
    ))}
  </div>
);

const TestimonialCard = ({ item, hidden }) => {
  const avatarSrc = item.image || item.avatar || DEFAULT_AVATAR;
  const authorName = item.name || item.customer || "Customer";
  const authorRole = item.role || "Verified Customer";
  const commentText = item.text || item.comment || item.feedback || "";
  const ratingValue = Number(item.rating) || 5;

  return (
    <article
      className="home-testimonial__card"
      aria-hidden={hidden ? "true" : undefined}
    >
      <span className="home-testimonial__avatar">
        <img
          src={avatarSrc}
          alt={hidden ? "" : authorName}
          className="home-testimonial__avatar-image"
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />
      </span>

      <Stars rating={ratingValue} />

      <p className="home-testimonial__text">{commentText}</p>

      <div className="home-testimonial__author">
        <h3 className="home-testimonial__name">{authorName}</h3>
        <span className="home-testimonial__role">{authorRole}</span>
      </div>

      <span className="home-testimonial__quote" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
        </svg>
      </span>
    </article>
  );
};

const HomeTestimonial = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const lockRef = useRef(false);
  const lockTimerRef = useRef(null);
  const touchStartRef = useRef(null);

  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  /* Fetch live published reviews from backend */
  useEffect(() => {
    let isMounted = true;
    const fetchPublishedReviews = async () => {
      try {
        setIsLoading(true);
        const res = await API.get("/reviews", {
          params: { status: "Published" },
        });
        if (isMounted) {
          const list = Array.isArray(res.data?.reviews)
            ? res.data.reviews
            : Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : [];
          setTestimonials(list);
          setError(null);
        }
      } catch (err) {
        console.error("Error loading home testimonials:", err);
        if (isMounted) {
          setError("Failed to load client testimonials.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPublishedReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const TOTAL = testimonials.length;

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
    if (TOTAL === 0 || lockRef.current) return;
    lock();
    setAnimate(true);
    setIndex((current) => current + 1);
  }, [lock, TOTAL]);

  const prev = useCallback(() => {
    if (TOTAL === 0 || lockRef.current) return;
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
  }, [index, lock, TOTAL]);

  const goTo = useCallback(
    (target) => {
      if (TOTAL === 0 || lockRef.current || target === index % TOTAL) return;
      lock();
      setAnimate(true);
      setIndex(target);
    },
    [index, lock, TOTAL]
  );

  /* After sliding onto the cloned cards, silently jump back to the real ones */
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

  /* Automatic scroll, one card at a time */
  const isPaused = hoverPaused || tabHidden || reducedMotion;

  useEffect(() => {
    if (isPaused || !isVisible || TOTAL === 0) return undefined;
    const timer = setTimeout(next, AUTOPLAY_DELAY);
    return () => clearTimeout(timer);
  }, [index, isPaused, isVisible, next, TOTAL]);

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

  const activeDot = TOTAL > 0 ? index % TOTAL : 0;
  const clones = TOTAL > 0 ? testimonials.slice(0, Math.min(TOTAL, MAX_PER_VIEW)) : [];

  return (
    <section
      ref={sectionRef}
      className={`home-testimonial ${isVisible ? "home-testimonial--visible" : ""}`}
      id="testimonials"
      aria-labelledby="home-testimonial-title"
    >
      {/* Background decoration */}
      <div className="home-testimonial__bg" aria-hidden="true">
        <span className="home-testimonial__orb home-testimonial__orb--one" />
        <span className="home-testimonial__orb home-testimonial__orb--two" />
        <span className="home-testimonial__big-quote">&ldquo;</span>
      </div>

      <div className="home-testimonial__container">
        {/* Heading */}
        <div className="home-testimonial__heading">
          <span className="home-testimonial__eyebrow">
            <span className="home-testimonial__eyebrow-line"></span>
            CLIENT TESTIMONIALS
            <span className="home-testimonial__eyebrow-line"></span>
          </span>

          <h2 className="home-testimonial__title" id="home-testimonial-title">
            What Our <span>Clients</span> Say
          </h2>

          <p className="home-testimonial__subtitle">
            Families, offices and businesses across Bhubaneswar trust Alka
            Drops for pure alkaline water, delivered fresh to their door.
          </p>
        </div>

        {/* Dynamic content rendering */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--hts-muted)" }}>
            <p>Loading client testimonials...</p>
          </div>
        ) : error && TOTAL === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#e11d48" }}>
            <p>{error}</p>
          </div>
        ) : TOTAL === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--hts-muted)" }}>
            <p>No verified customer reviews published yet.</p>
          </div>
        ) : (
          <>
            {/* Slider */}
            <div
              className="home-testimonial__slider"
              role="region"
              aria-roledescription="carousel"
              aria-label="Client testimonials"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onMouseEnter={() => setHoverPaused(true)}
              onMouseLeave={() => setHoverPaused(false)}
              onFocus={() => setHoverPaused(true)}
              onBlur={() => setHoverPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="home-testimonial__viewport">
                <div
                  ref={trackRef}
                  className="home-testimonial__track"
                  style={{
                    "--home-testimonial-per-view": perView,
                    transform: `translateX(-${index * (100 / perView)}%)`,
                    transition: animate ? undefined : "none",
                  }}
                  onTransitionEnd={handleTransitionEnd}
                  aria-live={isPaused ? "polite" : "off"}
                >
                  {testimonials.map((item, idx) => (
                    <div
                      className="home-testimonial__slide"
                      key={item._id || item.id || `real-${idx}`}
                    >
                      <TestimonialCard item={item} />
                    </div>
                  ))}

                  {clones.map((item, idx) => (
                    <div
                      className="home-testimonial__slide"
                      key={`clone-${item._id || item.id || idx}`}
                    >
                      <TestimonialCard item={item} hidden />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="home-testimonial__controls">
              <button
                type="button"
                className="home-testimonial__arrow"
                onClick={prev}
                aria-label="Previous testimonial"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M19 12H5M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                className="home-testimonial__dots"
                role="tablist"
                aria-label="Choose testimonial"
              >
                {testimonials.map((item, i) => (
                  <button
                    type="button"
                    key={item._id || item.id || `dot-${i}`}
                    role="tab"
                    aria-selected={activeDot === i}
                    aria-label={`Show testimonial ${i + 1}`}
                    className={`home-testimonial__dot ${
                      activeDot === i ? "home-testimonial__dot--active" : ""
                    }`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="home-testimonial__arrow"
                onClick={next}
                aria-label="Next testimonial"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12H19M12 5L19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HomeTestimonial;
