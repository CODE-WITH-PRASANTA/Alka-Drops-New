
import React, { useState } from "react";
import {
  ShoppingCart,
  Minus,
  Plus,
  Star,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
  X,
} from "lucide-react";

import "./ShopDetailsOne.css";

// Product images cropped from your supplied reference screenshots.
// Keep these files inside src/assets/.
import mainImage from "../../assets/ourproduct-1.png";
import thumbOne from "../../assets/ourproduct-2.png";
import thumbTwo from "../../assets/ourproduct-3.png";
import thumbThree from "../../assets/whychoose-2.png";

const ShopDetailsOne = ({ onAddToCart }) => {
  const [activeImage, setActiveImage] = useState(mainImage);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [added, setAdded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const product = {
    id: 122,
    name: "Paanee Mineral Water 250 mL",
    price: 12,
    oldPrice: 15,
    sku: "122",
    category: "Mineral Water",
    tags: ["Pure Water", "Mineral", "Refreshing"],
    rating: 4.9,
    reviews: 2,
    description:
      "Experience pure refreshment with Paanee Mineral Water. Carefully processed to deliver freshness and quality in every sip. Perfect for your daily hydration, travel, office, and everyday needs.",
  };

  const images = [
    { id: 1, src: mainImage, alt: "Paanee mineral water large bottle" },
    { id: 2, src: thumbOne, alt: "Paanee water container" },
    { id: 3, src: thumbTwo, alt: "Paanee slim water bottle" },
    { id: 4, src: thumbThree, alt: "Paanee mineral water bottle" },
  ];

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increaseQuantity = () => {
    setQuantity((previous) => Math.min(99, previous + 1));
  };

  const handleAddToCart = () => {
    const cartProduct = {
      ...product,
      image: activeImage,
      quantity,
      totalPrice: product.price * quantity,
    };

    // Pass product data to the parent cart if a callback is provided.
    if (onAddToCart) {
      onAddToCart(cartProduct);
    }

    setAdded(true);
    setShowNotification(true);

    window.clearTimeout(handleAddToCart.timer);
    handleAddToCart.timer = window.setTimeout(() => {
      setShowNotification(false);
      setAdded(false);
    }, 2500);
  };

  return (
    <section className="ShopDetailsOne">
      <div className="ShopDetailsOne-container">

        {/* PRODUCT TOP SECTION */}
        <div className="ShopDetailsOne-main">

          {/* LEFT PRODUCT GALLERY */}
          <div className="ShopDetailsOne-gallery">

            <div className="ShopDetailsOne-mainImage">
              <span className="ShopDetailsOne-imageBadge">
                <Check size={13} />
                Premium Quality
              </span>

              <img
                src={activeImage}
                alt={product.name}
                className="ShopDetailsOne-productImage"
              />

              <div className="ShopDetailsOne-imageCounter">
                {images.findIndex((image) => image.src === activeImage) + 1}
                <span>/ {images.length}</span>
              </div>
            </div>

            {/* THUMBNAIL GALLERY */}
            <div className="ShopDetailsOne-thumbnails">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={`ShopDetailsOne-thumbnail ${
                    activeImage === image.src ? "active" : ""
                  }`}
                  onClick={() => setActiveImage(image.src)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img src={image.src} alt={image.alt} />
                  {activeImage === image.src && (
                    <span className="ShopDetailsOne-thumbnailCheck">
                      <Check size={13} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* PRODUCT BENEFITS */}
            <div className="ShopDetailsOne-galleryNote">
              <ShieldCheck size={18} />
              <span>Quality checked and carefully packaged</span>
            </div>
          </div>

          {/* RIGHT PRODUCT INFORMATION */}
          <div className="ShopDetailsOne-information">

            <div className="ShopDetailsOne-categoryLabel">
              <span></span>
              {product.category}
            </div>

            <h1 className="ShopDetailsOne-title">
              {product.name}
            </h1>

            <div className="ShopDetailsOne-reviewSummary">
              <div className="ShopDetailsOne-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    fill="#F4AA32"
                    color="#F4AA32"
                  />
                ))}
              </div>

              <strong>{product.rating}</strong>

              <span className="ShopDetailsOne-reviewDivider"></span>

              <button
                onClick={() => setActiveTab("reviews")}
                className="ShopDetailsOne-reviewLink"
              >
                {product.reviews} Customer Reviews
              </button>
            </div>

            {/* PRICE */}
            <div className="ShopDetailsOne-priceContainer">
              <span className="ShopDetailsOne-currentPrice">
                {formatPrice(product.price)}
              </span>

              <del className="ShopDetailsOne-oldPrice">
                {formatPrice(product.oldPrice)}
              </del>

              <span className="ShopDetailsOne-discount">
                SAVE {Math.round(
                  ((product.oldPrice - product.price) /
                    product.oldPrice) *
                    100
                )}%
              </span>
            </div>

            <div className="ShopDetailsOne-stock">
              <span className="ShopDetailsOne-stockDot"></span>
              In Stock – Ready to Ship
            </div>

            <div className="ShopDetailsOne-informationDivider"></div>

            {/* SHORT DESCRIPTION */}
            <div className="ShopDetailsOne-description">
              <h3>Product Description</h3>
              <p>{product.description}</p>
            </div>

            {/* PRODUCT META */}
            <div className="ShopDetailsOne-meta">
              <div className="ShopDetailsOne-metaItem">
                <span>SKU</span>
                <strong>{product.sku}</strong>
              </div>

              <div className="ShopDetailsOne-metaItem">
                <span>Category</span>
                <strong>{product.category}</strong>
              </div>

              <div className="ShopDetailsOne-metaItem">
                <span>Tags</span>
                <div className="ShopDetailsOne-tags">
                  {product.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* QUANTITY AND ADD TO CART */}
            <div className="ShopDetailsOne-purchase">
              <div className="ShopDetailsOne-quantity">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={17} />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= 99}
                  aria-label="Increase quantity"
                >
                  <Plus size={17} />
                </button>
              </div>

              <button
                type="button"
                className={`ShopDetailsOne-addCart ${
                  added ? "added" : ""
                }`}
                onClick={handleAddToCart}
              >
                {added ? <Check size={19} /> : <ShoppingCart size={19} />}
                {added ? "Added to Cart" : "Add To Cart"}
              </button>
            </div>

            <div className="ShopDetailsOne-total">
              <span>Total price</span>
              <strong>{formatPrice(product.price * quantity)}</strong>
            </div>

            {/* SERVICE INFORMATION */}
            <div className="ShopDetailsOne-services">
              <div className="ShopDetailsOne-service">
                <div className="ShopDetailsOne-serviceIcon">
                  <Truck size={20} />
                </div>
                <div>
                  <h4>Fast Delivery</h4>
                  <p>Quick and secure shipping</p>
                </div>
              </div>

              <div className="ShopDetailsOne-service">
                <div className="ShopDetailsOne-serviceIcon">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4>Quality Assured</h4>
                  <p>Quality checked products</p>
                </div>
              </div>

              <div className="ShopDetailsOne-service">
                <div className="ShopDetailsOne-serviceIcon">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h4>Customer Support</h4>
                  <p>We're here to help you</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT TABS */}
        <div className="ShopDetailsOne-tabsSection">

          <div className="ShopDetailsOne-tabButtons">
            <button
              className={
                activeTab === "description" ? "active" : ""
              }
              onClick={() => setActiveTab("description")}
            >
              <Package size={17} />
              Description
            </button>

            <button
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              <Star size={16} />
              Reviews ({product.reviews})
            </button>
          </div>

          <div className="ShopDetailsOne-tabContent">

            {/* DESCRIPTION TAB */}
            {activeTab === "description" && (
              <div className="ShopDetailsOne-descriptionTab">
                <span className="ShopDetailsOne-tabEyebrow">
                  ABOUT THIS PRODUCT
                </span>

                <h3>Pure Refreshment, Every Single Day.</h3>

                <p>
                  Paanee Mineral Water is made for people who value
                  freshness, quality, and convenience. Enjoy a refreshing
                  experience whether you're at home, at work, or on the go.
                  Our focus is to deliver a reliable hydration experience
                  with every bottle.
                </p>

                <div className="ShopDetailsOne-highlights">
                  <div>
                    <span><Check size={16} /></span>
                    Premium quality water
                  </div>
                  <div>
                    <span><Check size={16} /></span>
                    Convenient everyday hydration
                  </div>
                  <div>
                    <span><Check size={16} /></span>
                    Carefully packaged product
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div className="ShopDetailsOne-reviewsTab">
                <div className="ShopDetailsOne-reviewsHeading">
                  <div>
                    <span className="ShopDetailsOne-tabEyebrow">
                      CUSTOMER FEEDBACK
                    </span>
                    <h3>What Our Customers Say</h3>
                  </div>

                  <div className="ShopDetailsOne-averageRating">
                    <strong>{product.rating}</strong>
                    <div>
                      <div className="ShopDetailsOne-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={13}
                            fill="#F4AA32"
                            color="#F4AA32"
                          />
                        ))}
                      </div>
                      <span>Based on 2 reviews</span>
                    </div>
                  </div>
                </div>

                <div className="ShopDetailsOne-reviewCards">
                  <article className="ShopDetailsOne-reviewCard">
                    <div className="ShopDetailsOne-reviewTop">
                      <div className="ShopDetailsOne-reviewAvatar">
                        R
                      </div>
                      <div>
                        <h4>Rahul Kumar</h4>
                        <span>Verified Customer</span>
                      </div>
                      <div className="ShopDetailsOne-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            fill="#F4AA32"
                            color="#F4AA32"
                          />
                        ))}
                      </div>
                    </div>
                    <p>
                      Great quality and refreshing water. The product
                      arrived in good condition. Very happy with my purchase.
                    </p>
                  </article>

                  <article className="ShopDetailsOne-reviewCard">
                    <div className="ShopDetailsOne-reviewTop">
                      <div className="ShopDetailsOne-reviewAvatar">
                        A
                      </div>
                      <div>
                        <h4>Ananya Das</h4>
                        <span>Verified Customer</span>
                      </div>
                      <div className="ShopDetailsOne-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            fill="#F4AA32"
                            color="#F4AA32"
                          />
                        ))}
                      </div>
                    </div>
                    <p>
                      Good product and nice packaging. I would definitely
                      recommend it for everyday use.
                    </p>
                  </article>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD TO CART NOTIFICATION */}
      {showNotification && (
        <div className="ShopDetailsOne-toast">
          <div className="ShopDetailsOne-toastIcon">
            <Check size={19} />
          </div>
          <div className="ShopDetailsOne-toastText">
            <strong>Successfully Added!</strong>
            <span>
              {quantity} × {product.name} added to cart.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowNotification(false)}
            aria-label="Close notification"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </section>
  );
};

export default ShopDetailsOne;
