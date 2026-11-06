import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import API from "../../services/api";
import "./GallaryCards.css";

const CLOSE_DELAY = 400; // ms, must match the CSS transition

const baseImages = [
  {
    src: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1200&q=80",
    alt: "Fresh drinking water",
    title: "Fresh Drinking Water",
    category: "Alkaline Water",
  },
  {
    src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    alt: "Happy children",
    title: "Happy Little Moments",
    category: "Family",
  },
  {
    src: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
    alt: "Water bottle",
    title: "Pure in Every Bottle",
    category: "Our Bottles",
  },
  {
    src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
    alt: "Healthy lifestyle",
    title: "Healthy Lifestyle",
    category: "Wellness",
  },
  {
    src: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
    alt: "Refreshing water",
    title: "Refreshing Taste",
    category: "Alkaline Water",
  },
  {
    src: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    alt: "Healthy living",
    title: "Healthy Living",
    category: "Wellness",
  },
];

const defaultImages = [...baseImages, ...baseImages].map((image, index) => ({
  ...image,
  id: index + 1,
}));

const ITEMS_PER_PAGE = 6; // photos shown on each page

const pad = (number) => String(number).padStart(2, "0");

/* Page numbers with "..." when there are many pages: 1 ... 4 5 6 ... 12 */
const getPageList = (total, current) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const list = [];
  sorted.forEach((number, i) => {
    if (i > 0 && number - sorted[i - 1] > 1) list.push("gap-" + number);
    list.push(number);
  });

  return list;
};

