import React, { useRef, useState, useEffect, useMemo } from "react";
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
  FiAlertCircle,
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

// Dynamically load Razorpay SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  // Payment, Address & Placed Order State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [addressWarning, setAddressWarning] = useState(false);

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    deliverySlot: "Standard (1-2 days)",
    paymentMethod: "razorpay",
    notes: "",
  });

  const [userProfile, setUserProfile] = useState(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  // Address Selection & Creation Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddingNewInModal, setIsAddingNewInModal] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: "Home",
    recipientName: "",
    phone: "",
    street: "",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
  });
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);
  const [addressModalError, setAddressModalError] = useState("");

  const getCurrentUser = () => {
    try {
      const saved = localStorage.getItem("alka_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  // Compile full list of saved addresses for the user
  const savedAddresses = useMemo(() => {
    const list = [];
    if (userProfile?.address?.street && userProfile.address.street.trim()) {
      list.push({
        _id: "primary-addr",
        label: "Primary Delivery Address",
        recipientName: userProfile.name || shippingForm.fullName || "Primary Contact",
        phone: userProfile.phone || shippingForm.phone || "",
        street: userProfile.address.street.trim(),
        city: userProfile.address.city || "Bhubaneswar",
        state: userProfile.address.state || "Odisha",
        postalCode: userProfile.address.postalCode || "751012",
        isDefault: true,
      });
    }
    if (Array.isArray(userProfile?.addresses)) {
      userProfile.addresses.forEach((addr, idx) => {
        if (
          addr.street &&
          addr.street.trim() &&
          addr.street.trim() !== userProfile?.address?.street?.trim()
        ) {
          list.push({
            _id: addr._id || `addr-${idx}`,
            label: addr.label || "Saved Address",
            recipientName: addr.recipientName || userProfile.name || "Contact",
            phone: addr.phone || userProfile.phone || "",
            street: addr.street.trim(),
            city: addr.city || "Bhubaneswar",
            state: addr.state || "Odisha",
            postalCode: addr.postalCode || "751012",
            isDefault: Boolean(addr.isDefault),
          });
        }
      });
    }
    return list;
  }, [userProfile, shippingForm.fullName, shippingForm.phone]);

  // Handle 1-click selection of an existing saved address
  const handleSelectSavedAddress = (addr) => {
    setShippingForm((prev) => ({
      ...prev,
      fullName: addr.recipientName || prev.fullName || userProfile?.name || "",
      phone: addr.phone || prev.phone || userProfile?.phone || "",
      addressLine1: addr.street,
      city: addr.city || "Bhubaneswar",
      state: addr.state || "Odisha",
      postalCode: addr.postalCode || "751012",
    }));
    setIsAddressModalOpen(false);
    setAddressWarning(false);
    showToast(`Delivery location set to: ${addr.street}, ${addr.city}`, "success");
  };

  // Handle saving new address directly inside the cart modal
  const handleSaveNewAddressInModal = async (e) => {
    e.preventDefault();
    setAddressModalError("");

    if (!newAddressForm.street.trim()) {
      setAddressModalError("Please enter your house / flat / street address.");
      return;
    }
    if (!newAddressForm.recipientName.trim()) {
      setAddressModalError("Recipient full name is required.");
      return;
    }
    if (!newAddressForm.phone.trim()) {
      setAddressModalError("Contact phone number is required.");
      return;
    }

    try {
      setIsSavingNewAddress(true);
      const newAddrObj = {
        label: newAddressForm.label || "Home",
        recipientName: newAddressForm.recipientName.trim(),
        phone: newAddressForm.phone.trim(),
        street: newAddressForm.street.trim(),
        city: newAddressForm.city.trim() || "Bhubaneswar",
        state: newAddressForm.state.trim() || "Odisha",
        postalCode: newAddressForm.postalCode.trim() || "751012",
        isDefault: true,
      };

      const existingAddresses = Array.isArray(userProfile?.addresses)
        ? [...userProfile.addresses]
        : [];
      existingAddresses.unshift(newAddrObj);

      const payload = {
        address: {
          street: newAddrObj.street,
          city: newAddrObj.city,
          state: newAddrObj.state,
          postalCode: newAddrObj.postalCode,
        },
        addresses: existingAddresses,
      };

      const res = await API.put("/auth/profile", payload);
      if (res.data?.success && res.data.user) {
        const fresh = res.data.user;
        setUserProfile(fresh);
        localStorage.setItem("alka_user", JSON.stringify(fresh));
        window.dispatchEvent(new Event("alkaAuthUpdated"));

        setShippingForm((prev) => ({
          ...prev,
          fullName: newAddrObj.recipientName,
          phone: newAddrObj.phone,
          addressLine1: newAddrObj.street,
          city: newAddrObj.city,
          state: newAddrObj.state,
          postalCode: newAddrObj.postalCode,
        }));

        setIsAddressModalOpen(false);
        setIsAddingNewInModal(false);
        showToast("New delivery address saved and set for cart!", "success");
      }
    } catch (err) {
      setAddressModalError(
        err.response?.data?.message || "Failed to save address. Please try again."
      );
    } finally {
      setIsSavingNewAddress(false);
    }
  };

  // Fetch live address and profile from server on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteAddress = async () => {
      const user = getCurrentUser();
      if (!user) return;

      if (isMounted) {
        setUserProfile(user);
        setNewAddressForm((prev) => ({
          ...prev,
          recipientName: prev.recipientName || user.name || "",
          phone: prev.phone || user.phone || "",
        }));
      }

      try {
        if (isMounted) setIsFetchingAddress(true);
        const res = await API.get("/auth/me");
        if (isMounted && res.data?.success && res.data.user) {
          const freshUser = res.data.user;
          setUserProfile(freshUser);
          localStorage.setItem("alka_user", JSON.stringify(freshUser));

          const userStreet = (freshUser.address?.street || "").trim();
          setShippingForm((prev) => ({
            ...prev,
            fullName: freshUser.name || prev.fullName || "",
            email: freshUser.email || prev.email || "",
            phone: freshUser.phone || prev.phone || "",
            addressLine1: userStreet,
            city: userStreet ? (freshUser.address?.city || "Bhubaneswar") : "",
            state: userStreet ? (freshUser.address?.state || "Odisha") : "",
            postalCode: userStreet ? (freshUser.address?.postalCode || "751012") : "",
          }));

          setNewAddressForm((prev) => ({
            ...prev,
            recipientName: prev.recipientName || freshUser.name || "",
            phone: prev.phone || freshUser.phone || "",
          }));
        }
      } catch (err) {
        // Fallback to local profile
        if (isMounted && user) {
          const localStreet = (user.address?.street || "").trim();
          setShippingForm((prev) => ({
            ...prev,
            fullName: user.name || prev.fullName || "",
            email: user.email || prev.email || "",
            phone: user.phone || prev.phone || "",
            addressLine1: localStreet,
            city: localStreet ? (user.address?.city || "Bhubaneswar") : "",
            state: localStreet ? (user.address?.state || "Odisha") : "",
            postalCode: localStreet ? (user.address?.postalCode || "751012") : "",
          }));
        }
      } finally {
        if (isMounted) setIsFetchingAddress(false);
      }
    };

    fetchRemoteAddress();

    const handleAuthEvent = () => {
      fetchRemoteAddress();
    };
    window.addEventListener("alkaAuthUpdated", handleAuthEvent);

    return () => {
      isMounted = false;
      window.removeEventListener("alkaAuthUpdated", handleAuthEvent);
    };
  }, []);

  // Proceed to Checkout via Razorpay with Address Validation
  const handleProceedToRazorpay = async () => {
    if (!cart.length) {
      showToast("Your cart is empty! Please add products first.", "error");
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      showToast("Please log in to proceed with checkout. Your cart items are saved!", "info");
      navigate("/login?redirect=" + encodeURIComponent("/cart"));
      return;
    }

    // Strict address validation: "if address not select not proced to check that validation add"
    const currentStreet = (shippingForm.addressLine1 || user.address?.street || userProfile?.address?.street || "").trim();
    if (!currentStreet) {
      setAddressWarning(true);
      showToast("Please select or add a delivery address before proceeding to payment.", "error");
      setAddressModalError("Please select or add a delivery address to proceed with checkout.");
      setIsAddressModalOpen(true);
      return;
    }
    setAddressWarning(false);

    const recipientName = (shippingForm.fullName || user.name || userProfile?.name || "Customer").trim();
    const cleanPhone = (shippingForm.phone || user.phone || userProfile?.phone || "").replace(/\D/g, "");

    if (!recipientName) {
      showToast("Please provide recipient full name in your delivery address.", "error");
      setIsAddressModalOpen(true);
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      showToast("Please provide a valid 10-digit mobile number for doorstep delivery.", "error");
      setIsAddressModalOpen(true);
      return;
    }

    setIsProcessingPayment(true);
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setIsProcessingPayment(false);
      showToast("Could not load Razorpay payment gateway. Please check your connection.", "error");
      return;
    }

    try {
      // 1. Create Razorpay order on backend
      const orderRes = await API.post("/orders/razorpay/create-order", {
        amount: cartTotal,
        currency: "INR",
        notes: {
          customerName: recipientName,
          customerPhone: cleanPhone,
        },
      });

      if (!orderRes.data?.success || !orderRes.data?.orderId) {
        throw new Error(orderRes.data?.message || "Failed to initialize Razorpay payment order.");
      }

      const { orderId, amount, currency, keyId } = orderRes.data;
      const razorpayKey = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4";

      // 2. Launch Razorpay Checkout popup
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency || "INR",
        name: "Alka Drops",
        description: `Pure Alkaline Water Delivery (${cartCount} ${cartCount === 1 ? "item" : "items"})`,
        image: "/favicon.svg",
        order_id: orderId,
        prefill: {
          name: recipientName,
          email: shippingForm.email || user.email || "support@alkadrops.com",
          contact: cleanPhone,
        },
        notes: {
          deliveryAddress: `${currentStreet}, ${shippingForm.city || "Bhubaneswar"}`,
        },
        theme: {
          color: "#0284c7",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            showToast("Payment window closed. Cart remains saved.", "info");
          },
        },
        handler: async (response) => {
          try {
            setIsProcessingPayment(true);
            // 3. Verify signature and create order on backend
            const verifyRes = await API.post("/orders/razorpay/verify-payment", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: cart.map((item) => {
                const rawId = item._id || item.id;
                const isMongoId = rawId && String(rawId).match(/^[0-9a-fA-F]{24}$/);
                return {
                  product: isMongoId ? rawId : null,
                  title: item.name || item.title || "Alkaline Water Bottle",
                  price: Number(item.price) || 0,
                  quantity: Math.max(1, Number(item.qty || item.quantity) || 1),
                  image: item.image || "",
                  size: item.size || item.liter || "1 Litre",
                };
              }),
              shippingAddress: {
                fullName: recipientName,
                phone: cleanPhone,
                email: shippingForm.email?.trim() || user.email || "support@alkadrops.com",
                addressLine1: currentStreet,
                addressLine2: shippingForm.addressLine2?.trim() || "",
                city: shippingForm.city || user.address?.city || "Bhubaneswar",
                state: shippingForm.state || user.address?.state || "Odisha",
                postalCode: shippingForm.postalCode || user.address?.postalCode || "751012",
              },
              shippingCost: deliveryCharge || 0,
              discountAmount: totalSavings || 0,
              deliverySlot: shippingForm.deliverySlot || "Standard (1-2 days)",
              notes: shippingForm.notes?.trim() || "",
            });

            if (verifyRes.data?.success && verifyRes.data?.order) {
              clearCart();
              setPlacedOrder(verifyRes.data.order);
              showToast(`Payment successful! Order #${verifyRes.data.order.orderNumber} confirmed.`, "success");
            } else {
              throw new Error(verifyRes.data?.message || "Payment verification failed.");
            }
          } catch (vErr) {
            console.error("Razorpay verification failed:", vErr);
            showToast(vErr.response?.data?.message || vErr.message || "Failed to finalize order.", "error");
          } finally {
            setIsProcessingPayment(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", (resp) => {
        console.error("Razorpay payment failed:", resp.error);
        showToast(`Payment failed: ${resp.error?.description || "Transaction declined."}`, "error");
        setIsProcessingPayment(false);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error("Razorpay launch error:", err);
      showToast(err.response?.data?.message || err.message || "Failed to launch Razorpay checkout.", "error");
      setIsProcessingPayment(false);
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
        {/* ORDER CONFIRMED VIEW (WHEN ORDER IS PLACED VIA RAZORPAY) */}
        {placedOrder ? (
          <div
            className="Addtocart-order-success"
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "48px 32px",
              maxWidth: "680px",
              margin: "30px auto",
              boxShadow: "0 12px 36px rgba(2, 132, 199, 0.08)",
              border: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <div
              className="Addtocart-success-badge"
              style={{
                background: "#dcfce7",
                color: "#16a34a",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                margin: "0 auto 20px",
              }}
            >
              <FiCheckCircle />
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              Order #{placedOrder.orderNumber} Confirmed!
            </h2>
            <p className="Addtocart-success-text" style={{ color: "#64748b", fontSize: "15px", maxWidth: "520px", margin: "0 auto 24px" }}>
              Thank you for choosing Alka Drops! Your payment via Razorpay was successful and our dispatch team is preparing your fresh alkaline water.
            </p>

            <div
              className="Addtocart-order-summary-box"
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "20px 24px",
                border: "1px solid #e2e8f0",
                marginBottom: "28px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div className="Addtocart-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontWeight: "600" }}>Recipient:</span>
                <strong style={{ color: "#0f172a" }}>{placedOrder.shippingAddress?.fullName}</strong>
              </div>
              <div className="Addtocart-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontWeight: "600" }}>Contact Phone:</span>
                <strong style={{ color: "#0f172a" }}>{placedOrder.shippingAddress?.phone}</strong>
              </div>
              <div className="Addtocart-summary-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ color: "#64748b", fontWeight: "600" }}>Delivery Location:</span>
                <strong style={{ color: "#0f172a", textAlign: "right", maxWidth: "340px" }}>
                  {placedOrder.shippingAddress?.addressLine1}, {placedOrder.shippingAddress?.city} - {placedOrder.shippingAddress?.postalCode}
                </strong>
              </div>
              <div className="Addtocart-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontWeight: "600" }}>Payment Gateway:</span>
                <strong style={{ color: "#0284c7" }}>
                  Razorpay Online (Paid {formatPrice(placedOrder.totalAmount)})
                </strong>
              </div>
              {placedOrder.razorpayPaymentId && (
                <div className="Addtocart-summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontWeight: "600" }}>Razorpay Payment ID:</span>
                  <code style={{ background: "#e2e8f0", padding: "3px 8px", borderRadius: "6px", fontSize: "12.5px", color: "#334155" }}>
                    {placedOrder.razorpayPaymentId}
                  </code>
                </div>
              )}
            </div>

            <div className="Addtocart-success-actions" style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="Addtocart-primary-button"
                onClick={() => navigate("/account?tab=orders")}
                style={{ padding: "12px 24px", borderRadius: "10px", fontWeight: "700" }}
              >
                View My Orders
              </button>
              <button
                type="button"
                className="Addtocart-demo-button"
                onClick={() => {
                  setPlacedOrder(null);
                  navigate("/shop");
                }}
                style={{ padding: "12px 24px", borderRadius: "10px", fontWeight: "700" }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
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
              {/* LEFT: PRODUCTS & DELIVERY ADDRESS */}
              <div className="Addtocart-products-section">
                {/* LIVE DELIVERY ADDRESS ON LEFT SIDE */}
                <div
                  className="Addtocart-delivery-destination-left"
                  style={
                    addressWarning && !shippingForm.addressLine1
                      ? {
                          border: "2px solid #ef4444",
                          background: "#fff1f2",
                          boxShadow: "0 4px 14px rgba(239, 68, 68, 0.15)",
                          borderRadius: "14px",
                          padding: "16px",
                          transition: "all 0.3s ease",
                        }
                      : {}
                  }
                >
                  <div className="Addtocart-dest-left-content">
                    <div className="Addtocart-dest-pin-badge">
                      <FiMapPin />
                    </div>

                    <div className="Addtocart-dest-left-text">
                      <div className="Addtocart-dest-left-meta">
                        <span className="Addtocart-dest-badge-label">Deliver To</span>
                        <strong className="Addtocart-dest-name">
                          {shippingForm.fullName
                            ? shippingForm.fullName
                            : userProfile?.name
                            ? userProfile.name
                            : "Set Delivery Address"}
                        </strong>
                        {shippingForm.addressLine1 && shippingForm.city && (
                          <span className="Addtocart-dest-city-pill">{shippingForm.city}</span>
                        )}
                        {addressWarning && !shippingForm.addressLine1 && (
                          <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "700" }}>
                            Required for Checkout
                          </span>
                        )}
                      </div>

                      <p className="Addtocart-dest-address-text">
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
                          <span style={{ color: addressWarning ? "#dc2626" : "#d97706", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: addressWarning ? "700" : "500" }}>
                            <FiAlertCircle /> No delivery address selected yet. Please click &ldquo;+ Add Address&rdquo; to choose where to deliver.
                          </span>
                        ) : (
                          <span>Login to view your saved addresses for fast doorstep delivery in Bhubaneswar.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {userProfile ? (
                    <button
                      type="button"
                      className="Addtocart-dest-action-btn"
                      onClick={() => {
                        setAddressModalError("");
                        setIsAddressModalOpen(true);
                      }}
                      title="Choose or add delivery address"
                    >
                      <FiEdit2 /> {shippingForm.addressLine1 ? "Change Address" : "+ Add Address"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="Addtocart-dest-action-btn"
                      onClick={() =>
                        navigate("/login?redirect=" + encodeURIComponent("/cart"))
                      }
                    >
                      Login to Set
                    </button>
                  )}
                </div>

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
                                title={quantity <= 1 ? "Remove product from cart" : "Decrease quantity (-1)"}
                                aria-label={quantity <= 1 ? "Remove item" : "Decrease quantity"}
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

                    {/* RAZORPAY CHECKOUT */}
                    <button
                      type="button"
                      className="Addtocart-checkout-button"
                      onClick={handleProceedToRazorpay}
                      disabled={isProcessingPayment}
                      style={{
                        background: isProcessingPayment
                          ? "#64748b"
                          : "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        cursor: isProcessingPayment ? "not-allowed" : "pointer",
                      }}
                    >
                      {isProcessingPayment ? (
                        <>
                          <FiRefreshCw className="spin" />
                          <span>Connecting to Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <FiZap />
                          <span>Proceed to Pay ({formatPrice(cartTotal)})</span>
                          <FiArrowRight />
                        </>
                      )}
                    </button>

                    <p className="Addtocart-checkout-caption" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12.5px" }}>
                      <FiShield style={{ color: "#16a34a", flexShrink: 0 }} />
                      <span>100% Secure Checkout powered by Razorpay UPI, Cards &amp; NetBanking</span>
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

      {/* =========================================================================
          CHOOSE / ADD DELIVERY ADDRESS MODAL (IN CART - NO REDIRECT)
      ========================================================================= */}
      {isAddressModalOpen && (
        <div
          className="Addtocart-addressModalBackdrop"
          onClick={() => !isSavingNewAddress && setIsAddressModalOpen(false)}
        >
          <div
            className="Addtocart-addressModal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="Addtocart-addressModalHeader">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="Addtocart-addressModalIcon">
                  <FiMapPin />
                </div>
                <div>
                  <h3>Select Delivery Address</h3>
                  <p>Choose where you want your water delivered in Bhubaneswar</p>
                </div>
              </div>
              <button
                type="button"
                className="Addtocart-closeModalBtn"
                onClick={() => !isSavingNewAddress && setIsAddressModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="Addtocart-addressModalBody">
              {addressModalError && (
                <div className="Addtocart-alert error" style={{ marginBottom: "16px" }}>
                  <FiAlertCircle /> {addressModalError}
                </div>
              )}

              {/* LIST OF SAVED ADDRESSES */}
              {savedAddresses.length > 0 && !isAddingNewInModal && (
                <div className="Addtocart-savedAddressesList">
                  <div className="Addtocart-savedAddressesHeader">
                    <span>SAVED ADDRESSES ({savedAddresses.length})</span>
                    <button
                      type="button"
                      className="Addtocart-addNewLink"
                      onClick={() => {
                        setIsAddressModalOpen(false);
                        navigate("/account?tab=addresses");
                      }}
                    >
                      <FiPlus /> Add New Address
                    </button>
                  </div>

                  {savedAddresses.map((addr) => {
                    const isSelected = shippingForm.addressLine1 === addr.street;
                    return (
                      <div
                        key={addr._id}
                        className={`Addtocart-addressCard ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectSavedAddress(addr)}
                      >
                        <div className="cardRadio">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={isSelected}
                            onChange={() => handleSelectSavedAddress(addr)}
                          />
                        </div>
                        <div className="cardContent">
                          <div className="cardHead">
                            <span className="addrLabel">{addr.label || "Home"}</span>
                            {addr.isDefault && <span className="defaultTag">Default</span>}
                            {isSelected && <span className="selectedTag"><FiCheckCircle /> Selected</span>}
                          </div>
                          <strong className="recipient">{addr.recipientName} {addr.phone && `• ${addr.phone}`}</strong>
                          <p className="street">
                            {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="selectBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSavedAddress(addr);
                          }}
                        >
                          {isSelected ? "Delivering Here" : "Deliver Here"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ADD NEW ADDRESS FORM (when no saved addresses OR when user clicked + Add New Address) */}
              {(isAddingNewInModal || savedAddresses.length === 0) && (
                <form onSubmit={handleSaveNewAddressInModal} className="Addtocart-newAddressForm">
                  {savedAddresses.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <strong style={{ fontSize: "15px", color: "#0f172a" }}>Add New Delivery Address</strong>
                      <button
                        type="button"
                        className="Addtocart-cancelNewLink"
                        onClick={() => setIsAddingNewInModal(false)}
                      >
                        &larr; Back to Saved Addresses
                      </button>
                    </div>
                  )}

                  {savedAddresses.length === 0 && (
                    <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", color: "#475569", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span>You haven't saved any delivery address yet. Add your details below or manage your delivery locations directly in your account.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddressModalOpen(false);
                          navigate("/account?tab=addresses");
                        }}
                        style={{
                          background: "#0284c7",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "7px 14px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "12.5px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        Go to My Addresses &rarr;
                      </button>
                    </div>
                  )}

                  <div className="Addtocart-formGrid">
                    <div className="field">
                      <label>Recipient Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Deepak Kumar Nayak"
                        value={newAddressForm.recipientName}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, recipientName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Contact Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={newAddressForm.phone}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field full">
                      <label>House / Flat / Street / Landmark *</label>
                      <input
                        type="text"
                        placeholder="e.g. Plot No 120, Near Crown Hotel, IRC Village, Nayapalli"
                        value={newAddressForm.street}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field">
                      <label>City *</label>
                      <input
                        type="text"
                        value={newAddressForm.city}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Postal PIN Code *</label>
                      <input
                        type="text"
                        value={newAddressForm.postalCode}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, postalCode: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field full">
                      <label>Address Label</label>
                      <div className="Addtocart-labelPills">
                        {["Home", "Work", "Other"].map((lbl) => (
                          <button
                            type="button"
                            key={lbl}
                            className={`labelPill ${newAddressForm.label === lbl ? "active" : ""}`}
                            onClick={() => setNewAddressForm({ ...newAddressForm, label: lbl })}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="Addtocart-modalFooterActions">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        className="Addtocart-btnSecondary"
                        onClick={() => setIsAddingNewInModal(false)}
                        disabled={isSavingNewAddress}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="Addtocart-btnPrimary"
                      disabled={isSavingNewAddress}
                    >
                      {isSavingNewAddress ? (
                        <>
                          <FiRefreshCw className="spin" /> Saving Address...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle /> Save &amp; Deliver Here
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Addtocart;
