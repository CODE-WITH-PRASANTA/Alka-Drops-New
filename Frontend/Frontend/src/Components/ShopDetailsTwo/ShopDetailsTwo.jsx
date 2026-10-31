
import React from "react";
import {
  Star,
  ArrowUpRight,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import "./ShopDetailsTwo.css";

const products = [
  {
    id: 1,
    name: "Tristique Curabitur Vivamus",
    category: "Premium Water",
    description: "Premium quality water container for everyday hydration.",
    price: 159,
    oldPrice: 184,
    rating: 4.9,
    reviews: 124,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=85",
  },
  {
    id: 2,
    name: "Ultricies Rhoncus",
    category: "Water Bottles",
    description: "Durable and stylish bottle for daily hydration.",
    price: 159,
    oldPrice: 184,
    rating: 4.8,
    reviews: 98,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&auto=format&fit=crop&q=85",
  },
  {
    id: 3,
    name: "Massa Dictum",
    category: "Mineral Water",
    description: "Refreshing mineral water for your everyday needs.",
    price: 159,
    oldPrice: 184,
    rating: 4.7,
    reviews: 87,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=85",
  },
  {
    id: 4,
    name: "Aqua Pure Classic",
    category: "Pure Water",
    description: "Fresh and pure hydration for home and office.",
    price: 209,
    oldPrice: 251,
    rating: 4.9,
    reviews: 156,
    badge: "New Arrival",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&auto=format&fit=crop&q=85",
  },
  {
    id: 5,
    name: "Crystal Blue Bottle",
    category: "Water Bottles",
    description: "Elegant bottle with a clean, modern design.",
    price: 293,
    oldPrice: 352,
    rating: 4.8,
    reviews: 76,
    badge: "",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=85",
  },
  {
    id: 6,
    name: "Fresh Drop Water",
    category: "Mineral Water",
    description: "Refreshing hydration for every occasion.",
    price: 134,
    oldPrice: 167,
    rating: 4.8,
    reviews: 112,
    badge: "Sale",
    image:
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&auto=format&fit=crop&q=85",
  },
];

const ShopDetailsTwo = ({
  onProductClick,
  onAddToCart,
  autoPlay = true,
  speed = 32,
}) => {
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleAddToCart = (event, product) => {
    event.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // Duplicate products to create a seamless infinite marquee.
  const sliderProducts = [...products, ...products];

  return (
    <section className="ShopDetailsTwo">
      <div className="ShopDetailsTwo-container">

        {/* SECTION HEADER */}
        <div className="ShopDetailsTwo-header">
          <div className="ShopDetailsTwo-headingContent">
            <span className="ShopDetailsTwo-eyebrow">
              <Sparkles size={14} />
              EXPLORE MORE
            </span>

            <h2>
              Related <span>Products</span>
            </h2>

            <p>
              Discover more premium products carefully selected
              for your everyday needs.
            </p>
          </div>

          <div className="ShopDetailsTwo-headerRight">
            <span className="ShopDetailsTwo-productCount">
              {products.length} PRODUCTS
            </span>

            <div className="ShopDetailsTwo-navigation">
              <button
                type="button"
                onClick={() =>
                  document
                    .querySelector(".ShopDetailsTwo-track")
                    ?.scrollBy({ left: -350, behavior: "smooth" })
                }
                aria-label="Scroll products left"
              >
                <ArrowLeft size={19} />
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .querySelector(".ShopDetailsTwo-track")
                    ?.scrollBy({ left: 350, behavior: "smooth" })
                }
                aria-label="Scroll products right"
              >
                <ArrowRight size={19} />
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCT SLIDER */}
        <div
          className={`ShopDetailsTwo-slider ${
            autoPlay ? "ShopDetailsTwo-sliderAuto" : ""
          }`}
        >
          <div
            className="ShopDetailsTwo-track"
            style={{
              "--ShopDetailsTwo-speed": `${speed}s`,
            }}
          >
            {sliderProducts.map((product, index) => (
              <article
                className="ShopDetailsTwo-card"
                key={`${product.id}-${index}`}
                onClick={() => handleProductClick(product)}
              >
                {/* PRODUCT IMAGE */}
                <div className="ShopDetailsTwo-imageWrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="ShopDetailsTwo-productImage"
                    loading="lazy"
                  />

                  {product.badge && (
                    <span className="ShopDetailsTwo-badge">
                      {product.badge}
                    </span>
                  )}

                  <button
                    type="button"
                    className="ShopDetailsTwo-quickView"
                    aria-label={`View ${product.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleProductClick(product);
                    }}
                  >
                    <ArrowUpRight size={19} />
                  </button>

                  <button
                    type="button"
                    className="ShopDetailsTwo-imageAdd"
                    onClick={(event) =>
                      handleAddToCart(event, product)
                    }
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>

                {/* PRODUCT INFORMATION */}
                <div className="ShopDetailsTwo-content">
                  <span className="ShopDetailsTwo-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <p className="ShopDetailsTwo-description">
                    {product.description}
                  </p>

                  <div className="ShopDetailsTwo-rating">
                    <div className="ShopDetailsTwo-stars">
                      <Star
                        size={13}
                        fill="#F5AB36"
                        color="#F5AB36"
                      />
                      <strong>{product.rating}</strong>
                    </div>

                    <span>({product.reviews} reviews)</span>
                  </div>

                  <div className="ShopDetailsTwo-footer">
                    <div className="ShopDetailsTwo-price">
                      <strong>{formatPrice(product.price)}</strong>
                      <del>{formatPrice(product.oldPrice)}</del>
                    </div>

                    <button
                      type="button"
                      className="ShopDetailsTwo-addButton"
                      aria-label={`Add ${product.name} to cart`}
                      onClick={(event) =>
                        handleAddToCart(event, product)
                      }
                    >
                      <ArrowUpRight size={19} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* BOTTOM INFORMATION */}
        <div className="ShopDetailsTwo-bottom">
          <div className="ShopDetailsTwo-bottomLine"></div>
          <span>
            Discover quality. Experience freshness.
          </span>
          <div className="ShopDetailsTwo-bottomLine"></div>
        </div>

      </div>
    </section>
  );
};

export default ShopDetailsTwo;
