import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Star,
  Droplets,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { useShop } from "../../context/ShopContext";
import "./Wishlist.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

const Wishlist = () => {
  const navigate = useNavigate();
  const {
    wishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    moveAllToCart,
    wishlistCount,
  } = useShop();

  const handleImageError = (e) => {
    if (e.currentTarget.src !== FALLBACK_IMAGE) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className="Wishlist-page">
      {/* Background Ambience */}
      <div className="Wishlist-bg" aria-hidden="true">
        <span className="Wishlist-glow one" />
        <span className="Wishlist-glow two" />
      </div>

      <div className="Wishlist-container">
        {/* Breadcrumb Navigation */}
        <nav className="Wishlist-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="Wishlist-breadcrumb-sep">/</span>
          <Link to="/shop">Shop</Link>
          <span className="Wishlist-breadcrumb-sep">/</span>
          <span className="active">Wishlist</span>
        </nav>

        {/* Page Header */}
        <header className="Wishlist-header">
          <div className="Wishlist-header-left">
            <span className="Wishlist-eyebrow">
              <Sparkles size={14} /> SAVED FOR LATER
            </span>
            <h1 className="Wishlist-title">
              My <span>Wishlist</span>
            </h1>
            <p className="Wishlist-desc">
              Your hand-picked collection of premium alkaline water bottles, jars, and hydration essentials.
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="Wishlist-header-actions">
              <button
                type="button"
                className="Wishlist-btn-moveall"
                onClick={moveAllToCart}
              >
                <ShoppingCart size={16} /> Move All to Cart
              </button>
              <button
                type="button"
                className="Wishlist-btn-clear"
                onClick={clearWishlist}
              >
                <Trash2 size={16} /> Clear Wishlist
              </button>
            </div>
          )}
        </header>

        {/* Empty State */}
        {wishlistCount === 0 ? (
          <div className="Wishlist-empty">
            <div className="Wishlist-empty-circle">
              <Heart size={44} />
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>
              Explore our range of naturally balanced pH 8.5+ alkaline water and tap the heart icon on any product to save it here.
            </p>
            <div className="Wishlist-empty-buttons">
              <button
                type="button"
                className="Wishlist-btn-explore"
                onClick={() => navigate("/shop")}
              >
                Explore Shop <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="Wishlist-btn-viewcart"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart size={17} /> View Cart
              </button>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="Wishlist-grid">
            {wishlist.map((item) => {
              const pId = item._id || item.id;
              const pName = item.name || item.title;
              const pImage = item.image || FALLBACK_IMAGE;
              const pSize = item.size || item.liter || "1 Litre";
              const pOldPrice = Number(item.oldPrice) || 0;
              const pPrice = Number(item.price) || 0;
              const hasDiscount = pOldPrice > pPrice;
              const discountPct =
                hasDiscount ? Math.round(((pOldPrice - pPrice) / pOldPrice) * 100) : item.discount || 0;

              return (
                <article className="Wishlist-card" key={pId}>
                  <div className="Wishlist-image-wrap">
                    <img
                      src={pImage}
                      alt={pName}
                      loading="lazy"
                      onError={handleImageError}
                    />

                    {item.badge && (
                      <span className="Wishlist-badge">{item.badge}</span>
                    )}

                    <span className="Wishlist-ph-chip">
                      <Droplets size={12} /> pH 8.5+
                    </span>

                    <button
                      type="button"
                      className="Wishlist-remove-btn"
                      onClick={() => removeFromWishlist(pId)}
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="Wishlist-content">
                    <div className="Wishlist-meta-row">
                      <span className="Wishlist-category">{item.category}</span>
                      <span className="Wishlist-size-tag">{pSize}</span>
                    </div>

                    <h3 className="Wishlist-product-name">{pName}</h3>

                    <p className="Wishlist-product-desc">
                      {item.description
                        ? item.description.replace(/<[^>]*>?/gm, "").slice(0, 85) + "..."
                        : "Pure pH 8.5+ natural alkaline hydration bottled fresh for your daily wellness."}
                    </p>

                    <div className="Wishlist-rating-row">
                      <Star size={14} fill="#FFB800" color="#FFB800" />
                      <strong>4.8</strong>
                      <span>(24 reviews)</span>
                      <span className="Wishlist-stock-status">
                        <PackageCheck size={13} /> In Stock
                      </span>
                    </div>

                    <div className="Wishlist-price-row">
                      <div className="Wishlist-prices">
                        <span className="Wishlist-price">{formatPrice(pPrice)}</span>
                        {hasDiscount && (
                          <del className="Wishlist-old-price">{formatPrice(pOldPrice)}</del>
                        )}
                        {discountPct > 0 && (
                          <span className="Wishlist-discount-tag">{discountPct}% OFF</span>
                        )}
                      </div>
                    </div>

                    <div className="Wishlist-card-actions">
                      <button
                        type="button"
                        className="Wishlist-btn-addcart"
                        onClick={() => moveToCart(item, 1)}
                      >
                        <ShoppingCart size={17} /> Move to Cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Back Link */}
        <div className="Wishlist-back-wrap">
          <Link to="/shop" className="Wishlist-back-link">
            <ArrowLeft size={16} /> Return to Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

