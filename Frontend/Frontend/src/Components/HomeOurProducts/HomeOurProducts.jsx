import React, { useEffect, useRef, useState } from "react";
import "./HomeOurProducts.css";

import product1 from "../../assets/ourproduct-1.png";
import product2 from "../../assets/ourproduct-2.png";
import product3 from "../../assets/ourproduct-3.png";

const products = [
  {
    id: 1,
    image: product1,
    name: "Alka Drops 20L Water Jar",
    pack: "1 x 20L Jar",
    tag: "Best Seller",
    description:
      "Our family-size alkaline water jar, ideal for homes and offices. Pure, refreshing and delivered right to your doorstep.",
    price: 99,
    oldPrice: 120,
  },
  {
    id: 2,
    image: product2,
    name: "Alka Drops 1L Alkaline Bottle",
    pack: "12 x 1L Bottles",
    tag: "Daily Pick",
    description:
      "Handy 1-litre bottles for work, travel and the gym. Stay refreshed with pure alkaline water wherever your day takes you.",
    price: 240,
    oldPrice: 288,
  },
  {
    id: 3,
    image: product3,
    name: "Alka Drops 5L Water Can",
    pack: "2 x 5L Cans",
    tag: "Great Value",
    description:
      "A convenient 5-litre can with an easy-carry handle, perfect for small families, kitchens and weekend trips.",
    price: 180,
    oldPrice: 216,
  },
];

const formatPrice = (value) => `₹${value.toLocaleString("en-IN")}`;

const getDiscount = (price, oldPrice) =>
  Math.round(((oldPrice - price) / oldPrice) * 100);

const HomeOurProducts = () => {
  const sectionRef = useRef(null);
  const timeoutRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [flippedId, setFlippedId] = useState(null); // touch / keyboard
  const [addedId, setAddedId] = useState(null);

  // Reveal on scroll
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

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const toggleFlip = (id) => {
    setFlippedId((current) => (current === id ? null : id));
  };

  const handleKeyDown = (event, id) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFlip(id);
    }
  };

  const handleAddToCart = (id) => {
    setAddedId(id);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAddedId(null), 1800);
    // TODO: connect with your cart logic / API here
  };

  return (
    <section
      ref={sectionRef}
      className={`home-our-products ${
        isVisible ? "home-our-products--visible" : ""
      }`}
      id="our-products"
      aria-labelledby="home-our-products-title"
    >
      {/* Background decoration */}
      <div className="home-our-products__bg" aria-hidden="true">
        <span className="home-our-products__orb home-our-products__orb--one" />
        <span className="home-our-products__orb home-our-products__orb--two" />
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className={`home-our-products__bubble home-our-products__bubble--${i + 1}`}
          />
        ))}
      </div>

      <div className="home-our-products__container">
        {/* Heading */}
        <div className="home-our-products__heading">
          <span className="home-our-products__eyebrow">
            <span className="home-our-products__eyebrow-line"></span>
            OUR PRODUCTS
            <span className="home-our-products__eyebrow-line"></span>
          </span>

          <h2 className="home-our-products__title" id="home-our-products-title">
            Bottles We <span>Deliver</span>
          </h2>

          <p className="home-our-products__subtitle">
            Choose the perfect size of pure alkaline water for your home,
            office or travel, freshly packed and delivered to your door.
          </p>
        </div>

        {/* Product grid */}
        <div className="home-our-products__grid">
          {products.map((product, index) => {
            const isFlipped = flippedId === product.id;
            const isAdded = addedId === product.id;
            const discount = getDiscount(product.price, product.oldPrice);

            return (
              <article
                className="home-our-products__card"
                key={product.id}
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                <span className="home-our-products__card-top"></span>

                {/* Badges */}
                <span className="home-our-products__tag">{product.tag}</span>
                <span className="home-our-products__discount">
                  {discount}% OFF
                </span>

                {/* Simple flip: same bottle on both sides */}
                <div
                  className={`home-our-products__media ${
                    isFlipped ? "home-our-products__media--flipped" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Flip ${product.name} image`}
                  aria-pressed={isFlipped}
                  onClick={() => toggleFlip(product.id)}
                  onKeyDown={(event) => handleKeyDown(event, product.id)}
                >
                  <div className="home-our-products__flipper">
                    {/* Front */}
                    <div className="home-our-products__face home-our-products__face--front">
                      <span className="home-our-products__glow"></span>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="home-our-products__image"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    {/* Back (same image, same orientation) */}
                    <div className="home-our-products__face home-our-products__face--back">
                      <span className="home-our-products__glow"></span>
                      <img
                        src={product.image}
                        alt=""
                        aria-hidden="true"
                        className="home-our-products__image"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="home-our-products__content">
                  <h3 className="home-our-products__name">{product.name}</h3>

                  <span className="home-our-products__pack">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 3C12 3 6 10 6 14.5C6 17.81 8.69 20.5 12 20.5C15.31 20.5 18 17.81 18 14.5C18 10 12 3 12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                    {product.pack}
                  </span>

                  <p className="home-our-products__description">
                    {product.description}
                  </p>

                  <div className="home-our-products__price">
                    <strong>{formatPrice(product.price)}</strong>
                    <del>{formatPrice(product.oldPrice)}</del>
                  </div>

                  <button
                    type="button"
                    className={`home-our-products__button ${
                      isAdded ? "home-our-products__button--added" : ""
                    }`}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <span className="home-our-products__button-icon">
                      {isAdded ? (
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 12.5L10 17.5L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M3 4H5.5L7.6 15H18.2L20 7H6.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="9.5" cy="19.5" r="1.4" fill="currentColor" />
                          <circle cx="16.5" cy="19.5" r="1.4" fill="currentColor" />
                        </svg>
                      )}
                    </span>
                    <span className="home-our-products__button-text">
                      {isAdded ? "Added To Cart" : "Add To Cart"}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom strip */}
        <div className="home-our-products__bottom">
          <span><i></i> Free Home Delivery</span>
          <span><i></i> pH 8.5+ Alkaline Water</span>
          <span><i></i> Sealed &amp; Hygienic Packing</span>
          <span><i></i> Secure Payment</span>
        </div>
      </div>
    </section>
  );
};

export default HomeOurProducts;