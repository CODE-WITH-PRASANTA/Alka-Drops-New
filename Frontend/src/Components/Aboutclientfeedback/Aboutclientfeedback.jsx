import React, { useEffect, useRef, useState } from "react";
import "./Aboutclientfeedback.css";

const testimonials = [
  {
    id: 1,
    name: "Kelly Coleman",
    role: "Happy Customer",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "The water quality is excellent, and the delivery service is always reliable. I am very happy with Alka Drops!",
  },
  {
    id: 2,
    name: "Philip Mendez",
    role: "Regular Customer",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "Excellent service and fresh drinking water every time. The team is friendly, professional, and always on time.",
  },
  {
    id: 3,
    name: "Eugene Freeman",
    role: "Business Customer",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "We have been using Alka Drops for our daily water needs. Their consistent quality and quick delivery are impressive.",
  },
  {
    id: 4,
    name: "Sophia Williams",
    role: "Happy Customer",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "A wonderful experience from ordering to delivery. The water tastes fresh, and the service makes everything easy.",
  },
  {
    id: 5,
    name: "Daniel Carter",
    role: "Regular Customer",
    image:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "Great customer support and dependable deliveries. Alka Drops has become our trusted choice for drinking water.",
  },
  {
    id: 6,
    name: "Olivia Martin",
    role: "Happy Customer",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&h=200&q=85",
    feedback:
      "Ordering is simple, delivery is smooth, and the quality is consistently good. I would happily recommend their service.",
  },
];

const Aboutclientfeedback = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const cardRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [stepSize, setStepSize] = useState(0);

  // Animate the cards when the section enters the viewport.
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Responsive number of visible cards.
  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth <= 540) {
        setVisibleCards(1);
      } else if (window.innerWidth <= 850) {
        setVisibleCards(2);
      } else {
        setVisibleCards(4);
      }
    };

    updateVisibleCards();

    window.addEventListener("resize", updateVisibleCards);

    return () => {
      window.removeEventListener("resize", updateVisibleCards);
    };
  }, []);

  // Measure card width and gap for accurate sliding.
  useEffect(() => {
    const measureCards = () => {
      if (!trackRef.current || !cardRef.current) return;

      const cardWidth = cardRef.current.getBoundingClientRect().width;
      const styles = window.getComputedStyle(trackRef.current);
      const gap = parseFloat(styles.columnGap) || 0;

      setStepSize(cardWidth + gap);
    };

    measureCards();

    const resizeObserver = new ResizeObserver(measureCards);

    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }

    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }

    window.addEventListener("resize", measureCards);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureCards);
    };
  }, [visibleCards]);

  const maxIndex = Math.max(0, testimonials.length - visibleCards);

  // Keep the current position valid when resizing.
  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

  // Automatically slide one card at a time.
  useEffect(() => {
    if (!isVisible || isPaused || maxIndex === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((index) => (index >= maxIndex ? 0 : index + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [isVisible, isPaused, maxIndex]);

  const goToPrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const goToNext = () => {
    setCurrentIndex((index) => (index >= maxIndex ? 0 : index + 1));
  };

  const goToPosition = (index) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  return (
    <section
      ref={sectionRef}
      className={`about-feedback-section ${
        isVisible ? "feedback-section-visible" : ""
      }`}
    >
      <div className="about-feedback-container">
        {/* Section Heading */}
        <div className="about-feedback-heading">
          <span className="about-feedback-subtitle">
            CLIENT TESTIMONIALS
          </span>

          <h2>What our clients say</h2>

          <p className="about-feedback-intro">
            Discover why our customers trust Alka Drops for their everyday
            drinking water needs.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div
          className="about-feedback-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsPaused(false);
            }
          }}
        >
          {/* Previous Arrow */}
          <button
            type="button"
            className="about-feedback-arrow"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            aria-label="Previous testimonials"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Carousel Viewport */}
          <div className="about-feedback-viewport">
            <div
              ref={trackRef}
              className="about-feedback-grid"
              style={{
                transform: `translateX(-${currentIndex * stepSize}px)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <article
                  key={testimonial.id}
                  ref={index === 0 ? cardRef : null}
                  className={`about-feedback-card ${
                    isVisible ? "feedback-card-visible" : ""
                  }`}
                  style={{ "--card-index": index }}
                >
                  {/* Customer Image */}
                  <div className="about-feedback-avatar">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      loading="lazy"
                    />
                  </div>

                  {/* Feedback */}
                  <p className="about-feedback-text">
                    {testimonial.feedback}
                  </p>

                  {/* Customer Details */}
                  <div className="about-feedback-author">
                    <h3>{testimonial.name}</h3>
                    <span>{testimonial.role}</span>
                  </div>

                  {/* Quotation Icon */}
                  <div
                    className="about-feedback-quote"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 48 48"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 10H10C5.6 10 3 13.4 3 18v16h16V18h-8c0-3 2-4 5-4h4v-4Zm25 0H35c-4.4 0-7 3.4-7 8v16h16V18h-8c0-3 2-4 5-4h4v-4Z" />
                    </svg>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            className="about-feedback-arrow"
            onClick={goToNext}
            aria-label="Next testimonials"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="about-feedback-pagination">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              type="button"
              key={index}
              className={`about-feedback-dot ${
                currentIndex === index ? "active" : ""
              }`}
              onClick={() => goToPosition(index)}
              aria-label={`Show testimonial position ${index + 1}`}
              aria-current={currentIndex === index ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Aboutclientfeedback;