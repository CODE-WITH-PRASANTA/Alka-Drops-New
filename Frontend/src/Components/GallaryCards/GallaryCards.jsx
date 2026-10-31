
import React, { useEffect, useState } from "react";
import "./GallaryCards.css";

const images = [
  {
    src: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=80",
    alt: "Fresh drinking water",
  },
  {
    src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    alt: "Happy children",
  },
  {
    src: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80",
    alt: "Water bottle",
  },
  {
    src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
    alt: "Healthy lifestyle",
  },
  {
    src: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
    alt: "Refreshing water",
  },
  {
    src: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    alt: "Healthy living",
  },
];

const GallaryCards = () => {
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    if (activeImage === null) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }

      if (event.key === "ArrowRight") {
        setActiveImage((prev) => (prev + 1) % images.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveImage(
          (prev) => (prev - 1 + images.length) % images.length
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage]);

  return (
    <section className="gallery-section">
      <div className="gallery-container">
        <div className="gallery-grid">
          {images.map((image, index) => (
            <button
              className="gallery-item"
              key={image.src}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={`Open image ${index + 1}`}
            >
              <img src={image.src} alt={image.alt} />

              <span className="gallery-overlay">
                <span className="gallery-plus">+</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeImage !== null && (
        <div
          className="gallery-lightbox"
          onClick={() => setActiveImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            className="gallery-close"
            type="button"
            onClick={() => setActiveImage(null)}
            aria-label="Close preview"
          >
            &times;
          </button>

          <button
            className="gallery-arrow gallery-left"
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation();
              setActiveImage(
                (activeImage - 1 + images.length) % images.length
              );
            }}
          >
            &#10094;
          </button>

          <img
            className="gallery-full-image"
            src={images[activeImage].src}
            alt={images[activeImage].alt}
            onClick={(event) => event.stopPropagation()}
          />

          <button
            className="gallery-arrow gallery-right"
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation();
              setActiveImage((activeImage + 1) % images.length);
            }}
          >
            &#10095;
          </button>
        </div>
      )}
    </section>
  );
};

export default GallaryCards;
