import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiUser,
  FiMapPin,
  FiPackage,
  FiLock,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit2,
  FiShoppingBag,
  FiCalendar,
  FiPhone,
  FiMail,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiArrowRight,
  FiPause,
  FiPlay,
  FiSliders,
  FiClock,
  FiDroplet,
  FiStar,
  FiCheck,
  FiCamera,
  FiTrash2,
  FiUploadCloud,
  FiHeart,
  FiPlus,
} from "react-icons/fi";
import { useShop } from "../../context/ShopContext";
import API from "../../services/api";
import "./Account.css";

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, removeFromWishlist, moveToCart, wishlistCount } = useShop();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const returnTo = searchParams.get("returnTo");
  const isSelectForCart = searchParams.get("selectAddress") === "true" || returnTo === "/cart";

  // Active tab state
  const [activeTab, setActiveTab] = useState("profile");

  // User state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("alka_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Avatar upload state
  const fileInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [avatarManageError, setAvatarManageError] = useState(false);

  // Profile Form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address & Multi-Address Management state
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null = new, "primary" or index/id
  const [addressFormData, setAddressFormData] = useState({
    label: "Home",
    recipientName: "",
    phone: "",
    street: "",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
    isDefault: false,
  });
  const [address, setAddress] = useState({
    street: "",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    cadence: "Alternate Days",
    bottlesPerDelivery: 2,
    deliveryTimeSlot: "Morning (7 AM - 10 AM)",
  });

  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [subOrders, setSubOrders] = useState([]);
  const [isLoadingSubOrders, setIsLoadingSubOrders] = useState(true);

  // Notifications
  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  // Security Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login?redirect=/account");
    }
  }, [currentUser, navigate]);

  // Sync tab with URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["profile", "subscriptions", "addresses", "orders", "security", "wishlist"].includes(tabParam)) {
      setActiveTab(tabParam);
      if (tabParam === "addresses") {
        if (!address.street || params.get("addNew") === "true") {
          setIsAddressFormOpen(true);
          setEditingAddressId(null);
          setAddressFormData({
            label: "Home",
            recipientName: currentUser?.name || "",
            phone: currentUser?.phone || "",
            street: "",
            city: "Bhubaneswar",
            state: "Odisha",
            postalCode: "751012",
            isDefault: !address.street,
          });
        }
      }
    }
  }, [location.search, address.street, currentUser]);

  // Sync user state on changes
  useEffect(() => {
    const handleAuthUpdated = () => {
      try {
        const saved = localStorage.getItem("alka_user");
        const u = saved ? JSON.parse(saved) : null;
        setCurrentUser(u);
        if (u?.subscription) {
          setSubscription(u.subscription);
          setScheduleForm({
            cadence: u.subscription.cadence || "Alternate Days",
            bottlesPerDelivery: u.subscription.bottlesPerDelivery || 2,
            deliveryTimeSlot: u.subscription.deliveryTimeSlot || "Morning (7 AM - 10 AM)",
          });
        }
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener("alkaAuthUpdated", handleAuthUpdated);
    window.addEventListener("storage", handleAuthUpdated);

    return () => {
      window.removeEventListener("alkaAuthUpdated", handleAuthUpdated);
      window.removeEventListener("storage", handleAuthUpdated);
    };
  }, []);

  // Fetch live fresh user from API on mount
  useEffect(() => {
    const fetchFreshUser = async () => {
      try {
        const res = await API.get("/auth/me");
        if (res.data?.success && res.data.user) {
          const fresh = res.data.user;
          setCurrentUser(fresh);
          localStorage.setItem("alka_user", JSON.stringify(fresh));
          if (fresh.subscription) {
            setSubscription(fresh.subscription);
            setScheduleForm({
              cadence: fresh.subscription.cadence || "Alternate Days",
              bottlesPerDelivery: fresh.subscription.bottlesPerDelivery || 2,
              deliveryTimeSlot: fresh.subscription.deliveryTimeSlot || "Morning (7 AM - 10 AM)",
            });
          }
        }
      } catch (err) {
        // quiet fallback
      }
    };
    if (currentUser) {
      fetchFreshUser();
    }
  }, []);

  // Initialize form fields when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setProfilePhone(currentUser.phone || "");
      if (currentUser.address) {
        setAddress({
          street: currentUser.address.street || "",
          city: currentUser.address.city || "Bhubaneswar",
          state: currentUser.address.state || "Odisha",
          postalCode: currentUser.address.postalCode || "751012",
        });
      }
      if (currentUser.subscription) {
        setSubscription(currentUser.subscription);
        setScheduleForm({
          cadence: currentUser.subscription.cadence || "Alternate Days",
          bottlesPerDelivery: currentUser.subscription.bottlesPerDelivery || 2,
          deliveryTimeSlot: currentUser.subscription.deliveryTimeSlot || "Morning (7 AM - 10 AM)",
        });
      }
    }
  }, [currentUser]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders" && currentUser) {
      fetchOrders();
    }
  }, [activeTab, currentUser]);

  // Fetch subscription plans & user subscription orders
  useEffect(() => {
    if (currentUser) {
      fetchMySubscriptions();
    }
    if (activeTab === "subscriptions") {
      fetchPlans();
    }
  }, [activeTab, currentUser]);

  const fetchMySubscriptions = async () => {
    try {
      setIsLoadingSubOrders(true);
      const res = await API.get("/subscription-orders/my-subscriptions");
      if (res.data?.success && Array.isArray(res.data.orders)) {
        setSubOrders(res.data.orders);
        if (res.data.activeSubscription) {
          const act = res.data.activeSubscription;
          setSubscription(act);
          setScheduleForm({
            cadence: act.deliveryFrequency || "Alternate Days",
            bottlesPerDelivery: act.bottlesPerDelivery || 2,
            deliveryTimeSlot: act.deliverySlot || "Morning (7 AM - 10 AM)",
          });
        } else {
          setSubscription(null);
        }
      } else {
        setSubOrders([]);
        setSubscription(null);
      }
    } catch (err) {
      console.warn("Could not load subscriptions from server:", err);
      setSubscription(null);
    } finally {
      setIsLoadingSubOrders(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await API.get("/orders/my-orders");
      if (res.data?.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load user orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const res = await API.get("/subscription-plans");
      if (res.data?.success && Array.isArray(res.data.plans)) {
        setAvailablePlans(res.data.plans.filter((p) => p.status === "Active"));
      }
    } catch (err) {
      console.error("Failed to fetch subscription plans:", err);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFeedbackMsg({ type: "", text: "" });
    const targetUrl = returnTo
      ? `/account?tab=${tab}&returnTo=${encodeURIComponent(returnTo)}`
      : `/account?tab=${tab}`;
    navigate(targetUrl, { replace: true });
  };

  // Upload or Change Profile Picture
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
      setFeedbackMsg({
        type: "error",
        text: "Please select a valid image file (JPG, PNG, or WEBP).",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedbackMsg({
        type: "error",
        text: "Selected image exceeds maximum allowed size of 10MB.",
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setFeedbackMsg({ type: "", text: "" });

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await API.post("/auth/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.user) {
        const fresh = res.data.user;
        localStorage.setItem("alka_user", JSON.stringify(fresh));
        setCurrentUser(fresh);
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setFeedbackMsg({
          type: "success",
          text: "Profile picture updated successfully!",
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to upload profile picture.",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove Profile Picture
  const handleRemoveAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setFeedbackMsg({ type: "", text: "" });

      const res = await API.delete("/auth/profile/avatar");
      if (res.data?.success && res.data.user) {
        const fresh = res.data.user;
        localStorage.setItem("alka_user", JSON.stringify(fresh));
        setCurrentUser(fresh);
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setFeedbackMsg({
          type: "success",
          text: "Profile picture removed successfully.",
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to remove profile picture.",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save profile updates (Name & Phone)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      setFeedbackMsg({ type: "", text: "" });

      const res = await API.put("/auth/profile", {
        name: profileName.trim(),
        phone: profilePhone.trim(),
      });

      if (res.data?.success && res.data.user) {
        localStorage.setItem("alka_user", JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setIsEditingProfile(false);
        setFeedbackMsg({
          type: "success",
          text: "Profile details updated successfully!",
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Compile all user delivery addresses (primary + additional saved)
  const allSavedAddresses = useMemo(() => {
    if (!currentUser) return [];
    const list = [];
    const primaryStreet = (currentUser.address?.street || address.street || "").trim();

    if (primaryStreet) {
      list.push({
        _id: "primary",
        label: "Primary Hub Address",
        recipientName: currentUser.name || "Primary Contact",
        phone: currentUser.phone || "",
        street: primaryStreet,
        city: currentUser.address?.city || address.city || "Bhubaneswar",
        state: currentUser.address?.state || address.state || "Odisha",
        postalCode: currentUser.address?.postalCode || address.postalCode || "751012",
        isDefault: true,
      });
    }

    if (Array.isArray(currentUser.addresses)) {
      currentUser.addresses.forEach((addr, idx) => {
        const addrStreet = (addr.street || "").trim();
        if (addrStreet && addrStreet !== primaryStreet) {
          list.push({
            _id: addr._id || `addr-${idx}`,
            label: addr.label || "Saved Address",
            recipientName: addr.recipientName || currentUser.name || "Contact",
            phone: addr.phone || currentUser.phone || "",
            street: addrStreet,
            city: addr.city || "Bhubaneswar",
            state: addr.state || "Odisha",
            postalCode: addr.postalCode || "751012",
            isDefault: false,
          });
        }
      });
    }

    return list;
  }, [currentUser, address]);

  // Open Form for Brand New Address
  const handleOpenNewAddressForm = () => {
    setEditingAddressId(null);
    setAddressFormData({
      label: "Home",
      recipientName: currentUser?.name || "",
      phone: currentUser?.phone || "",
      street: "",
      city: "Bhubaneswar",
      state: "Odisha",
      postalCode: "751012",
      isDefault: allSavedAddresses.length === 0,
    });
    setIsAddressFormOpen(true);
  };

  // Open Form to Edit an Existing Address
  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressFormData({
      label: addr.label || "Home",
      recipientName: addr.recipientName || currentUser?.name || "",
      phone: addr.phone || currentUser?.phone || "",
      street: addr.street || "",
      city: addr.city || "Bhubaneswar",
      state: addr.state || "Odisha",
      postalCode: addr.postalCode || "751012",
      isDefault: Boolean(addr.isDefault),
    });
    setIsAddressFormOpen(true);
  };

  // Save / Update Address Form
  const handleSaveAddressForm = async (e) => {
    e.preventDefault();
    if (!addressFormData.street.trim()) {
      setFeedbackMsg({ type: "error", text: "Please enter your house / street / flat details." });
      return;
    }
    if (!addressFormData.recipientName.trim()) {
      setFeedbackMsg({ type: "error", text: "Please provide recipient full name." });
      return;
    }
    if (!addressFormData.phone.trim()) {
      setFeedbackMsg({ type: "error", text: "Please provide contact mobile number." });
      return;
    }

    try {
      setIsSavingAddress(true);
      setFeedbackMsg({ type: "", text: "" });

      let currentAddresses = Array.isArray(currentUser?.addresses) ? [...currentUser.addresses] : [];
      let updatedPrimary = currentUser?.address ? { ...currentUser.address } : { ...address };

      const newAddressItem = {
        label: addressFormData.label || "Home",
        recipientName: addressFormData.recipientName.trim(),
        phone: addressFormData.phone.trim(),
        street: addressFormData.street.trim(),
        city: addressFormData.city.trim() || "Bhubaneswar",
        state: addressFormData.state.trim() || "Odisha",
        postalCode: addressFormData.postalCode.trim() || "751012",
        isDefault: Boolean(addressFormData.isDefault),
      };

      if (editingAddressId === "primary") {
        updatedPrimary = {
          street: newAddressItem.street,
          city: newAddressItem.city,
          state: newAddressItem.state,
          postalCode: newAddressItem.postalCode,
        };
      } else if (editingAddressId) {
        currentAddresses = currentAddresses.map((item, idx) => {
          if (item._id === editingAddressId || `addr-${idx}` === editingAddressId) {
            return { ...item, ...newAddressItem };
          }
          return item;
        });
        if (addressFormData.isDefault) {
          updatedPrimary = {
            street: newAddressItem.street,
            city: newAddressItem.city,
            state: newAddressItem.state,
            postalCode: newAddressItem.postalCode,
          };
        }
      } else {
        if (addressFormData.isDefault || !updatedPrimary.street) {
          if (updatedPrimary.street) {
            currentAddresses.push({
              label: "Previous Address",
              recipientName: currentUser.name || "Contact",
              phone: currentUser.phone || "",
              street: updatedPrimary.street,
              city: updatedPrimary.city || "Bhubaneswar",
              state: updatedPrimary.state || "Odisha",
              postalCode: updatedPrimary.postalCode || "751012",
              isDefault: false,
            });
          }
          updatedPrimary = {
            street: newAddressItem.street,
            city: newAddressItem.city,
            state: newAddressItem.state,
            postalCode: newAddressItem.postalCode,
          };
          newAddressItem.isDefault = true;
        } else {
          currentAddresses.push(newAddressItem);
        }
      }

      const res = await API.put("/auth/profile", {
        address: updatedPrimary,
        addresses: currentAddresses,
      });

      if (res.data?.success && res.data.user) {
        localStorage.setItem("alka_user", JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        setAddress(res.data.user.address || updatedPrimary);
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setIsAddressFormOpen(false);
        setEditingAddressId(null);
        setFeedbackMsg({
          type: "success",
          text: returnTo
            ? "Delivery address saved! Returning to cart..."
            : editingAddressId
            ? "Address updated successfully!"
            : "New delivery address added successfully!",
        });

        if (returnTo) {
          setTimeout(() => {
            navigate(returnTo);
          }, 700);
        }
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to save delivery address.",
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Set Address as Default / Primary
  const handleSetDefaultAddress = async (addr) => {
    try {
      setFeedbackMsg({ type: "", text: "" });
      const newPrimary = {
        street: addr.street,
        city: addr.city || "Bhubaneswar",
        state: addr.state || "Odisha",
        postalCode: addr.postalCode || "751012",
      };

      const res = await API.put("/auth/profile", {
        address: newPrimary,
      });

      if (res.data?.success && res.data.user) {
        localStorage.setItem("alka_user", JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        setAddress(newPrimary);
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setFeedbackMsg({
          type: "success",
          text: `"${addr.street}" set as your primary delivery address!`,
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to set default address.",
      });
    }
  };

  // Delete Saved Address
  const handleDeleteAddress = async (addr) => {
    if (!window.confirm(`Are you sure you want to remove address: "${addr.street}"?`)) {
      return;
    }

    try {
      setFeedbackMsg({ type: "", text: "" });
      let currentAddresses = Array.isArray(currentUser?.addresses) ? [...currentUser.addresses] : [];
      let currentPrimary = { ...(currentUser?.address || address) };

      if (addr._id === "primary" || addr.isDefault) {
        if (currentAddresses.length > 0) {
          const nextDefault = currentAddresses[0];
          currentPrimary = {
            street: nextDefault.street,
            city: nextDefault.city,
            state: nextDefault.state,
            postalCode: nextDefault.postalCode,
          };
          currentAddresses = currentAddresses.slice(1);
        } else {
          currentPrimary = { street: "", city: "Bhubaneswar", state: "Odisha", postalCode: "751012" };
        }
      } else {
        currentAddresses = currentAddresses.filter(
          (item, idx) => item._id !== addr._id && `addr-${idx}` !== addr._id
        );
      }

      const res = await API.put("/auth/profile", {
        address: currentPrimary,
        addresses: currentAddresses,
      });

      if (res.data?.success && res.data.user) {
        localStorage.setItem("alka_user", JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        setAddress(currentPrimary);
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setFeedbackMsg({
          type: "success",
          text: "Address removed successfully.",
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to remove address.",
      });
    }
  };

  // Choose Address for Cart Delivery
  const handleUseAddressForCart = async (addr) => {
    try {
      const newPrimary = {
        street: addr.street,
        city: addr.city || "Bhubaneswar",
        state: addr.state || "Odisha",
        postalCode: addr.postalCode || "751012",
      };

      await API.put("/auth/profile", { address: newPrimary });
      const updatedUser = {
        ...currentUser,
        address: newPrimary,
      };
      localStorage.setItem("alka_user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      window.dispatchEvent(new Event("alkaAuthUpdated"));
      navigate(returnTo || "/cart");
    } catch {
      navigate(returnTo || "/cart");
    }
  };

  // Legacy single address handler
  const handleSaveAddress = handleSaveAddressForm;

  // Save password update
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setFeedbackMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedbackMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      setIsSavingPassword(true);
      setFeedbackMsg({ type: "", text: "" });

      const res = await API.put("/auth/profile", {
        password: passwordForm.newPassword,
      });

      if (res.data?.success) {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setFeedbackMsg({
          type: "success",
          text: "Password updated successfully!",
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Toggle Subscription Pause / Resume
  const handleToggleSubscriptionStatus = async () => {
    if (!subscription) return;
    const isCurrentlyActive = subscription.status === "Active";
    const nextStatus = isCurrentlyActive ? "Paused" : "Active";
    const confirmText = isCurrentlyActive
      ? "Are you sure you want to pause your scheduled alkaline water deliveries? You can resume anytime with 1 click."
      : "Resume scheduled recurring water deliveries?";

    if (!window.confirm(confirmText)) return;

    try {
      setIsUpdatingSub(true);
      setFeedbackMsg({ type: "", text: "" });

      const res = await API.patch("/subscription-orders/my-subscriptions/toggle-status");

      if (res.data?.success && res.data.order) {
        setSubscription(res.data.order);
        setSubOrders((prev) =>
          prev.map((o) => (o._id === res.data.order._id ? res.data.order : o))
        );
        setFeedbackMsg({
          type: "success",
          text: isCurrentlyActive
            ? "Your recurring delivery schedule has been paused. No bottles will be dispatched until resumed."
            : "Your water delivery subscription is now active! Deliveries will resume as scheduled.",
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update subscription status.",
      });
    } finally {
      setIsUpdatingSub(false);
    }
  };

  // Skip Next Delivery
  const handleSkipNextDelivery = async () => {
    if (!window.confirm("Skip your next scheduled alkaline water delivery? Your schedule will automatically resume on the following cycle.")) {
      return;
    }

    try {
      setIsUpdatingSub(true);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 4);

      const updatedSubscription = {
        ...subscription,
        nextDeliveryDate: nextDate.toISOString(),
      };

      const res = await API.put("/auth/profile", {
        subscription: updatedSubscription,
      });

      if (res.data?.success && res.data.user) {
        const fresh = res.data.user;
        localStorage.setItem("alka_user", JSON.stringify(fresh));
        setCurrentUser(fresh);
        setSubscription(fresh.subscription || updatedSubscription);
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setFeedbackMsg({
          type: "success",
          text: `Next drop skipped! Your next scheduled water delivery is set for ${nextDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}.`,
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to skip delivery.",
      });
    } finally {
      setIsUpdatingSub(false);
    }
  };

  // Save Schedule Form
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingSub(true);
      setFeedbackMsg({ type: "", text: "" });

      const res = await API.patch("/subscription-orders/my-subscriptions/update-schedule", {
        deliveryFrequency: scheduleForm.cadence,
        bottlesPerDelivery: Number(scheduleForm.bottlesPerDelivery) || 2,
        deliverySlot: scheduleForm.deliveryTimeSlot,
      });

      if (res.data?.success && res.data.order) {
        setSubscription(res.data.order);
        setSubOrders((prev) =>
          prev.map((o) => (o._id === res.data.order._id ? res.data.order : o))
        );
        setIsEditingSchedule(false);
        setFeedbackMsg({
          type: "success",
          text: "Delivery schedule and cadence updated successfully in database!",
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update schedule.",
      });
    } finally {
      setIsUpdatingSub(false);
    }
  };

  // Switch or Select Plan
  const handleSelectPlan = async (plan) => {
    if (!window.confirm(`Switch your subscription to "${plan.title}" for ₹${plan.price}/${plan.period?.toLowerCase()}?`)) {
      return;
    }

    try {
      setIsUpdatingSub(true);
      const updatedSubscription = {
        ...subscription,
        planId: plan._id,
        planTitle: plan.title,
        status: "Active",
        pricePerDelivery: Number(String(plan.price).replace(/[^0-9.]/g, "")) || 120,
      };

      const res = await API.put("/auth/profile", {
        subscription: updatedSubscription,
        plan: plan.title,
      });

      if (res.data?.success && res.data.user) {
        const fresh = res.data.user;
        localStorage.setItem("alka_user", JSON.stringify(fresh));
        setCurrentUser(fresh);
        setSubscription(fresh.subscription || updatedSubscription);
        window.dispatchEvent(new Event("alkaAuthUpdated"));
        setFeedbackMsg({
          type: "success",
          text: `Subscribed to ${plan.title}! Your new delivery benefits are now active.`,
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to switch plan.",
      });
    } finally {
      setIsUpdatingSub(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out of your account?")) {
      return;
    }
    try {
      await API.post("/auth/logout").catch(() => {});
    } catch {}
    localStorage.removeItem("alka_user");
    localStorage.removeItem("alka_user_token");
    window.dispatchEvent(new Event("alkaAuthUpdated"));
    navigate("/");
  };

  if (!currentUser) return null;

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="Account-page">
      {/* Ambient background glows */}
      <div className="Account-bg-glow Account-bg-glow--one" aria-hidden="true" />
      <div className="Account-bg-glow Account-bg-glow--two" aria-hidden="true" />

      <div className="Account-container">
        {/* Sleek Breadcrumb */}
        <nav className="Account-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="Account-breadcrumb-sep">/</span>
          <Link to="/account">My Account</Link>
          <span className="Account-breadcrumb-sep">/</span>
          <span className="Account-breadcrumb-active">
            {activeTab === "profile" && "My Profile"}
            {activeTab === "subscriptions" && "My Subscriptions"}
            {activeTab === "addresses" && "My Addresses"}
            {activeTab === "orders" && "My Orders"}
            {activeTab === "wishlist" && "My Wishlist"}
            {activeTab === "security" && "Security & Password"}
          </span>
        </nav>

        {/* Layout Grid aligned to full website width */}
        <div className="Account-layout">
          {/* SIDEBAR */}
          <aside className="Account-sidebar">
            {/* User Profile Card */}
            <div className="Account-userCard">
              <div className="Account-avatar-wrap">
                {currentUser.avatar && !avatarLoadError ? (
                  <img
                    src={
                      currentUser.avatar.startsWith("http")
                        ? currentUser.avatar
                        : `http://localhost:5000${currentUser.avatar}`
                    }
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarLoadError(true)}
                    className="Account-avatar Account-avatar-img"
                  />
                ) : (
                  <div className="Account-avatar">{initials}</div>
                )}

                {/* Profile Photo Camera Button */}
                <button
                  type="button"
                  className="Account-avatar-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  title="Upload profile picture"
                  aria-label="Upload profile picture"
                >
                  {isUploadingAvatar ? (
                    <FiRefreshCw className="spin" />
                  ) : (
                    <FiCamera />
                  )}
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  style={{ display: "none" }}
                />

                <span className="Account-avatar-badge" title="Verified Customer">
                  <FiCheck />
                </span>
              </div>

              <h3 className="Account-userName">{currentUser.name || "Valued Customer"}</h3>
              <p className="Account-userEmail">{currentUser.email}</p>

            </div>

            {/* Sidebar Navigation Menu */}
            <nav className="Account-nav" aria-label="Account navigation">
              <button
                type="button"
                className={`Account-navItem ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => handleTabChange("profile")}
              >
                <FiUser />
                <span className="Account-navText">My Profile</span>
              </button>

              <button
                type="button"
                className={`Account-navItem ${activeTab === "subscriptions" ? "active" : ""}`}
                onClick={() => handleTabChange("subscriptions")}
              >
                <FiRefreshCw />
                <span className="Account-navText">My Subscriptions</span>
                {subscription ? (
                  <span
                    className={`Account-navBadge ${
                      subscription.status === "Active" ? "active" : "paused"
                    }`}
                  >
                    {subscription.status}
                  </span>
                ) : subOrders.length > 0 ? (
                  <span className="Account-navCount">{subOrders.length}</span>
                ) : null}
              </button>

              <button
                type="button"
                className={`Account-navItem ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => handleTabChange("orders")}
              >
                <FiPackage />
                <span className="Account-navText">My Orders</span>
                {orders.length > 0 && (
                  <span className="Account-navCount">{orders.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`Account-navItem ${activeTab === "wishlist" ? "active" : ""}`}
                onClick={() => handleTabChange("wishlist")}
              >
                <FiHeart />
                <span className="Account-navText">My Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="Account-navCount">{wishlistCount}</span>
                )}
              </button>

              <button
                type="button"
                className={`Account-navItem ${activeTab === "addresses" ? "active" : ""}`}
                onClick={() => handleTabChange("addresses")}
              >
                <FiMapPin />
                <span className="Account-navText">My Addresses</span>
              </button>

              <button
                type="button"
                className={`Account-navItem ${activeTab === "security" ? "active" : ""}`}
                onClick={() => handleTabChange("security")}
              >
                <FiLock />
                <span className="Account-navText">Security &amp; Password</span>
              </button>

              <button
                type="button"
                className="Account-navItem logout"
                onClick={handleLogout}
              >
                <FiLogOut />
                <span className="Account-navText">Sign Out</span>
              </button>
            </nav>

            {/* Customer Support Helper Card */}
            <div className="Account-supportCard">
              <div className="Account-supportHeader">
                <FiPhone className="Account-supportIcon" />
                <div>
                  <h5>Delivery Helpline</h5>
                  <span>Mon-Sun: 7 AM - 9 PM</span>
                </div>
              </div>
              <p>Direct assistance for water refill deliveries in Bhubaneswar.</p>
              <div className="Account-supportContacts">
                <a href="tel:+919823045671">+91 98230 45671</a>
                <a href="mailto:support@alkadrops.com">support@alkadrops.com</a>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="Account-main">
            {/* Feedback Alerts */}
            {feedbackMsg.text && (
              <div className={`Account-alert ${feedbackMsg.type}`}>
                {feedbackMsg.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* =========================================================
                TAB 1: MY PROFILE
            ========================================================= */}
            {activeTab === "profile" && (
              <section aria-labelledby="profile-heading">
                <div className="Account-sectionHeader">
                  <div>
                    <span className="Account-sectionBadge">Account Center</span>
                    <h2 id="profile-heading">My Profile</h2>
                    <p>Manage your personal details, contact information, and membership status.</p>
                  </div>
                </div>


                {/* Profile Picture Card */}
                <div className="Account-cardBlock">
                  <div className="Account-cardBlockHeader">
                    <h4>
                      <FiCamera /> Profile Picture
                    </h4>
                  </div>

                  <div className="Account-avatarManageRow">
                    <div className="Account-avatarManagePreview">
                      {currentUser.avatar && !avatarManageError ? (
                        <img
                          src={
                            currentUser.avatar.startsWith("http")
                              ? currentUser.avatar
                              : `http://localhost:5000${currentUser.avatar}`
                          }
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarManageError(true)}
                          className="Account-avatarManageImg"
                        />
                      ) : (
                        <div className="Account-avatarLarge">{initials}</div>
                      )}
                    </div>

                    <div className="Account-avatarManageInfo">
                      <strong>Personal Account Photo</strong>
                      <p>
                        Upload a JPG, PNG, or WEBP photo (up to 10MB). Your profile photo appears on your account header, order receipts, and delivery notifications.
                      </p>

                      <div className="Account-avatarManageActions">
                        <button
                          type="button"
                          className="Account-btnPrimary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                        >
                          {isUploadingAvatar ? (
                            <>
                              <FiRefreshCw className="spin" /> Uploading...
                            </>
                          ) : (
                            <>
                              <FiUploadCloud /> {currentUser.avatar ? "Change Photo" : "Upload Photo"}
                            </>
                          )}
                        </button>

                        {currentUser.avatar && (
                          <button
                            type="button"
                            className="Account-btnSecondary"
                            onClick={handleRemoveAvatar}
                            disabled={isUploadingAvatar}
                            style={{ color: "#ef4444" }}
                          >
                            <FiTrash2 /> Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information Form */}
                <div className="Account-cardBlock">
                  <div className="Account-cardBlockHeader">
                    <h4>
                      <FiUser /> Personal Information
                    </h4>
                    {!isEditingProfile && (
                      <button
                        type="button"
                        className="Account-editBtn"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        <FiEdit2 /> Edit Details
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile}>
                      <div className="Account-formGrid">
                        <div className="Account-field">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="Account-field">
                          <label>Contact Phone Number</label>
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="e.g. +91 98765 43210"
                          />
                        </div>

                        <div className="Account-field">
                          <label>Email Address</label>
                          <input
                            type="email"
                            value={currentUser.email}
                            disabled
                            title="Email is locked to your account"
                          />
                        </div>

                        <div className="Account-field">
                          <label>Account Role</label>
                          <input
                            type="text"
                            value={currentUser.role || "Retail Customer"}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="Account-formActions">
                        <button
                          type="button"
                          className="Account-btnSecondary"
                          onClick={() => setIsEditingProfile(false)}
                          disabled={isSavingProfile}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="Account-btnPrimary"
                          disabled={isSavingProfile}
                        >
                          {isSavingProfile ? (
                            <>
                              <FiRefreshCw className="spin" /> Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="Account-formGrid">
                      <div className="Account-field">
                        <label>Full Name</label>
                        <span className="Account-field-display">
                          {currentUser.name || "N/A"}
                        </span>
                      </div>

                      <div className="Account-field">
                        <label>Contact Phone Number</label>
                        <span className="Account-field-display">
                          {currentUser.phone || "Not provided"}
                        </span>
                      </div>

                      <div className="Account-field">
                        <label>Email Address</label>
                        <span className="Account-field-display">
                          {currentUser.email}
                        </span>
                      </div>

                      <div className="Account-field">
                        <label>Account Plan</label>
                        <span className="Account-field-display" style={{ color: "#004ea8" }}>
                          {currentUser.role || "Retail Customer"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* =========================================================
                TAB 2: MY SUBSCRIPTIONS (NEW FEATURE)
            ========================================================= */}
            {activeTab === "subscriptions" && (
              <section aria-labelledby="subscriptions-heading">
                <div className="Account-sectionHeader">
                  <div>
                    <span className="Account-sectionBadge">Recurring Water Schedule</span>
                    <h2 id="subscriptions-heading">My Subscriptions</h2>
                    <p>
                      Automated scheduled alkaline water deliveries, jar refills, and delivery frequency.
                    </p>
                  </div>

                  <Link to="/pricing" className="Account-headerCtaBtn">
                    <FiStar /> Explore All Plans
                  </Link>
                </div>

                {isLoadingSubOrders ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                    <FiRefreshCw className="spin" style={{ fontSize: "28px", color: "#004ea8", marginBottom: "12px" }} />
                    <p>Loading your active hydration passes from database...</p>
                  </div>
                ) : subscription ? (
                  /* Hero Active Subscription Card - Fully Integrated Real Data */
                  <div className="Account-subscriptionHero">
                    <div className="Account-subscriptionHeroHeader">
                      <div className="Account-subPlanMeta">
                        <span
                          className={`Account-subStatusBadge ${
                            subscription.status === "Active" ? "active" : "paused"
                          }`}
                        >
                          <span className="Account-pulseDot" />
                          {subscription.status === "Active"
                            ? "ACTIVE SCHEDULED DELIVERY"
                            : "DELIVERY SCHEDULE PAUSED"}
                        </span>
                        <h3 className="Account-subPlanTitle">
                          {subscription.planTitle || "Alkaline Hydration Pass"}
                        </h3>
                        <p className="Account-subPlanDesc">
                          {subscription.period === "YR"
                            ? "Official Annual VIP Doorstep Hydration Pass • 20L Food-grade cans dispatched from Bhubaneswar Hub."
                            : "Recurring Alkaline Water Supply • Pure pH 8.5+ Natural Alkaline Water jar deliveries."}
                        </p>
                      </div>

                      <div className="Account-subPricingBox">
                        {subscription.orderNumber && (
                          <span className="orderRef">#{subscription.orderNumber}</span>
                        )}
                        <span className="Account-subPrice">
                          ₹{subscription.planPrice || (subscription.totalAmount ? subscription.totalAmount.toLocaleString("en-IN") : "2,999")}
                        </span>
                        <span className="Account-subPricePeriod">
                          /{subscription.period ? subscription.period.toLowerCase() : (subscription.totalAmount >= 2500 ? "yr" : "mo")}
                        </span>
                        <span className="Account-subDiscountTag">
                          {subscription.paymentMethod ? subscription.paymentMethod.toUpperCase() : "COD"} • {subscription.paymentStatus || "Active"}
                        </span>
                      </div>
                    </div>

                    {/* 4 Details Grid */}
                    <div className="Account-subDetailsGrid">
                      <div className="Account-subDetailItem">
                        <span className="Account-subDetailIcon"><FiCalendar /></span>
                        <div>
                          <span className="Account-subDetailLabel">Cadence / Frequency</span>
                          <strong>{subscription.deliveryFrequency || subscription.cadence || "Alternate Days"}</strong>
                        </div>
                      </div>

                      <div className="Account-subDetailItem">
                        <span className="Account-subDetailIcon"><FiDroplet /></span>
                        <div>
                          <span className="Account-subDetailLabel">Quantity per Delivery</span>
                          <strong>
                            {subscription.bottlesPerDelivery || 2} Cans ({ (subscription.bottlesPerDelivery || 2) * 20 } Litres)
                          </strong>
                        </div>
                      </div>

                      <div className="Account-subDetailItem">
                        <span className="Account-subDetailIcon"><FiClock /></span>
                        <div>
                          <span className="Account-subDetailLabel">Delivery Window</span>
                          <strong>{subscription.deliverySlot || subscription.deliveryTimeSlot || "Morning (7 AM - 10 AM)"}</strong>
                        </div>
                      </div>

                      <div className="Account-subDetailItem">
                        <span className="Account-subDetailIcon"><FiTruck /></span>
                        <div>
                          <span className="Account-subDetailLabel">Delivery Partner</span>
                          <strong style={{ color: "#004ea8" }}>
                            {subscription.deliveryBoy?.name && subscription.deliveryBoy.name !== "Unassigned"
                              ? `${subscription.deliveryBoy.name} (${subscription.deliveryBoy.phone || "Active"})`
                              : "Central Hub Fleet (Bhubaneswar)"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Validity Dates (Start Date & End Date) */}
                    <div className="Account-subValidityStrip">
                      <div className="Account-subValidityItem">
                        <FiCalendar style={{ color: "#004ea8", fontSize: "18px" }} />
                        <div>
                          <span className="Account-subDetailLabel">START DATE</span>
                          <strong>
                            {subscription.startDate
                              ? new Date(subscription.startDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </strong>
                        </div>
                      </div>

                      <div className="Account-subValidityDivider" />

                      <div className="Account-subValidityItem">
                        <FiCalendar style={{ color: "#059669", fontSize: "18px" }} />
                        <div>
                          <span className="Account-subDetailLabel">END DATE</span>
                          <strong>
                            {subscription.endDate
                              ? new Date(subscription.endDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Ongoing"}
                          </strong>
                        </div>
                      </div>

                      <div className="Account-subValidityDivider" />

                      <div className="Account-subValidityItem">
                        <FiClock style={{ color: "#7c3aed", fontSize: "18px" }} />
                        <div>
                          <span className="Account-subDetailLabel">PASS STATUS</span>
                          <strong style={{ color: subscription.status === "Active" ? "#059669" : "#d97706" }}>
                            {subscription.status === "Active"
                              ? subscription.endDate
                                ? `${Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} Days Remaining`
                                : "Active Pass"
                              : "Delivery Paused"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Destination Location Strip */}
                    <div className="Account-subAddressStrip">
                      <div className="Account-subAddressInfo">
                        <FiMapPin className="Account-subPinIcon" />
                        <div>
                          <span className="Account-subAddressLabel">DELIVERY HUB DESTINATION:</span>
                          <strong>
                            {subscription.deliveryAddress?.street
                              ? `${subscription.deliveryAddress.street}, ${subscription.deliveryAddress.city || "Bhubaneswar"} - ${subscription.deliveryAddress.postalCode || "751012"}`
                              : address.street
                              ? `${address.street}, ${address.city || "Bhubaneswar"} - ${address.postalCode || "751012"}`
                              : "Bhubaneswar Central Zone, Odisha - 751012"}
                          </strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="Account-subChangeAddressBtn"
                        onClick={() => handleTabChange("addresses")}
                      >
                        Change Address
                      </button>
                    </div>

                    {/* Subscription Action Toolbar */}
                    <div className="Account-subActionToolbar">
                      <button
                        type="button"
                        className={`Account-subBtn ${
                          subscription.status === "Active" ? "pause" : "resume"
                        }`}
                        onClick={handleToggleSubscriptionStatus}
                        disabled={isUpdatingSub}
                      >
                        {subscription.status === "Active" ? (
                          <>
                            <FiPause /> Pause Delivery
                          </>
                        ) : (
                          <>
                            <FiPlay /> Resume Delivery
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="Account-subBtn secondary"
                        onClick={() => setIsEditingSchedule((prev) => !prev)}
                      >
                        <FiSliders /> {isEditingSchedule ? "Close Editor" : "Modify Schedule"}
                      </button>
                    </div>

                    {/* Interactive Schedule Editor Drawer */}
                    {isEditingSchedule && (
                      <form onSubmit={handleSaveSchedule} className="Account-scheduleEditor">
                        <div className="Account-editorHeader">
                          <h4>
                            <FiSliders /> Customize Delivery Schedule
                          </h4>
                          <p>Fine-tune how often and when your alkaline water jars arrive at your doorstep.</p>
                        </div>

                        <div className="Account-formGrid">
                          <div className="Account-field">
                            <label>Delivery Frequency</label>
                            <select
                              value={scheduleForm.cadence}
                              onChange={(e) =>
                                setScheduleForm({ ...scheduleForm, cadence: e.target.value })
                              }
                            >
                              <option value="Daily">Daily (Every 24 Hours)</option>
                              <option value="Alternate Days">Alternate Days (Every 48 Hours)</option>
                              <option value="Twice a Week">Twice a Week (Mon &amp; Thu)</option>
                              <option value="Weekly">Weekly (Every 7 Days)</option>
                            </select>
                          </div>

                          <div className="Account-field">
                            <label>Cans Per Delivery</label>
                            <select
                              value={scheduleForm.bottlesPerDelivery}
                              onChange={(e) =>
                                setScheduleForm({
                                  ...scheduleForm,
                                  bottlesPerDelivery: Number(e.target.value),
                                })
                              }
                            >
                              <option value={1}>1 Jar (20 Litres)</option>
                              <option value={2}>2 Jars (40 Litres) - Recommended</option>
                              <option value={3}>3 Jars (60 Litres)</option>
                              <option value={4}>4 Jars (80 Litres)</option>
                            </select>
                          </div>

                          <div className="Account-field">
                            <label>Preferred Time Slot</label>
                            <select
                              value={scheduleForm.deliveryTimeSlot}
                              onChange={(e) =>
                                setScheduleForm({
                                  ...scheduleForm,
                                  deliveryTimeSlot: e.target.value,
                                })
                              }
                            >
                              <option value="Morning (7 AM - 10 AM)">Morning (7 AM - 10 AM)</option>
                              <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                              <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                            </select>
                          </div>
                        </div>

                        <div className="Account-formActions">
                          <button
                            type="button"
                            className="Account-btnSecondary"
                            onClick={() => setIsEditingSchedule(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="Account-btnPrimary"
                            disabled={isUpdatingSub}
                          >
                            {isUpdatingSub ? "Saving Schedule..." : "Save Delivery Schedule"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  /* Clean Empty State when No Active Subscription */
                  <div className="Account-noSubCard">
                    <div className="Account-noSubIcon">
                      <FiRefreshCw />
                    </div>
                    <h3>No Active Water Subscription Pass</h3>
                    <p>
                      You don't currently have an active recurring water delivery plan. Subscribe to an automated plan to receive 20L alkaline water jars on your schedule with zero delivery fees.
                    </p>
                    <Link to="/pricing" className="Account-headerCtaBtn" style={{ margin: "0 auto", display: "inline-flex" }}>
                      <FiStar /> Browse Subscription Plans &amp; Subscribe
                    </Link>
                  </div>
                )}

                {/* Subscription Orders History */}
                {subOrders.length > 0 && (
                  <div className="Account-cardBlock" style={{ marginTop: "24px" }}>
                    <div className="Account-cardBlockHeader">
                      <div>
                        <h4>
                          <FiPackage /> Subscription Orders History
                        </h4>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                          Review all previous and active subscription passes booked for your account.
                        </p>
                      </div>
                      <span className="Account-navCount">{subOrders.length}</span>
                    </div>

                    <div className="Account-subOrdersHistoryList">
                      {subOrders.map((sOrder) => (
                        <div key={sOrder._id} className="Account-subOrderHistoryCard">
                          <div className="Account-subOrderHistoryTop">
                            <div>
                              <strong style={{ color: "#004ea8", fontSize: "15px" }}>
                                #{sOrder.orderNumber}
                              </strong>
                              <span style={{ marginLeft: "10px", fontWeight: 700, color: "#0f172a" }}>
                                {sOrder.planTitle}
                              </span>
                            </div>
                            <span className={`Account-subStatusBadge ${sOrder.status?.toLowerCase()}`}>
                              {sOrder.status}
                            </span>
                          </div>

                          <div className="Account-subOrderHistoryDetails">
                            <div>
                              <span>VALIDITY PERIOD:</span>
                              <strong>
                                {new Date(sOrder.startDate).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}{" "}
                                —{" "}
                                {new Date(sOrder.endDate).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </strong>
                            </div>
                            <div>
                              <span>SCHEDULE:</span>
                              <strong>
                                {sOrder.deliveryFrequency} ({sOrder.deliverySlot})
                              </strong>
                            </div>
                            <div>
                              <span>QUANTITY:</span>
                              <strong>{sOrder.bottlesPerDelivery} x 20L Jars</strong>
                            </div>
                            <div>
                              <span>PRICE:</span>
                              <strong style={{ color: "#004ea8" }}>
                                ₹{sOrder.totalAmount || sOrder.planPrice} ({sOrder.paymentMethod?.toUpperCase()})
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* =========================================================
                TAB 3: MY ADDRESSES
            ========================================================= */}
            {activeTab === "addresses" && (
              <section aria-labelledby="addresses-heading">
                <div className="Account-sectionHeader">
                  <div>
                    <span className="Account-sectionBadge">Delivery Locations</span>
                    <h2 id="addresses-heading">My Addresses</h2>
                    <p>Manage your saved delivery locations for smooth checkout and automated drops.</p>
                  </div>
                  <button
                    type="button"
                    className="Account-btnPrimary"
                    onClick={handleOpenNewAddressForm}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    <FiPlus /> Add New Address
                  </button>
                </div>

                {returnTo && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)",
                      border: "1.5px solid #38bdf8",
                      borderRadius: "14px",
                      padding: "16px 20px",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: "#0284c7",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "19px",
                          flexShrink: 0,
                        }}
                      >
                        <FiTruck />
                      </div>
                      <div>
                        <strong style={{ display: "block", color: "#0c4a6e", fontSize: "15px" }}>
                          Choose or Add Delivery Address for Cart Checkout
                        </strong>
                        <p style={{ margin: "2px 0 0", color: "#0369a1", fontSize: "13px" }}>
                          Select any address below or add a new one to complete your doorstep delivery order.
                        </p>
                      </div>
                    </div>
                    {address.street && !isAddressFormOpen && (
                      <button
                        type="button"
                        onClick={() => navigate(returnTo)}
                        className="Account-btnPrimary"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 18px",
                          borderRadius: "10px",
                          fontSize: "13.5px",
                          fontWeight: "700",
                        }}
                      >
                        <FiCheck /> Return to Cart
                      </button>
                    )}
                  </div>
                )}

                {/* ADD / EDIT ADDRESS FORM */}
                {isAddressFormOpen && (
                  <div className="Account-cardBlock" style={{ border: "2px solid #0284c7", marginBottom: "26px", boxShadow: "0 8px 24px rgba(2, 132, 199, 0.08)" }}>
                    <div className="Account-cardBlockHeader">
                      <h4>
                        <FiMapPin /> {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                      </h4>
                      <button
                        type="button"
                        className="Account-editBtn"
                        onClick={() => {
                          setIsAddressFormOpen(false);
                          setEditingAddressId(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveAddressForm}>
                      {/* Address Type / Label Pills */}
                      <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                          Address Type / Tag
                        </label>
                        <div className="Account-labelPills">
                          {["Home", "Office", "Apartment", "Other"].map((lbl) => (
                            <button
                              key={lbl}
                              type="button"
                              className={`Account-labelPillBtn ${addressFormData.label === lbl ? "active" : ""}`}
                              onClick={() => setAddressFormData({ ...addressFormData, label: lbl })}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="Account-formGrid" style={{ marginBottom: "16px" }}>
                        <div className="Account-field">
                          <label>Recipient Full Name *</label>
                          <input
                            type="text"
                            value={addressFormData.recipientName}
                            onChange={(e) => setAddressFormData({ ...addressFormData, recipientName: e.target.value })}
                            placeholder="e.g. Saroj Kumar Mallik"
                            required
                          />
                        </div>
                        <div className="Account-field">
                          <label>Contact Phone Number *</label>
                          <input
                            type="tel"
                            value={addressFormData.phone}
                            onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                            placeholder="10-digit mobile number"
                            required
                          />
                        </div>
                      </div>

                      <div className="Account-formGrid full" style={{ marginBottom: "16px" }}>
                        <div className="Account-field">
                          <label>House / Flat No / Street Address / Landmark *</label>
                          <input
                            type="text"
                            value={addressFormData.street}
                            onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                            placeholder="e.g. Plot N5/22, IRC Village, Nayapalli"
                            required
                          />
                        </div>
                      </div>

                      <div className="Account-formGrid">
                        <div className="Account-field">
                          <label>City *</label>
                          <input
                            type="text"
                            value={addressFormData.city}
                            onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                            placeholder="Bhubaneswar"
                            required
                          />
                        </div>
                        <div className="Account-field">
                          <label>State *</label>
                          <input
                            type="text"
                            value={addressFormData.state}
                            onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                            placeholder="Odisha"
                            required
                          />
                        </div>
                        <div className="Account-field">
                          <label>Postal PIN Code *</label>
                          <input
                            type="text"
                            value={addressFormData.postalCode}
                            onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                            placeholder="751012"
                            required
                          />
                        </div>
                      </div>

                      <div style={{ margin: "18px 0 22px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="checkbox"
                          id="isDefaultAddressCheck"
                          checked={addressFormData.isDefault}
                          onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                          style={{ width: "18px", height: "18px", accentColor: "#0284c7", cursor: "pointer" }}
                        />
                        <label htmlFor="isDefaultAddressCheck" style={{ fontSize: "14px", color: "#334155", cursor: "pointer", fontWeight: "600" }}>
                          Set as Primary / Default Delivery Location
                        </label>
                      </div>

                      <div className="Account-formActions">
                        <button
                          type="button"
                          className="Account-btnSecondary"
                          onClick={() => {
                            setIsAddressFormOpen(false);
                            setEditingAddressId(null);
                          }}
                          disabled={isSavingAddress}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="Account-btnPrimary"
                          disabled={isSavingAddress}
                        >
                          {isSavingAddress ? (
                            <>
                              <FiRefreshCw className="spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <FiCheck /> {editingAddressId ? "Update Address" : "Save New Address"}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* SAVED ADDRESSES GRID */}
                {allSavedAddresses.length === 0 && !isAddressFormOpen ? (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "2px dashed #cbd5e1",
                      borderRadius: "16px",
                      padding: "48px 24px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "#e0f2fe",
                        color: "#0284c7",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "26px",
                        marginBottom: "16px",
                      }}
                    >
                      <FiMapPin />
                    </div>
                    <h3 style={{ fontSize: "18px", color: "#0f172a", marginBottom: "8px" }}>
                      No Saved Delivery Addresses
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "420px", margin: "0 auto 20px" }}>
                      Add your home or office address to receive pure alkaline water delivered right to your doorstep.
                    </p>
                    <button
                      type="button"
                      className="Account-btnPrimary"
                      onClick={handleOpenNewAddressForm}
                      style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                    >
                      <FiPlus /> Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="Account-addressGrid">
                    {allSavedAddresses.map((addr, idx) => (
                      <div
                        key={addr._id || idx}
                        className={`Account-addressCardItem ${addr.isDefault ? "is-default" : ""}`}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <span
                              className="Account-addressHubPill"
                              style={
                                addr.isDefault
                                  ? { background: "#e0f2fe", color: "#0369a1", borderColor: "#7dd3fc" }
                                  : { background: "#f1f5f9", color: "#475569", borderColor: "#cbd5e1" }
                              }
                            >
                              <FiMapPin /> {addr.label || (addr.isDefault ? "Primary Hub Address" : "Saved Location")}
                            </span>
                            {addr.isDefault && (
                              <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: "9999px" }}>
                                Default
                              </span>
                            )}
                          </div>

                          <strong className="Account-addressRecipient">
                            {addr.recipientName}
                          </strong>

                          <p className="Account-addressLines">
                            {addr.street}
                            <br />
                            {addr.city}, {addr.state} &bull; PIN: {addr.postalCode}
                          </p>

                          {addr.phone && (
                            <div className="Account-addressPhone" style={{ marginBottom: "18px" }}>
                              <FiPhone /> Contact: {addr.phone}
                            </div>
                          )}
                        </div>

                        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                          <button
                            type="button"
                            className="Account-btnPrimary"
                            onClick={() => handleUseAddressForCart(addr)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              padding: "9px 14px",
                              fontSize: "13.5px",
                              fontWeight: "600",
                              borderRadius: "8px",
                              width: "100%",
                            }}
                          >
                            <FiCheck /> {returnTo ? "Deliver Here & Return to Cart" : "Use this Address for Delivery"}
                          </button>

                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                            {!addr.isDefault && (
                              <button
                                type="button"
                                className="Account-btnSecondary"
                                onClick={() => handleSetDefaultAddress(addr)}
                                style={{ padding: "6px 12px", fontSize: "12.5px", borderRadius: "8px" }}
                              >
                                Make Default
                              </button>
                            )}
                            <button
                              type="button"
                              className="Account-btnSecondary"
                              onClick={() => handleEditAddress(addr)}
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "12.5px", borderRadius: "8px" }}
                            >
                              <FiEdit2 /> Edit
                            </button>
                            {allSavedAddresses.length > 1 && (
                              <button
                                type="button"
                                className="Account-btnSecondary"
                                onClick={() => handleDeleteAddress(addr)}
                                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "12.5px", borderRadius: "8px", color: "#dc2626" }}
                              >
                                <FiTrash2 /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subscription Orders History */}
                {subOrders.length > 0 && (
                  <div className="Account-cardBlock" style={{ marginTop: "24px" }}>
                    <div className="Account-cardBlockHeader">
                      <div>
                        <h4>
                          <FiPackage /> Subscription Orders History
                        </h4>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                          Review all previous and active subscription passes booked for your account.
                        </p>
                      </div>
                      <span className="Account-navCount">{subOrders.length}</span>
                    </div>

                    <div className="Account-subOrdersHistoryList">
                      {subOrders.map((sOrder) => (
                        <div key={sOrder._id} className="Account-subOrderHistoryCard">
                          <div className="Account-subOrderHistoryTop">
                            <div>
                              <strong style={{ color: "#004ea8", fontSize: "15px" }}>
                                #{sOrder.orderNumber}
                              </strong>
                              <span style={{ marginLeft: "10px", fontWeight: 700, color: "#0f172a" }}>
                                {sOrder.planTitle}
                              </span>
                            </div>
                            <span className={`Account-subStatusBadge ${sOrder.status?.toLowerCase()}`}>
                              {sOrder.status}
                            </span>
                          </div>

                          <div className="Account-subOrderHistoryDetails">
                            <div>
                              <span>VALIDITY PERIOD:</span>
                              <strong>
                                {new Date(sOrder.startDate).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}{" "}
                                —{" "}
                                {new Date(sOrder.endDate).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </strong>
                            </div>
                            <div>
                              <span>SCHEDULE:</span>
                              <strong>
                                {sOrder.deliveryFrequency} ({sOrder.deliverySlot})
                              </strong>
                            </div>
                            <div>
                              <span>QUANTITY:</span>
                              <strong>{sOrder.bottlesPerDelivery} x 20L Jars</strong>
                            </div>
                            <div>
                              <span>PRICE:</span>
                              <strong style={{ color: "#004ea8" }}>
                                ₹{sOrder.totalAmount || sOrder.planPrice} ({sOrder.paymentMethod?.toUpperCase()})
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* =========================================================
                TAB 4: MY ORDERS
            ========================================================= */}
            {activeTab === "orders" && (
              <section aria-labelledby="orders-heading">
                <div className="Account-sectionHeader">
                  <div>
                    <span className="Account-sectionBadge">Order History</span>
                    <h2 id="orders-heading">My Orders</h2>
                    <p>Track current alkaline water deliveries and view past invoices.</p>
                  </div>
                </div>

                {isLoadingOrders ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                    <FiRefreshCw className="spin" style={{ fontSize: "28px", color: "#004ea8", marginBottom: "8px" }} />
                    <p>Loading your orders from database...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="Account-emptyState">
                    <FiShoppingBag />
                    <h3>No Orders Placed Yet</h3>
                    <p>
                      Explore our premium 20L jars, dispenser units, and alkaline bottles delivered across Bhubaneswar.
                    </p>
                    <Link to="/shop" className="Account-btnPrimary">
                      Explore Shop Products <FiArrowRight />
                    </Link>
                  </div>
                ) : (
                  <div className="Account-ordersList">
                    {orders.map((ord) => {
                      const statusClass = ord.orderStatus?.toLowerCase() || "processing";
                      const dateStr = ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent";

                      return (
                        <article key={ord._id || ord.orderNumber} className="Account-orderCard">
                          <div className="Account-orderHeader">
                            <div>
                              <span className="Account-orderNum">
                                #{ord.orderNumber || ord._id?.slice(-8)}
                              </span>
                              <span className="Account-orderDate">
                                <FiCalendar style={{ verticalAlign: "middle", marginRight: "4px" }} />
                                {dateStr}
                              </span>
                            </div>
                            <span className={`Account-orderStatus ${statusClass}`}>
                              {ord.orderStatus || "Processing"}
                            </span>
                          </div>

                          <div className="Account-orderItems">
                            {(ord.items || []).map((item, idx) => (
                              <div key={idx} className="Account-orderItemRow">
                                <span>
                                  {item.quantity}x {item.title || item.name}
                                </span>
                                <strong>
                                  ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                                </strong>
                              </div>
                            ))}
                          </div>

                          <div className="Account-orderFooter">
                            <span>
                              <FiTruck style={{ verticalAlign: "middle", marginRight: "4px" }} />
                              Delivery to: {ord.shippingAddress?.city || "Bhubaneswar"} ({ord.paymentMethod?.toUpperCase() || "COD"})
                            </span>
                            <span className="Account-orderTotal">Total: ₹{ord.totalAmount}</span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* =========================================================
                TAB 5: MY WISHLIST
            ========================================================= */}
            {activeTab === "wishlist" && (
              <section aria-labelledby="wishlist-heading">
                <div className="Account-sectionHeader">
                  <div>
                    <span className="Account-sectionBadge">Saved Products</span>
                    <h2 id="wishlist-heading">My Wishlist</h2>
                    <p>
                      Your favorite alkaline bottles and hydration packs saved for quick reordering.
                    </p>
                  </div>
                  {wishlist.length > 0 && (
                    <button
                      type="button"
                      className="Account-btnSecondary"
                      onClick={() => navigate("/wishlist")}
                    >
                      <FiShoppingBag /> View Full Wishlist
                    </button>
                  )}
                </div>

                {wishlist.length === 0 ? (
                  <div className="Account-emptyState">
                    <FiHeart />
                    <h3>Your Wishlist is Empty</h3>
                    <p>
                      Explore our premium alkaline water collection and tap the heart icon on any product to save it here!
                    </p>
                    <button
                      type="button"
                      className="Account-btnPrimary"
                      onClick={() => navigate("/shop")}
                    >
                      Explore Shop
                    </button>
                  </div>
                ) : (
                  <div className="Account-wishlistGrid">
                    {wishlist.map((item) => {
                      const pId = item._id || item.id;
                      const pPrice = Number(item.price) || 0;
                      const pOldPrice = Number(item.oldPrice) || 0;
                      const pImage =
                        item.image ||
                        "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85";
                      const pName = item.name || item.title || "Alkaline Product";

                      return (
                        <div className="Account-wishlistCard" key={pId}>
                          <div className="Account-wishlistImgWrap">
                            <img src={pImage} alt={pName} />
                            <button
                              type="button"
                              className="Account-wishlistDelete"
                              onClick={() => removeFromWishlist(pId)}
                              title="Remove from Wishlist"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                          <div className="Account-wishlistBody">
                            <span className="Account-wishlistCat">
                              {item.category || "Alkaline Water"}
                            </span>
                            <h5>{pName}</h5>
                            <div className="Account-wishlistPriceRow">
                              <span className="Account-wishlistPrice">₹{pPrice}</span>
                              {pOldPrice > pPrice && (
                                <del className="Account-wishlistOldPrice">
                                  ₹{pOldPrice}
                                </del>
                              )}
                            </div>
                            <button
                              type="button"
                              className="Account-btnPrimary"
                              style={{ width: "100%", justifyContent: "center" }}
                              onClick={() => moveToCart(item, 1)}
                            >
                              <FiShoppingBag /> Move to Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* =========================================================
                TAB 6: SECURITY & PASSWORD
            ========================================================= */}
            {activeTab === "security" && (
              <section aria-labelledby="security-heading">
                <div className="Account-sectionHeader">
                  <div>
                    <span className="Account-sectionBadge">Authentication &amp; Privacy</span>
                    <h2 id="security-heading">Security &amp; Password</h2>
                    <p>Update your password to keep your Alka Drops account secure.</p>
                  </div>
                </div>

                <div className="Account-cardBlock">
                  <div className="Account-cardBlockHeader">
                    <h4>
                      <FiLock /> Change Account Password
                    </h4>
                  </div>

                  <form onSubmit={handleSavePassword}>
                    <div className="Account-formGrid">
                      <div className="Account-field">
                        <label>New Password *</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="At least 6 characters"
                          required
                          minLength={6}
                        />
                      </div>

                      <div className="Account-field">
                        <label>Confirm New Password *</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Re-enter new password"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="Account-formActions">
                      <button
                        type="submit"
                        className="Account-btnPrimary"
                        disabled={isSavingPassword}
                      >
                        {isSavingPassword ? (
                          <>
                            <FiRefreshCw className="spin" /> Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Account;
