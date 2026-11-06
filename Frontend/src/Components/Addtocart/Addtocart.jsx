import React, { useRef, useState, useEffect } from "react";
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
  FiPackage,
  FiShoppingCart,
  FiRefreshCw,
  FiDroplet,
  FiHeadphones,
  FiHeart,
  FiX,
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiUser,
  FiMail,
  FiEdit2,
} from "react-icons/fi";
import API from "../../services/api";
import { useShop } from "../../context/ShopContext";
import "./Addtocart.css";

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
  const {
    cart,
    setCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    addToWishlist,
    cartCount,
    cartSubtotal,
    deliveryCharge,
    cartTotal,
    totalSavings,
    showToast,
  } = useShop();

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  const handleReturnToShop = () => {
    navigate("/shop");
  };

  // Checkout Modal & Order State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "Bhubaneswar",
    postalCode: "751012",
    deliverySlot: "Standard (1-2 days)",
    paymentMethod: "cod",
    notes: "",
  });

  const [userProfile, setUserProfile] = useState(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const getCurrentUser = () => {
    try {
      const saved = localStorage.getItem("alka_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  // Fetch live address and profile from server on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteAddress = async () => {
      const user = getCurrentUser();
      if (!user) return;

      if (isMounted) setUserProfile(user);

      try {
        if (isMounted) setIsFetchingAddress(true);
        const res = await API.get("/auth/me");
        if (isMounted && res.data?.success && res.data.user) {
          const freshUser = res.data.user;
          setUserProfile(freshUser);
          localStorage.setItem("alka_user", JSON.stringify(freshUser));

          setShippingForm((prev) => ({
            ...prev,
            fullName: freshUser.name || prev.fullName || "",
            email: freshUser.email || prev.email || "",
            phone: freshUser.phone || prev.phone || "",
            addressLine1: freshUser.address?.street || prev.addressLine1 || "",
            city: freshUser.address?.city || prev.city || "Bhubaneswar",
            state: freshUser.address?.state || prev.state || "Odisha",
            postalCode: freshUser.address?.postalCode || prev.postalCode || "751012",
          }));
        }
      } catch (err) {
        // Fallback to local profile
        if (isMounted && user) {
          setShippingForm((prev) => ({
            ...prev,
            fullName: user.name || prev.fullName || "",
            email: user.email || prev.email || "",
            phone: user.phone || prev.phone || "",
            addressLine1: user.address?.street || prev.addressLine1 || "",
            city: user.address?.city || prev.city || "Bhubaneswar",
            state: user.address?.state || prev.state || "Odisha",
            postalCode: user.address?.postalCode || prev.postalCode || "751012",
          }));
        }
      } finally {
        if (isMounted) setIsFetchingAddress(false);
      }
    };

    fetchRemoteAddress();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCheckout = () => {
    if (!cart.length) {
      showToast("Your cart is empty! Please add products first.", "error");
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      showToast("Please log in to proceed with checkout. Your cart items are saved!", "info");
      navigate("/login?redirect=/cart&checkout=true");
      return;
    }

    setShippingForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
      addressLine1: prev.addressLine1 || user.address?.street || "",
      city: prev.city || user.address?.city || "Bhubaneswar",
      state: prev.state || user.address?.state || "Odisha",
      postalCode: prev.postalCode || user.address?.postalCode || "751012",
    }));

    setCheckoutError("");
    setPlacedOrder(null);
    setIsCheckoutOpen(true);
  };

  // Automatically reopen checkout if user was redirected from login with checkout intent
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "true") {
      const user = getCurrentUser();
      if (user && cart.length > 0) {
        setShippingForm((prev) => ({
          ...prev,
          fullName: prev.fullName || user.name || "",
          email: prev.email || user.email || "",
          phone: prev.phone || user.phone || "",
          addressLine1: prev.addressLine1 || user.address?.street || "",
          city: prev.city || user.address?.city || "Bhubaneswar",
          state: prev.state || user.address?.state || "Odisha",
          postalCode: prev.postalCode || user.address?.postalCode || "751012",
        }));
        setCheckoutError("");
        setPlacedOrder(null);
        setIsCheckoutOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [cart.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
    if (checkoutError) setCheckoutError("");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isSubmittingOrder) return;

    if (!shippingForm.fullName.trim()) {
      setCheckoutError("Please enter your full name.");
      return;
    }

    const cleanPhone = shippingForm.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setCheckoutError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!shippingForm.addressLine1.trim()) {
      setCheckoutError("Please enter your delivery street address / flat details.");
      return;
    }

    if (!shippingForm.city.trim()) {
      setCheckoutError("Please enter your city.");
      return;
    }

    setIsSubmittingOrder(true);
    setCheckoutError("");

    try {
      const orderPayload = {
        items: cart.map((item) => {
          const rawId = item._id || item.id;
          const isMongoId = rawId && String(rawId).match(/^[0-9a-fA-F]{24}$/);
          return {
            product: isMongoId ? rawId : null,
            title: item.name || item.title || "Alkaline Water Bottle",
            price: Number(item.price) || 0,
            quantity: Math.max(1, Number(item.qty) || 1),
            image: item.image || "",
            size: item.size || item.liter || "1 Litre",
          };
        }),
        shippingAddress: {
          fullName: shippingForm.fullName.trim(),
          phone: cleanPhone,
          email: shippingForm.email?.trim() || "customer@alkadrops.com",
          addressLine1: shippingForm.addressLine1.trim(),
          addressLine2: shippingForm.addressLine2?.trim() || "",
          city: shippingForm.city.trim(),
          postalCode: shippingForm.postalCode?.trim() || "751012",
        },
        paymentMethod: shippingForm.paymentMethod,
        deliverySlot: shippingForm.deliverySlot,
        notes: shippingForm.notes?.trim() || "",
        shippingCost: deliveryCharge,
        discountAmount: totalSavings,
      };

      const res = await API.post("/orders", orderPayload);

      if (res.data?.success && res.data?.order) {
        setPlacedOrder(res.data.order);
        clearCart();
        showToast(`Order #${res.data.order.orderNumber} placed successfully!`, "success");

        // Sync updated address & phone back to user profile in MongoDB
        if (getCurrentUser()) {
          API.put("/auth/profile", {
            phone: cleanPhone,
            address: {
              street: shippingForm.addressLine1.trim(),
              city: shippingForm.city.trim(),
              state: shippingForm.state || "Odisha",
              postalCode: shippingForm.postalCode?.trim() || "751012",
            },
          })
            .then((pRes) => {
              if (pRes.data?.user) {
                localStorage.setItem("alka_user", JSON.stringify(pRes.data.user));
                setUserProfile(pRes.data.user);
              }
            })
            .catch((e) => console.log("Profile auto-sync skipped:", e.message));
        }
      } else {
        throw new Error(res.data?.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setCheckoutError(
        err.response?.data?.message || err.message || "Failed to submit order. Please try again."
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const restoreDemoProducts = () => {
    setCart(demoProducts);
    showToast("Demo products loaded to cart!", "success");
  };

  const handleSaveForLater = (item) => {
    addToWishlist(item);
    removeFromCart(item.id || item._id);
  };

  return (
    <section className="Addtocart">
      {/* decorative background */}
      <div className="Addtocart-bg" aria-hidden="true">
        <span className="Addtocart-bg-glow Addtocart-bg-glow--one" />
        <span className="Addtocart-bg-glow Addtocart-bg-glow--two" />
        <span className="Addtocart-bg-dots" />
      </div>

      <div className="Addtocart-container">
        {/* EMPTY CART */}
        {cart.length === 0 ? (
          <div className="Addtocart-empty">
            <div className="Addtocart-empty-illustration">
              <div className="Addtocart-empty-circle">
                <FiShoppingBag />
              </div>
              <span className="Addtocart-empty-decoration decoration-one">
                <FiDroplet />
              </span>
              <span className="Addtocart-empty-decoration decoration-two">
                <FiDroplet />
              </span>
            </div>

            <span className="Addtocart-empty-label">
              <i className="Addtocart-eyebrow-dot" />
              NOTHING HERE YET
            </span>

            <h2>Your Shopping Cart is Empty</h2>

            <p>
              Your favorite alkaline bottles and jars are waiting for you.
              Explore our collection and add something pure and refreshing.
            </p>

            <div className="Addtocart-empty-actions">
              <button
                type="button"
                className="Addtocart-primary-button"
                onClick={handleReturnToShop}
              >
                Explore Products
                <FiArrowRight />
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE CART */
          <div className="Addtocart-active">
            {/* MAIN GRID */}
            <div className="Addtocart-main-grid">
              {/* LEFT: PRODUCTS */}
              <div className="Addtocart-products-section">
                <div className="Addtocart-products-heading">
                  <div>
                    <h3>Cart Items</h3>
                    <span>{cartCount} {cartCount === 1 ? "Item" : "Items"} ({cart.length} Different Products)</span>
                  </div>

                  <button
                    type="button"
                    className="Addtocart-clear-button"
                    onClick={clearCart}
                    title="Remove all items from cart"
                  >
                    <FiTrash2 />
                    Clear All
                  </button>
                </div>

                <div className="Addtocart-products-list">
                  {cart.map((item) => {
                    const itemId = item.id || item._id;
                    const price = Number(item.price) || 0;
                    const oldPrice = Number(item.oldPrice) || 0;
                    const quantity = Number(item.qty) || 1;
                    const lineTotal = price * quantity;

                    return (
                      <article className="Addtocart-product-card" key={itemId}>
                        {/* IMAGE */}
                        <div className="Addtocart-product-image-wrapper">
                          <img
                            src={item.image || fallbackImage}
                            alt={item.name}
                            className="Addtocart-product-image"
                            loading="lazy"
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

                        {/* INFO */}
                        <div className="Addtocart-product-info">
                          <span className="Addtocart-product-category">
                            {item.category || "Alkaline Water"} {item.size ? `· ${item.size}` : ""}
                          </span>

                          <h3 className="Addtocart-product-name">{item.name}</h3>

                          <p className="Addtocart-product-description">
                            {item.description ||
                              "Premium pH 8.5+ natural alkaline hydration bottled fresh for your wellness."}
                          </p>

                          <div className="Addtocart-product-price">
                            <strong>{formatPrice(price)}</strong>
                            {oldPrice > price && <del>{formatPrice(oldPrice)}</del>}
                          </div>

                          {oldPrice > price && (
                            <span className="Addtocart-saved-label">
                              You save {formatPrice(oldPrice - price)}
                            </span>
                          )}
                        </div>

                        {/* ACTIONS */}
                        <div className="Addtocart-product-actions">
                          <div className="Addtocart-quantity-wrap">
                            <span className="Addtocart-quantity-label">
                              QUANTITY
                            </span>

                            <div className="Addtocart-quantity-control">
                              <button
                                type="button"
                                onClick={() => updateQuantity(itemId, -1)}
                                disabled={quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <FiMinus />
                              </button>

                              <span aria-live="polite">{quantity}</span>

                              <button
                                type="button"
                                onClick={() => updateQuantity(itemId, 1)}
                                aria-label="Increase quantity"
                              >
                                <FiPlus />
                              </button>
                            </div>
                          </div>

                          <div className="Addtocart-line-total">
                            <span>Subtotal</span>
                            <strong>{formatPrice(lineTotal)}</strong>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                            <button
                              type="button"
                              className="Addtocart-remove-button"
                              onClick={() => handleSaveForLater(item)}
                              style={{ color: "#0a63c9", background: "rgba(10, 99, 201, 0.08)" }}
                              title="Move to Wishlist"
                            >
                              <FiHeart />
                              Save to Wishlist
                            </button>

                            <button
                              type="button"
                              className="Addtocart-remove-button"
                              onClick={() => removeFromCart(itemId)}
                            >
                              <FiTrash2 />
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* CONTINUE */}
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
                    Quality alkaline products, delivered to your door
                  </div>
                </div>
              </div>

              {/* RIGHT: SUMMARY */}
              <aside className="Addtocart-summary-section">
                <div className="Addtocart-summary-card">
                  <div className="Addtocart-summary-heading">
                    <span className="Addtocart-summary-circle one" aria-hidden="true" />
                    <span className="Addtocart-summary-circle two" aria-hidden="true" />

                    <div className="Addtocart-summary-heading-text">
                      <span>YOUR ORDER</span>
                      <h3>Order Summary</h3>
                    </div>

                    <div className="Addtocart-summary-icon">
                      <FiShoppingBag />
                    </div>
                  </div>

                  <div className="Addtocart-summary-body">
                    {/* ITEMS */}
                    <div className="Addtocart-summary-items">
                      {cart.map((item) => {
                        const itemId = item.id || item._id;
                        return (
                          <div className="Addtocart-summary-product" key={itemId}>
                            <div>
                              <strong>{item.name}</strong>
                              <span>Qty: {item.qty}</span>
                            </div>

                            <span>
                              {formatPrice(
                                (Number(item.price) || 0) * (Number(item.qty) || 1)
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* BREAKDOWN */}
                    <div className="Addtocart-summary-breakdown">
                      <div className="Addtocart-summary-row">
                        <span>Subtotal ({cartCount} items)</span>
                        <strong>{formatPrice(cartSubtotal)}</strong>
                      </div>

                      <div className="Addtocart-summary-row">
                        <span>Delivery Charges</span>
                        <strong className="Addtocart-free">FREE</strong>
                      </div>

                      {totalSavings > 0 && (
                        <div className="Addtocart-summary-row">
                          <span>Product Savings</span>
                          <strong className="Addtocart-savings">
                            -{formatPrice(totalSavings)}
                          </strong>
                        </div>
                      )}

                      <div className="Addtocart-summary-divider" />

                      <div className="Addtocart-grand-total">
                        <span>Total Amount</span>
                        <strong>{formatPrice(cartTotal)}</strong>
                      </div>
                    </div>

                    {/* LIVE DELIVERY DESTINATION */}
                    <div className="Addtocart-delivery-destination">
                      <div className="Addtocart-destination-header">
                        <div className="Addtocart-destination-title">
                          <FiMapPin className="Addtocart-pin-icon" />
                          <div>
                            <span className="Addtocart-destination-label">Deliver To</span>
                            <strong>
                              {shippingForm.fullName
                                ? `${shippingForm.fullName}${shippingForm.city ? `, ${shippingForm.city}` : ""}`
                                : userProfile?.name
                                ? `${userProfile.name}${shippingForm.city ? `, ${shippingForm.city}` : ""}`
                                : "Delivery Address"}
                            </strong>
                          </div>
                        </div>

                        {userProfile ? (
                          <button
                            type="button"
                            className="Addtocart-destination-change-btn"
                            onClick={handleCheckout}
                            title="Edit delivery address"
                          >
                            <FiEdit2 /> {shippingForm.addressLine1 ? "Change" : "+ Add"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="Addtocart-destination-change-btn"
                            onClick={() => navigate("/login?redirect=/cart&checkout=true")}
                          >
                            Login to Set
                          </button>
                        )}
                      </div>

                      <p className="Addtocart-destination-address">
                        {isFetchingAddress ? (
                          <span>Fetching saved address...</span>
                        ) : shippingForm.addressLine1 ? (
                          <>
                            <span>{shippingForm.addressLine1}</span>
                            {shippingForm.addressLine2 && <span>, {shippingForm.addressLine2}</span>}
                            {shippingForm.city && <span>, {shippingForm.city}</span>}
                            {shippingForm.state && <span>, {shippingForm.state}</span>}
                            {shippingForm.postalCode && <span> - {shippingForm.postalCode}</span>}
                          </>
                        ) : userProfile ? (
                          <span style={{ color: "#f59e0b" }}>
                            No street address saved. Click &ldquo;+ Add&rdquo; to set delivery address.
                          </span>
                        ) : (
                          <span>Login to view your saved addresses for fast doorstep delivery.</span>
                        )}
                      </p>
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

                    {/* TRUST */}
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
                        <FiDroplet />
                        <div>
                          <strong>pH 8.5+ Alkaline</strong>
                          <span>Mineral enriched hydration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUPPORT */}
                <div className="Addtocart-support-card">
                  <div className="Addtocart-support-icon">
                    <FiHeadphones />
                  </div>

                  <div>
                    <strong>Need help with your order?</strong>
                    <p>Contact our delivery team for bottle schedules and queries.</p>
                  </div>
                </div>
              </aside>
            </div>

            {/* BOTTOM BENEFITS */}
            <div className="Addtocart-benefits">
              <div className="Addtocart-benefit">
                <span className="Addtocart-benefit-icon">
                  <FiTruck />
                </span>
                <div>
                  <strong>Free Home Delivery</strong>
                  <span>Prompt doorstep drops</span>
                </div>
              </div>

              <div className="Addtocart-benefit">
                <span className="Addtocart-benefit-icon">
                  <FiShield />
                </span>
                <div>
                  <strong>Sealed &amp; Safe</strong>
                  <span>Hygienic food-grade canisters</span>
                </div>
              </div>

              <div className="Addtocart-benefit">
                <span className="Addtocart-benefit-icon">
                  <FiRefreshCw />
                </span>
                <div>
                  <strong>Easy Cart Updates</strong>
                  <span>Manage items anytime</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="Addtocart-modal-overlay" onClick={() => !isSubmittingOrder && setIsCheckoutOpen(false)}>
          <div className="Addtocart-checkout-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="Addtocart-modal-header">
              <div className="Addtocart-modal-title">
                <FiPackage className="Addtocart-modal-title-icon" />
                <div>
                  <h3>{placedOrder ? "Order Confirmed!" : "Doorstep Delivery Checkout"}</h3>
                  <p>{placedOrder ? "Thank you for choosing Alka Drops" : "Provide your address for speedy delivery in Bhubaneswar"}</p>
                </div>
              </div>
              <button
                type="button"
                className="Addtocart-modal-close"
                onClick={() => setIsCheckoutOpen(false)}
                aria-label="Close checkout"
              >
                <FiX />
              </button>
            </div>

            {placedOrder ? (
              <div className="Addtocart-order-success">
                <div className="Addtocart-success-badge">
                  <FiCheckCircle />
                </div>
                <h2>Order #{placedOrder.orderNumber} Confirmed!</h2>
                <p className="Addtocart-success-text">
                  We've received your order and our dispatch team is preparing your fresh alkaline water.
                </p>

                <div className="Addtocart-order-summary-box">
                  <div className="Addtocart-summary-row">
                    <span>Customer:</span>
                    <strong>{placedOrder.shippingAddress?.fullName}</strong>
                  </div>
                  <div className="Addtocart-summary-row">
                    <span>Contact Phone:</span>
                    <strong>{placedOrder.shippingAddress?.phone}</strong>
                  </div>
                  <div className="Addtocart-summary-row">
                    <span>Delivery Address:</span>
                    <strong>
                      {placedOrder.shippingAddress?.addressLine1}, {placedOrder.shippingAddress?.city} - {placedOrder.shippingAddress?.postalCode}
                    </strong>
                  </div>
                  <div className="Addtocart-summary-row">
                    <span>Delivery Slot:</span>
                    <strong>{placedOrder.deliverySlot || "Standard (1-2 days)"}</strong>
                  </div>
                  <div className="Addtocart-summary-row">
                    <span>Payment Method:</span>
                    <strong>{placedOrder.paymentMethod?.toUpperCase()} (Pay ₹{placedOrder.totalAmount} on delivery)</strong>
                  </div>
                </div>

                <div className="Addtocart-success-actions">
                  <button
                    type="button"
                    className="Addtocart-primary-button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      navigate("/shop");
                    }}
                  >
                    Continue Shopping
                  </button>
                  <button
                    type="button"
                    className="Addtocart-demo-button"
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="Addtocart-checkout-form">
                {checkoutError && (
                  <div className="Addtocart-form-alert error">
                    {checkoutError}
                  </div>
                )}

                <div className="Addtocart-form-grid">
                  <div className="Addtocart-form-field">
                    <label>
                      <FiUser /> Full Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Ramesh Patel"
                      value={shippingForm.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="Addtocart-form-field">
                    <label>
                      <FiPhone /> Mobile Number <span>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit mobile number"
                      value={shippingForm.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="Addtocart-form-field full-col">
                    <label>
                      <FiMail /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your.email@example.com (optional)"
                      value={shippingForm.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="Addtocart-form-field full-col">
                    <label>
                      <FiMapPin /> Delivery Address (House / Flat / Street / Landmark) <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      placeholder="e.g. Plot N5/22, IRC Village, Nayapalli"
                      value={shippingForm.addressLine1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="Addtocart-form-field">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingForm.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="Addtocart-form-field">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingForm.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="Addtocart-form-field">
                    <label>Delivery Window</label>
                    <select
                      name="deliverySlot"
                      value={shippingForm.deliverySlot}
                      onChange={handleInputChange}
                    >
                      <option value="Morning (7 AM - 10 AM)">Morning (7 AM - 10 AM)</option>
                      <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                      <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                      <option value="Standard (1-2 days)">Standard (1-2 days)</option>
                    </select>
                  </div>

                  <div className="Addtocart-form-field">
                    <label>Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={shippingForm.paymentMethod}
                      onChange={handleInputChange}
                    >
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="upi">UPI / QR Code on Delivery</option>
                    </select>
                  </div>

                  <div className="Addtocart-form-field full-col">
                    <label>Order Notes / Instructions (Optional)</label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="e.g. Ring doorbell twice, leave at reception"
                      value={shippingForm.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="Addtocart-checkout-footer">
                  <div className="Addtocart-footer-summary">
                    <span>Order Total ({cartCount} {cartCount === 1 ? "item" : "items"}):</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>

                  <button
                    type="submit"
                    className="Addtocart-place-order-btn"
                    disabled={isSubmittingOrder}
                  >
                    {isSubmittingOrder ? (
                      <>
                        <FiRefreshCw className="spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle />
                        <span>Place Order Now ({formatPrice(cartTotal)})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Addtocart;
