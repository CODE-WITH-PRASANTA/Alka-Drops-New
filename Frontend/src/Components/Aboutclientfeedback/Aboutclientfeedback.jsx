import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Aboutclientfeedback.css";

const AUTOPLAY_DELAY = 3500; // ms between slides
const MAX_PER_VIEW = 4; // clones needed for a seamless loop

const testimonials = [
  {
    id: 1,
    name: "Kelly Coleman",
    role: "Happy Customer",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "The water quality is excellent, and the delivery service is always reliable. I am very happy with Alka Drops!",
  },
  {
    id: 2,
    name: "Philip Mendez",
    role: "Regular Customer",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "Excellent service and fresh drinking water every time. The team is friendly, professional, and always on time.",
  },
  {
    id: 3,
    name: "Eugene Freeman",
    role: "Business Customer",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "We have been using Alka Drops for our daily water needs. Their consistent quality and quick delivery are impressive.",
  },
  {
    id: 4,
    name: "Sophia Williams",
    role: "Happy Customer",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "A wonderful experience from ordering to delivery. The water tastes fresh, and the service makes everything easy.",
  },
  {
    id: 5,
    name: "Daniel Carter",
    role: "Regular Customer",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "Great customer support and dependable deliveries. Alka Drops has become our trusted choice for drinking water.",
  },
  {
    id: 6,
    name: "Olivia Martin",
    role: "Happy Customer",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "Ordering is simple, delivery is smooth, and the quality is consistently good. I would happily recommend their service.",
  },
];

const TOTAL = testimonials.length;

/* Cards per screen: 4 desktop, 3 laptop, 2 tablet, 1 mobile */
const getVisibleCards = () => {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth >= 1200) return 4;
  if (window.innerWidth >= 900) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

const FeedbackCard = ({ testimonial, hidden }) => (
  <article
    className="about-feedback-card"
    aria-hidden={hidden ? "true" : undefined}
  >
    <Avatar
      name={testimonial.name}
      image={testimonial.image}
      hidden={hidden}
    />

    <Stars rating={testimonial.rating} />

    <p className="about-feedback-text">{testimonial.feedback}</p>

    <div className="about-feedback-author">
      <h3 className="about-feedback-name">{testimonial.name}</h3>
      <span className="about-feedback-role">{testimonial.role}</span>
    </div>

    <div className="about-feedback-quote" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 10H10C5.6 10 3 13.4 3 18v16h16V18h-8c0-3 2-4 5-4h4v-4Zm25 0H35c-4.4 0-7 3.4-7 8v16h16V18h-8c0-3 2-4 5-4h4v-4Z" />
      </svg>
    </div>
  </article>
);

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
    if (lockRef.current) return;
    lock();
    setAnimate(true);
    setCurrentIndex((index) => index + 1);
  }, [lock]);

  const goToPrevious = useCallback(() => {
    if (lockRef.current) return;
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
  }, [currentIndex, lock]);

  const goToPosition = useCallback(
    (target) => {
      if (lockRef.current || target === currentIndex % TOTAL) return;
      lock();
      setAnimate(true);
      setCurrentIndex(target);
    },
    [currentIndex, lock]
  );

  /* After sliding onto the cloned cards, silently jump back to the real ones */
  const handleTransitionEnd = (event) => {
    if (event.target !== trackRef.current) return;

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
    if (!isVisible || autoplayPaused) return undefined;
    const timer = setTimeout(goToNext, AUTOPLAY_DELAY);
    return () => clearTimeout(timer);
  }, [currentIndex, isVisible, autoplayPaused, goToNext]);

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

  const activeDot = currentIndex % TOTAL;
  const clones = testimonials.slice(0, MAX_PER_VIEW);

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
              {testimonials.map((testimonial) => (
                <div className="about-feedback-slide" key={testimonial.id}>
                  <FeedbackCard testimonial={testimonial} />
                </div>
              ))}

              {clones.map((testimonial) => (
                <div className="about-feedback-slide" key={`clone-${testimonial.id}`}>
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
                key={testimonial.id}
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
      </div>
    </section>
  );
};

export default Aboutclientfeedback;