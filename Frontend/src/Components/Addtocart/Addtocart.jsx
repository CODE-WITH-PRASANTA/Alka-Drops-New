
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiArrowRight,
  FiZap,
  FiCheckCircle,
  FiPackage,
  FiShoppingCart,
  FiRefreshCw,
} from "react-icons/fi";

import "./Addtocart.css";

const CART_STORAGE_KEY = "shoppingCart";

const demoProducts = [
  {
    id: "demo-101",
    name: "Alka Premium Mineral Water",
    category: "Mineral Water",
    description: "Refreshing mineral-rich drinking water for everyday hydration.",
    price: 159,
    oldPrice: 199,
    qty: 2,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&auto=format&fit=crop&q=85",
    badge: "BEST SELLER",
  },
  {
    id: "demo-102",
    name: "Pure Blue Water Bottle",
    category: "Water Bottle",
    description: "Premium reusable water bottle with a stylish finish.",
    price: 249,
    oldPrice: 299,
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=700&auto=format&fit=crop&q=85",
    badge: "POPULAR",
  },
  {
    id: "demo-103",
    name: "Fresh Drop Water Jar",
    category: "20 Litre Water",
    description: "Convenient water jar for home and office requirements.",
    price: 120,
    oldPrice: 150,
    qty: 2,
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85",
    badge: "VALUE PICK",
  },
  {
    id: "demo-104",
    name: "Crystal Clear Hydration",
    category: "Premium Collection",
    description: "Everyday hydration with a clean and refreshing experience.",
    price: 189,
    oldPrice: 229,
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=700&auto=format&fit=crop&q=85",
    badge: "NEW",
  },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85";

const Addtocart = () => {
  const navigate = useNavigate();

  // =====================================
  // INITIAL CART DATA
  // =====================================

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart !== null) {
        const parsedCart = JSON.parse(savedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
      }

      // First visit: load sample products
      return demoProducts;
    } catch (error) {
      console.error("Cart loading error:", error);
      return demoProducts;
    }
  });

  const [notification, setNotification] = useState("");

  // =====================================
  // SAVE CART
  // =====================================

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error("Unable to save cart:", error);
    }
  }, [cart]);

  // =====================================
  // SYNC CART WITH SHOP COMPONENT
  // =====================================

  useEffect(() => {
    const syncCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart !== null) {
          const parsed = JSON.parse(savedCart);
          setCart(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error("Cart synchronization error:", error);
      }
    };

    window.addEventListener("storage", syncCart);
    window.addEventListener("shoppingCartUpdated", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("shoppingCartUpdated", syncCart);
    };
  }, []);

  // =====================================
  // NOTIFICATION
  // =====================================

  const showNotification = (message) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 2200);
  };

  // =====================================
  // PRICE FORMAT
  // =====================================

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  // =====================================
  // CART CALCULATIONS
  // =====================================

  const cartTotalCount = cart.reduce(
    (total, item) => total + Math.max(0, Number(item.qty) || 0),
    0
  );

  const cartSubtotal = cart.reduce(
    (total, item) =>
      total +
      (Number(item.price) || 0) *
        Math.max(0, Number(item.qty) || 0),
    0
  );

  const deliveryCharge = 0;
  const cartTotal = cartSubtotal + deliveryCharge;

  const totalSavings = cart.reduce(
    (total, item) =>
      total +
      Math.max(0, (Number(item.oldPrice) || 0) - (Number(item.price) || 0)) *
        Math.max(0, Number(item.qty) || 0),
    0
  );

  // =====================================
  // NAVIGATION
  // =====================================

  const handleReturnToShop = () => {
    navigate("/shop");
  };

  const handleCheckout = () => {
    if (!cart.length) {
      showNotification("Your cart is empty!");
      return;
    }

    navigate("/checkout", {
      state: {
        cart,
        subtotal: cartSubtotal,
        delivery: deliveryCharge,
        total: cartTotal,
        totalItems: cartTotalCount,
      },
    });
  };

  // =====================================
  // UPDATE QUANTITY
  // =====================================

  const updateQuantity = (productId, change) => {
    setCart((previousCart) =>
      previousCart.map((item) => {
        if (item.id !== productId) return item;

        const currentQuantity = Number(item.qty) || 1;
        const nextQuantity = currentQuantity + change;

        return {
          ...item,
          qty: Math.max(1, nextQuantity),
        };
      })
    );
  };

  // =====================================
  // REMOVE PRODUCT
  // =====================================

  const removeProduct = (productId) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== productId)
    );

    showNotification("Product removed from your cart");
  };

  // =====================================
  // CLEAR CART
  // =====================================

  const clearCart = () => {
    if (!cart.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove all products?"
    );

    if (confirmed) {
      setCart([]);
      showNotification("Your cart has been cleared");
    }
  };

  // =====================================
  // RESTORE DEMO PRODUCTS
  // =====================================

  const restoreDemoProducts = () => {
    setCart(demoProducts);
    showNotification("Demo products restored successfully");
  };

  // =====================================
  // COMPONENT UI
  // =====================================

  return (
    <section className="Addtocart">

      <div className="Addtocart-container">

        {/* =====================================
            NOTIFICATION
        ===================================== */}

        {notification && (
          <div className="Addtocart-notification">
            <FiCheckCircle />
            <span>{notification}</span>
          </div>
        )}

        {/* =====================================
            PAGE TOP HEADER
        ===================================== */}

        <div className="Addtocart-page-header">

          <div className="Addtocart-breadcrumb">
            <span onClick={handleReturnToShop}>Home</span>
            <FiArrowRight />
            <span>Shopping Cart</span>
          </div>

          <div className="Addtocart-header-content">
            <div>
              <span className="Addtocart-eyebrow">
                YOUR SHOPPING EXPERIENCE
              </span>

              <h1>
                Shopping <span>Cart</span>
              </h1>

              <p>
                Review your selected products and get ready for checkout.
              </p>
            </div>

            <div className="Addtocart-header-icon">
              <FiShoppingBag />
            </div>
          </div>

        </div>

        {/* =====================================
            EMPTY CART
        ===================================== */}

        {cart.length === 0 ? (

          <div className="Addtocart-empty">

            <div className="Addtocart-empty-illustration">
              <div className="Addtocart-empty-circle">
                <FiShoppingBag />
              </div>

              <span className="Addtocart-empty-decoration decoration-one">
                +
              </span>

              <span className="Addtocart-empty-decoration decoration-two">
                ✦
              </span>
            </div>

            <span className="Addtocart-empty-label">
              NOTHING HERE YET
            </span>

            <h2>Your Shopping Cart is Empty</h2>

            <p>
              Your favourite products are waiting for you.
              Explore our collection and add something wonderful.
            </p>

            <div className="Addtocart-empty-actions">

              <button
                className="Addtocart-primary-button"
                onClick={handleReturnToShop}
              >
                Explore Products
                <FiArrowRight />
              </button>

              <button
                className="Addtocart-demo-button"
                onClick={restoreDemoProducts}
              >
                <FiRefreshCw />
                Load Demo Products
              </button>

            </div>

          </div>

        ) : (

          /* =====================================
              ACTIVE CART
          ===================================== */

          <div className="Addtocart-active">

            {/* CART TOP BAR */}

            <div className="Addtocart-cart-topbar">

              <div>
                <span className="Addtocart-cart-label">
                  SHOPPING BAG
                </span>

                <h2 className="Addtocart-cart-title">
                  Your Cart
                  <span className="Addtocart-item-count">
                    {cartTotalCount} {cartTotalCount === 1 ? "Item" : "Items"}
                  </span>
                </h2>
              </div>

              <button
                type="button"
                className="Addtocart-clear-button"
                onClick={clearCart}
              >
                <FiTrash2 />
                Clear All
              </button>

            </div>

            {/* CART PROGRESS */}

            <div className="Addtocart-progress">

              <div className="Addtocart-progress-step active">
                <span><FiShoppingCart /></span>
                <p>Shopping Cart</p>
              </div>

              <div className="Addtocart-progress-line"></div>

              <div className="Addtocart-progress-step">
                <span><FiTruck /></span>
                <p>Delivery</p>
              </div>

              <div className="Addtocart-progress-line"></div>

              <div className="Addtocart-progress-step">
                <span><FiShield /></span>
                <p>Checkout</p>
              </div>

            </div>

            {/* MAIN GRID */}

            <div className="Addtocart-main-grid">

              {/* =====================================
                  LEFT PRODUCTS COLUMN
              ===================================== */}

              <div className="Addtocart-products-section">

                <div className="Addtocart-products-heading">
                  <h3>Cart Items</h3>
                  <span>{cart.length} Different Products</span>
                </div>

                <div className="Addtocart-products-list">

                  {cart.map((item) => {

                    const price = Number(item.price) || 0;
                    const oldPrice = Number(item.oldPrice) || 0;
                    const quantity = Number(item.qty) || 1;
                    const lineTotal = price * quantity;

                    return (

                      <article
                        className="Addtocart-product-card"
                        key={item.id}
                      >

                        {/* PRODUCT IMAGE */}

                        <div className="Addtocart-product-image-wrapper">

                          <img
                            src={item.image || fallbackImage}
                            alt={item.name}
                            className="Addtocart-product-image"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = fallbackImage;
                            }}
                          />

                          {item.badge && (
                            <span className="Addtocart-product-badge">
                              {item.badge}
                            </span>
                          )}

                        </div>

                        {/* PRODUCT INFORMATION */}

                        <div className="Addtocart-product-info">

                          <span className="Addtocart-product-category">
                            {item.category || "General"}
                          </span>

                          <h3 className="Addtocart-product-name">
                            {item.name}
                          </h3>

                          <p className="Addtocart-product-description">
                            {item.description ||
                              "Quality product selected for your everyday needs."}
                          </p>

                          <div className="Addtocart-product-price">

                            <strong>{formatPrice(price)}</strong>

                            {oldPrice > price && (
                              <del>{formatPrice(oldPrice)}</del>
                            )}

                          </div>

                          {oldPrice > price && (
                            <span className="Addtocart-saved-label">
                              You save {formatPrice(oldPrice - price)}
                            </span>
                          )}

                        </div>

                        {/* QUANTITY AND TOTAL */}

                        <div className="Addtocart-product-actions">

                          <span className="Addtocart-quantity-label">
                            QUANTITY
                          </span>

                          <div className="Addtocart-quantity-control">

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, -1)
                              }
                              disabled={quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <FiMinus />
                            </button>

                            <span>{quantity}</span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, 1)
                              }
                              aria-label="Increase quantity"
                            >
                              <FiPlus />
                            </button>

                          </div>

                          <div className="Addtocart-line-total">
                            <span>Subtotal</span>
                            <strong>{formatPrice(lineTotal)}</strong>
                          </div>

                          <button
                            type="button"
                            className="Addtocart-remove-button"
                            onClick={() => removeProduct(item.id)}
                          >
                            <FiTrash2 />
                            Remove
                          </button>

                        </div>

                      </article>

                    );

                  })}

                </div>

                {/* CONTINUE SHOPPING */}

                <div className="Addtocart-continue-row">

                  <button
                    type="button"
                    onClick={handleReturnToShop}
                    className="Addtocart-continue-button"
                  >
                    <FiArrowLeft />
                    Continue Shopping
                  </button>

                  <div className="Addtocart-products-note">
                    <FiPackage />
                    Quality products, delivered to your door
                  </div>

                </div>

              </div>

              {/* =====================================
                  RIGHT ORDER SUMMARY
              ===================================== */}

              <aside className="Addtocart-summary-section">

                <div className="Addtocart-summary-card">

                  <div className="Addtocart-summary-heading">
                    <div>
                      <span>YOUR ORDER</span>
                      <h3>Order Summary</h3>
                    </div>

                    <div className="Addtocart-summary-icon">
                      <FiShoppingBag />
                    </div>
                  </div>

                  {/* SUMMARY ITEMS */}

                  <div className="Addtocart-summary-items">

                    {cart.map((item) => (
                      <div
                        className="Addtocart-summary-product"
                        key={item.id}
                      >
                        <div>
                          <strong>{item.name}</strong>
                          <span>Qty: {item.qty}</span>
                        </div>

                        <span>
                          {formatPrice(
                            (Number(item.price) || 0) *
                            (Number(item.qty) || 1)
                          )}
                        </span>
                      </div>
                    ))}

                  </div>

                  {/* PRICE BREAKDOWN */}

                  <div className="Addtocart-summary-breakdown">

                    <div className="Addtocart-summary-row">
                      <span>Subtotal ({cartTotalCount} items)</span>
                      <strong>{formatPrice(cartSubtotal)}</strong>
                    </div>

                    <div className="Addtocart-summary-row">
                      <span>Delivery Charges</span>
                      <strong className="Addtocart-free">
                        FREE
                      </strong>
                    </div>

                    {totalSavings > 0 && (
                      <div className="Addtocart-summary-row">
                        <span>Product Savings</span>
                        <strong className="Addtocart-savings">
                          -{formatPrice(totalSavings)}
                        </strong>
                      </div>
                    )}

                    <div className="Addtocart-summary-divider"></div>

                    <div className="Addtocart-grand-total">
                      <span>Total Amount</span>
                      <strong>{formatPrice(cartTotal)}</strong>
                    </div>

                  </div>

                  {/* CHECKOUT */}

                  <button
                    type="button"
                    className="Addtocart-checkout-button"
                    onClick={handleCheckout}
                  >
                    <FiZap />
                    Proceed to Checkout
                    <FiArrowRight />
                  </button>

                  <p className="Addtocart-checkout-caption">
                    Review your order details before proceeding.
                  </p>

                  {/* TRUST INFORMATION */}

                  <div className="Addtocart-trust-section">

                    <div className="Addtocart-trust-item">
                      <FiShield />
                      <div>
                        <strong>Safe Shopping</strong>
                        <span>Secure browsing experience</span>
                      </div>
                    </div>

                    <div className="Addtocart-trust-item">
                      <FiTruck />
                      <div>
                        <strong>Free Delivery</strong>
                        <span>Standard delivery included</span>
                      </div>
                    </div>

                    <div className="Addtocart-trust-item">
                      <FiCheckCircle />
                      <div>
                        <strong>Quality Products</strong>
                        <span>Selected for your needs</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* SUPPORT CARD */}

                <div className="Addtocart-support-card">
                  <div className="Addtocart-support-icon">
                    <FiShoppingBag />
                  </div>

                  <div>
                    <strong>Need help with your order?</strong>
                    <p>
                      Contact our team for product and delivery enquiries.
                    </p>
                  </div>
                </div>

              </aside>

            </div>

            {/* BOTTOM BENEFITS */}

            <div className="Addtocart-benefits">

              <div className="Addtocart-benefit">
                <FiTruck />
                <div>
                  <strong>Free Delivery</strong>
                  <span>On your current order</span>
                </div>
              </div>

              <div className="Addtocart-benefit">
                <FiShield />
                <div>
                  <strong>Safe Shopping</strong>
                  <span>Shop with confidence</span>
                </div>
              </div>

              <div className="Addtocart-benefit">
                <FiRefreshCw />
                <div>
                  <strong>Easy Cart Updates</strong>
                  <span>Manage items anytime</span>
                </div>
              </div>

            </div>

          </div>

        )}

      </div>

    </section>
  );
};

export default Addtocart;