/* Small droplet shown if a photo cannot load */
const DropFallback = () => (
  <span className="gallery-fallback" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C12 3 6 10 6 14.5C6 17.81 8.69 20.5 12 20.5C15.31 20.5 18 17.81 18 14.5C18 10 12 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const GallaryCards = () => {
  const sectionRef = useRef(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const touchStartRef = useRef(null);
  const thumbsRef = useRef(null);
  const contentRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [failed, setFailed] = useState({});
  const [page, setPage] = useState(1);
  const [pageChanged, setPageChanged] = useState(false);

  // Dynamic gallery data fetched via Axios
  const [galleryData, setGalleryData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchGalleryImages = async () => {
      try {
        const res = await API.get("/gallery", {
          params: { status: "active" },
        });
        if (
          isMounted &&
          res.data?.success &&
          Array.isArray(res.data.items) &&
          res.data.items.length > 0
        ) {
          const formatted = res.data.items.map((item, index) => ({
            src: item.image,
            alt: item.alt || item.title || "Alka Drops Gallery",
            title: item.title,
            category: item.category || "Alkaline Water",
            id: item._id || index + 1,
          }));
          setGalleryData(formatted);
        }
      } catch (err) {
        console.error("Error fetching live gallery images:", err);
      }
    };

    fetchGalleryImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const images = galleryData.length > 0 ? galleryData : defaultImages;
  const TOTAL = images.length;
  const TOTAL_PAGES = Math.max(1, Math.ceil(TOTAL / ITEMS_PER_PAGE));

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("next");
  const [lightboxMounted, setLightboxMounted] = useState(false);
  const [lightboxActive, setLightboxActive] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const markFailed = (src) => setFailed((previous) => ({ ...previous, [src]: true }));

  /* Pagination */
  const goToPage = (target) => {
    if (target < 1 || target > TOTAL_PAGES || target === page) return;

    setPageChanged(true);
    setPage(target);

    // bring the top of the gallery back into view
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const pageImages = images.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const firstShown = TOTAL > 0 ? startIndex + 1 : 0;
  const lastShown = Math.min(startIndex + pageImages.length, TOTAL);

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
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  /* Open / close (smooth in and out) */
  const openLightbox = (index, event) => {
    triggerRef.current = event?.currentTarget || document.activeElement;
    clearTimeout(closeTimerRef.current);

    setDirection("next");
    setImageLoading(true);
    setActiveIndex(index);
    setLightboxMounted(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setLightboxActive(true));
    });
  };

  const closeLightbox = useCallback(() => {
    setLightboxActive(false);
    clearTimeout(closeTimerRef.current);

    closeTimerRef.current = setTimeout(() => {
      setLightboxMounted(false);
      if (triggerRef.current && triggerRef.current.focus) triggerRef.current.focus();
    }, CLOSE_DELAY);
  }, []);

  const showNext = useCallback(() => {
    setDirection("next");
    setImageLoading(true);
    setActiveIndex((current) => (TOTAL > 0 ? (current + 1) % TOTAL : 0));
  }, [TOTAL]);

  const showPrevious = useCallback(() => {
    setDirection("prev");
    setImageLoading(true);
    setActiveIndex((current) => (TOTAL > 0 ? (current - 1 + TOTAL) % TOTAL : 0));
  }, [TOTAL]);

  const showImage = (index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? "next" : "prev");
    setImageLoading(true);
    setActiveIndex(index);
  };

  /* Keyboard, scroll lock and focus while the preview is open */
  useEffect(() => {
    if (!lightboxMounted) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(() => {
      if (closeButtonRef.current) closeButtonRef.current.focus();
    }, 60);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        showNext();
      } else if (event.key === "ArrowLeft") {
        showPrevious();
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll("button");
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxMounted, closeLightbox, showNext, showPrevious]);

  const safeActiveIndex = activeIndex >= TOTAL ? 0 : activeIndex;
  const activeItem = images[safeActiveIndex] || images[0] || {};

  /* Preload the neighbouring photos and keep the active thumbnail in view */
  useEffect(() => {
    if (!lightboxMounted || TOTAL === 0) return;

    [(safeActiveIndex + 1) % TOTAL, (safeActiveIndex - 1 + TOTAL) % TOTAL].forEach((i) => {
      if (images[i]?.src) {
        const preload = new Image();
        preload.src = images[i].src;
      }
    });

    const strip = thumbsRef.current;
    const thumb = strip && strip.children[safeActiveIndex];
    if (strip && thumb) {
      strip.scrollTo({
        left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [safeActiveIndex, lightboxMounted, TOTAL, images]);

  /* Swipe on touch screens */
  const handleTouchStart = (event) => {
    touchStartRef.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (start === null) return;

    const distance = event.changedTouches[0].clientX - start;
    if (Math.abs(distance) > 50) {
      if (distance < 0) showNext();
      else showPrevious();
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`gallery-section ${isVisible ? "gallery-section--visible" : ""}`}
      aria-labelledby="gallery-title"
    >
      <div className="gallery-bg" aria-hidden="true">
        <span className="gallery-orb gallery-orb-one" />
        <span className="gallery-orb gallery-orb-two" />
      </div>

      <div className="gallery-container">
        {/* Heading */}
        <div className="gallery-heading">
          <span className="gallery-eyebrow">
            <span className="gallery-eyebrow-line"></span>
            OUR GALLERY
            <span className="gallery-eyebrow-line"></span>
          </span>

          <h2 className="gallery-title" id="gallery-title">
            Moments of <span>Pure Refreshment</span>
          </h2>

          <p className="gallery-subtitle">
            A glimpse into the Alka Drops world: fresh water, healthy habits
            and happy customers.
          </p>
        </div>

        <div className="gallery-content" ref={contentRef}>
        {/* Grid */}
        <div
          className={`gallery-grid ${pageChanged ? "gallery-grid--animate" : ""}`}
          key={page}
        >
          {pageImages.map((pageImage, pageIndex) => {
            const image = pageImage;
            const index = startIndex + pageIndex;

            return (
            <button
              className="gallery-item"
              key={image.id}
              type="button"
              onClick={(event) => openLightbox(index, event)}
              aria-label={`Open image ${index + 1}: ${image.title}`}
              aria-haspopup="dialog"
              style={{ "--gallery-delay": `${pageIndex * 0.1}s` }}
            >
              {failed[image.src] ? (
                <DropFallback />
              ) : (
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  onError={() => markFailed(image.src)}
                />
              )}

              <span className="gallery-number" aria-hidden="true">
                {pad(index + 1)}
              </span>

              <span className="gallery-overlay">
                <span className="gallery-plus" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </span>

                <span className="gallery-caption">
                  <small>{image.category}</small>
                  <strong>{image.title}</strong>
                </span>
              </span>
            </button>
            );
          })}
        </div>

        {/* Pagination */}
        {TOTAL_PAGES > 1 && (
          <nav className="gallery-pagination" aria-label="Gallery pagination">
            <p className="gallery-pagination-info">
              Showing <strong>{pad(firstShown)}</strong> to{" "}
              <strong>{pad(lastShown)}</strong> of <strong>{pad(TOTAL)}</strong> photos
            </p>

            <div className="gallery-pagination-controls">
              <button
                type="button"
                className="gallery-page-btn gallery-page-nav"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Prev</span>
              </button>

              <ul className="gallery-page-list">
                {getPageList(TOTAL_PAGES, page).map((item) =>
                  typeof item === "number" ? (
                    <li key={item}>
                      <button
                        type="button"
                        className={`gallery-page-btn gallery-page-number ${
                          item === page ? "gallery-page-number--active" : ""
                        }`}
                        onClick={() => goToPage(item)}
                        aria-label={`Page ${item}`}
                        aria-current={item === page ? "page" : undefined}
                      >
                        {item}
                      </button>
                    </li>
                  ) : (
                    <li key={item} className="gallery-page-gap" aria-hidden="true">
                      &hellip;
                    </li>
                  )
                )}
              </ul>

              <button
                type="button"
                className="gallery-page-btn gallery-page-nav"
                onClick={() => goToPage(page + 1)}
                disabled={page === TOTAL_PAGES}
                aria-label="Next page"
              >
                <span>Next</span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </nav>
        )}
        </div>
      </div>

      {/* Image preview */}
      {lightboxMounted &&
        createPortal(
          <div
            ref={dialogRef}
            className={`gallery-lightbox ${
              lightboxActive ? "gallery-lightbox--active" : ""
            }`}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            <div className="gallery-lightbox-top">
              <span className="gallery-counter">
                <strong>{pad(safeActiveIndex + 1)}</strong> / {pad(TOTAL)}
              </span>

              <button
                ref={closeButtonRef}
                className="gallery-close"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeLightbox();
                }}
                aria-label="Close preview"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div
              className="gallery-stage"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                className="gallery-arrow gallery-left"
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <figure
                className="gallery-figure"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="gallery-frame">
                  {imageLoading && <span className="gallery-spinner" aria-hidden="true"></span>}

                  <img
                    key={safeActiveIndex}
                    className={`gallery-full-image gallery-full-image--${direction} ${
                      imageLoading ? "gallery-full-image--loading" : ""
                    }`}
                    src={activeItem.src}
                    alt={activeItem.alt}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                    draggable="false"
                  />
                </div>

                <figcaption className="gallery-full-caption">
                  <small>{activeItem.category}</small>
                  <strong>{activeItem.title}</strong>
                </figcaption>
              </figure>

              <button
                className="gallery-arrow gallery-right"
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div
              className="gallery-thumbs"
              ref={thumbsRef}
              onClick={(event) => event.stopPropagation()}
            >
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={`gallery-thumb ${
                    index === safeActiveIndex ? "gallery-thumb--active" : ""
                  }`}
                  onClick={() => showImage(index)}
                  aria-label={`Show image ${index + 1}: ${image.title}`}
                  aria-current={index === safeActiveIndex ? "true" : undefined}
                >
                  {failed[image.src] ? (
                    <DropFallback />
                  ) : (
                    <img src={image.src} alt="" draggable="false" />
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default GallaryCards;