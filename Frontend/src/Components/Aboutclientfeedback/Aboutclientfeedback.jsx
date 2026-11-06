import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Aboutclientfeedback.css";
import API from "../../services/api";

const AUTOPLAY_DELAY = 3500; // ms between slides
const MAX_PER_VIEW = 4; // clones needed for a seamless loop

/* Cards per screen: 4 desktop, 3 laptop, 2 tablet, 1 mobile */
const getVisibleCards = () => {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth >= 1200) return 4;
  if (window.innerWidth >= 900) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "C";

/* Shows the photo, or coloured initials if the photo cannot load */
const Avatar = ({ name, image, hidden }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="about-feedback-avatar">
      {image && !failed ? (
        <img
          className="about-feedback-avatar-image"
          src={image}
          alt={hidden ? "" : name}
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="about-feedback-initials" aria-hidden="true">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};

const Stars = ({ rating }) => (
  <div
    className="about-feedback-stars"
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

const FeedbackCard = ({ testimonial, hidden }) => {
  const authorName = testimonial.name || testimonial.customer || "Customer";
  const authorRole = testimonial.role || "Verified Customer";
  const commentText = testimonial.feedback || testimonial.comment || testimonial.text || "";
  const ratingValue = Number(testimonial.rating) || 5;
  const authorImage = testimonial.image || testimonial.avatar;

  return (
    <article
      className="about-feedback-card"
      aria-hidden={hidden ? "true" : undefined}
    >
      <Avatar
        name={authorName}
        image={authorImage}
        hidden={hidden}
      />

      <Stars rating={ratingValue} />

      <p className="about-feedback-text">{commentText}</p>

      <div className="about-feedback-author">
        <h3 className="about-feedback-name">{authorName}</h3>
        <span className="about-feedback-role">{authorRole}</span>
      </div>

      <div className="about-feedback-quote" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 10H10C5.6 10 3 13.4 3 18v16h16V18h-8c0-3 2-4 5-4h4v-4Zm25 0H35c-4.4 0-7 3.4-7 8v16h16V18h-8c0-3 2-4 5-4h4v-4Z" />
        </svg>
      </div>
    </article>
  );
};

const ArrowButton = ({ direction, onClick, className }) => (
  <button
    type="button"
    className={`about-feedback-arrow ${className}`}
    onClick={onClick}
    aria-label={direction === "prev" ? "Previous testimonials" : "Next testimonials"}
  >
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {direction === "prev" ? (
        <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  </button>
);

const Aboutclientfeedback = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const lockRef = useRef(false);
  const lockTimerRef = useRef(null);
  const touchStartRef = useRef(null);

  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isVisible, setIsVisible] = useState(false);
  const [visibleCards, setVisibleCards] = useState(getVisibleCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Fetch live published reviews from backend */
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
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
        console.error("Failed to load client feedback:", err);
        if (isMounted) {
          setError("Failed to load client feedback.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const TOTAL = testimonials.length;

  /* Reveal when the section enters the viewport */
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

  /* Responsive number of visible cards */
  useEffect(() => {
    const handleResize = () => setVisibleCards(getVisibleCards());
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

  /* Lock so quick clicks cannot break the animation */
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

  const goToNext = useCallback(() => {
    if (TOTAL === 0 || lockRef.current) return;
    lock();
    setAnimate(true);
    setCurrentIndex((index) => index + 1);
  }, [lock, TOTAL]);

  const goToPrevious = useCallback(() => {
    if (TOTAL === 0 || lockRef.current) return;
    lock();

    if (currentIndex === 0) {
      // jump to the cloned end without animation, then slide back one
      setAnimate(false);
      setCurrentIndex(TOTAL);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
          setCurrentIndex(TOTAL - 1);
        });
      });
    } else {
      setAnimate(true);
      setCurrentIndex((index) => index - 1);
    }
  }, [currentIndex, lock, TOTAL]);

  const goToPosition = useCallback(
    (target) => {
      if (TOTAL === 0 || lockRef.current || target === currentIndex % TOTAL) return;
      lock();
      setAnimate(true);
      setCurrentIndex(target);
    },
    [currentIndex, lock, TOTAL]
  );

  /* After sliding onto the cloned cards, silently jump back to the real ones */
  const handleTransitionEnd = (event) => {
    if (event.target !== trackRef.current || TOTAL === 0) return;

    if (currentIndex >= TOTAL) {
      setAnimate(false);
      setCurrentIndex(currentIndex - TOTAL);
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

  /* Automatically slide one card at a time */
  const autoplayPaused = isPaused || tabHidden || reducedMotion;

  useEffect(() => {
    if (!isVisible || autoplayPaused || TOTAL === 0) return undefined;
    const timer = setTimeout(goToNext, AUTOPLAY_DELAY);
    return () => clearTimeout(timer);
  }, [currentIndex, isVisible, autoplayPaused, goToNext, TOTAL]);

  /* Swipe on touch screens */
  const handleTouchStart = (event) => {
    touchStartRef.current = event.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    setIsPaused(false);
    if (start === null) return;

    const distance = event.changedTouches[0].clientX - start;
    if (Math.abs(distance) > 50) {
      if (distance < 0) goToNext();
      else goToPrevious();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") goToNext();
    if (event.key === "ArrowLeft") goToPrevious();
  };

  const activeDot = TOTAL > 0 ? currentIndex % TOTAL : 0;
  const clones = TOTAL > 0 ? testimonials.slice(0, Math.min(TOTAL, MAX_PER_VIEW)) : [];

  return (
    <section
      ref={sectionRef}
      className={`about-feedback-section ${
        isVisible ? "feedback-section-visible" : ""
      }`}
      aria-labelledby="about-feedback-title"
    >
      {/* Background decoration */}
      <div className="about-feedback-bg" aria-hidden="true">
        <span className="about-feedback-circle about-feedback-circle-one" />
        <span className="about-feedback-circle about-feedback-circle-two" />
        <span className="about-feedback-big-quote">&ldquo;</span>
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`about-feedback-bubble about-feedback-bubble-${i + 1}`}
          />
        ))}
      </div>

      <div className="about-feedback-container">
        {/* Section Heading */}
        <div className="about-feedback-heading">
          <span className="about-feedback-subtitle">
            <span className="about-feedback-subtitle-line"></span>
            CLIENT TESTIMONIALS
            <span className="about-feedback-subtitle-line"></span>
          </span>

          <h2 className="about-feedback-title" id="about-feedback-title">
            What our <span>clients</span> say
          </h2>

          <p className="about-feedback-intro">
            Discover why our customers trust Alka Drops for their everyday
            drinking water needs.
          </p>
        </div>

        {/* Dynamic content rendering */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#4d6088" }}>
            <p>Loading client feedback...</p>
          </div>
        ) : error && TOTAL === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#e11d48" }}>
            <p>{error}</p>
          </div>
        ) : TOTAL === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#4d6088" }}>
            <p>No verified customer reviews published yet.</p>
          </div>
        ) : (
          <>
            {/* Testimonial Carousel */}
            <div
              className="about-feedback-carousel"
              role="region"
              aria-roledescription="carousel"
              aria-label="Client testimonials"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocusCapture={() => setIsPaused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsPaused(false);
                }
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <ArrowButton
                direction="prev"
                onClick={goToPrevious}
                className="about-feedback-arrow-side about-feedback-arrow-prev"
              />

              {/* Carousel Viewport */}
              <div className="about-feedback-viewport">
                <div
                  ref={trackRef}
                  className="about-feedback-grid"
                  style={{
                    "--about-feedback-per-view": visibleCards,
                    transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                    transition: animate ? undefined : "none",
                  }}
                  onTransitionEnd={handleTransitionEnd}
                  aria-live={autoplayPaused ? "polite" : "off"}
                >
                  {testimonials.map((testimonial, idx) => (
                    <div
                      className="about-feedback-slide"
                      key={testimonial._id || testimonial.id || `feedback-${idx}`}
                    >
                      <FeedbackCard testimonial={testimonial} />
                    </div>
                  ))}

                  {clones.map((testimonial, idx) => (
                    <div
                      className="about-feedback-slide"
                      key={`clone-${testimonial._id || testimonial.id || idx}`}
                    >
                      <FeedbackCard testimonial={testimonial} hidden />
                    </div>
                  ))}
                </div>
              </div>

              <ArrowButton
                direction="next"
                onClick={goToNext}
                className="about-feedback-arrow-side about-feedback-arrow-next"
              />
            </div>

            {/* Pagination Dots */}
            <div className="about-feedback-pagination">
              <ArrowButton
                direction="prev"
                onClick={goToPrevious}
                className="about-feedback-arrow-bottom"
              />

              <div
                className="about-feedback-dots"
                role="tablist"
                aria-label="Choose testimonial"
              >
                {testimonials.map((testimonial, index) => (
                  <button
                    type="button"
                    key={testimonial._id || testimonial.id || `dot-${index}`}
                    role="tab"
                    aria-selected={activeDot === index}
                    aria-label={`Show testimonial ${index + 1}`}
                    className={`about-feedback-dot ${
                      activeDot === index ? "active" : ""
                    }`}
                    onClick={() => goToPosition(index)}
                  />
                ))}
              </div>

              <ArrowButton
                direction="next"
                onClick={goToNext}
                className="about-feedback-arrow-bottom"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Aboutclientfeedback;
