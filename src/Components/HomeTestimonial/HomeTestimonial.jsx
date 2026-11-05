import React, { useCallback, useEffect, useRef, useState } from "react";
import "./HomeTestimonial.css";

import testimonial1 from "../../assets/testimonial-1.png";
import testimonial2 from "../../assets/testimonial-2.jpeg";
import testimonial3 from "../../assets/testimonial-3.png";
import testimonial4 from "../../assets/testimonial-4.jpeg";
import testimonial5 from "../../assets/testimonial-5.jpeg";
import testimonial6 from "../../assets/testimonial-6.png";

const AUTOPLAY_DELAY = 3000; // ms between slides
const MAX_PER_VIEW = 3; // clones needed for a seamless loop

/* Replace these with your real customer reviews */
const testimonials = [
  {
    id: 1,
    image: testimonial1,
    name: "Priya Mohanty",
    role: "Homemaker, Nayapalli",
    rating: 5,
    text: "The 20L jar arrives on time every week and the water tastes so smooth. My whole family has switched to Alka Drops.",
  },
  {
    id: 2,
    image: testimonial2,
    name: "Rahul Sahoo",
    role: "Gym Owner, Saheed Nagar",
    rating: 5,
    text: "We keep the 1L bottles stocked for our members. They love the fresh taste and the sealed, hygienic packing.",
  },
  {
    id: 3,
    image: testimonial3,
    name: "Anita Das",
    role: "Office Manager, Patia",
    rating: 5,
    text: "Free delivery and a reliable team. Ordering for the office has become one less thing to worry about.",
  },
  {
    id: 4,
    image: testimonial4,
    name: "Suresh Patnaik",
    role: "Restaurant Owner, Jaydev Vihar",
    rating: 5,
    text: "Our guests notice the difference. Clean, refreshing water and a delivery partner we can truly depend on.",
  },
  {
    id: 5,
    image: testimonial5,
    name: "Sneha Mishra",
    role: "Teacher, Chandrasekharpur",
    rating: 5,
    text: "The 5L can with the easy-carry handle is perfect for our kitchen. Quality is always consistent.",
  },
  {
    id: 6,
    image: testimonial6,
    name: "Amit Behera",
    role: "Software Engineer, Khandagiri",
    rating: 5,
    text: "I like that I can order in a minute and the pH 8.5+ water is delivered right to my door. Highly recommended.",
  },
];

const TOTAL = testimonials.length;

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

const TestimonialCard = ({ item, hidden }) => (
  <article
    className="home-testimonial__card"
    aria-hidden={hidden ? "true" : undefined}
  >
    <span className="home-testimonial__avatar">
      <img
        src={item.image}
        alt={hidden ? "" : item.name}
        className="home-testimonial__avatar-image"
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    </span>

    <Stars rating={item.rating} />

    <p className="home-testimonial__text">{item.text}</p>

    <div className="home-testimonial__author">
      <h3 className="home-testimonial__name">{item.name}</h3>
      <span className="home-testimonial__role">{item.role}</span>
    </div>

    <span className="home-testimonial__quote" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
      </svg>
    </span>
  </article>
);

const HomeTestimonial = () => {
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
  const clones = testimonials.slice(0, MAX_PER_VIEW);

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
              {testimonials.map((item) => (
                <div className="home-testimonial__slide" key={item.id}>
                  <TestimonialCard item={item} />
                </div>
              ))}

              {clones.map((item) => (
                <div className="home-testimonial__slide" key={`clone-${item.id}`}>
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
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="home-testimonial__dots" role="tablist" aria-label="Choose testimonial">
            {testimonials.map((item, i) => (
              <button
                type="button"
                key={item.id}
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
              <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonial;