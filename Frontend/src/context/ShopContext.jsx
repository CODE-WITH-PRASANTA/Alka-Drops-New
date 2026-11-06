import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const CART_KEY = "shoppingCart";
const WISHLIST_KEY = "alkaWishlist";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // ==========================================
  // CART STATE
  // ==========================================
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.error("Error loading cart from storage:", e);
      return [];
    }
  });

  // ==========================================
  // WISHLIST STATE
  // ==========================================
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.error("Error loading wishlist from storage:", e);
      return [];
    }
  });

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, visible: true });
  }, []);

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  // ==========================================
  // PERSIST CART
  // ==========================================
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("shoppingCartUpdated"));
    } catch (e) {
      console.error("Error saving cart to storage:", e);
    }
  }, [cart]);

  // ==========================================
  // PERSIST WISHLIST
  // ==========================================
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (e) {
      console.error("Error saving wishlist to storage:", e);
    }
  }, [wishlist]);

  // Cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_KEY && e.newValue) {
        try {
          setCart(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === WISHLIST_KEY && e.newValue) {
        try {
          setWishlist(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Helper to normalize product format
  const normalizeProduct = (product) => {
    const id = String(product._id || product.id || `item-${Date.now()}`);
    const name = product.name || product.title || "Alkaline Water Product";
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    let oldPrice = Number(product.oldPrice) || 0;
    if (!oldPrice && discount > 0 && price > 0) {
      oldPrice = Math.round(price / (1 - discount / 100));
    }
    const image = product.image || product.coverImage || FALLBACK_IMAGE;
    const category = product.category || "Alkaline Water";
    const size = product.size || product.liter || "1 Litre";
    const badge = product.badge || "";
    const description =
      typeof product.description === "string"
        ? product.description.replace(/<[^>]*>?/gm, "")
        : "";

    return {
      id,
      _id: id,
      name,
      title: name,
      price,
      oldPrice,
      discount,
      image,
      category,
      size,
      badge,
      description,
    };
  };

  // ==========================================
  // CART ACTIONS
  // ==========================================
  const addToCart = (product, quantity = 1) => {
    const normalized = normalizeProduct(product);
    const qtyToAdd = Math.max(1, Number(quantity) || 1);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => String(item.id) === normalized.id || String(item._id) === normalized.id
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = Number(updated[existingIndex].qty) || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: currentQty + qtyToAdd,
        };
        return updated;
      } else {
        return [...prevCart, { ...normalized, qty: qtyToAdd }];
      }
    });

    showToast(`Added ${qtyToAdd}x "${normalized.name}" to cart!`, "success");
  };

  const updateQuantity = (productId, delta) => {
    const targetId = String(productId);
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (String(item.id) === targetId || String(item._id) === targetId) {
          const currentQty = Number(item.qty) || 1;
          const nextQty = Math.max(1, currentQty + delta);
          return { ...item, qty: nextQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    const targetId = String(productId);
    setCart((prevCart) =>
      prevCart.filter(
        (item) => String(item.id) !== targetId && String(item._id) !== targetId
      )
    );
    showToast("Item removed from cart.", "info");
  };

  const clearCart = () => {
    setCart([]);
    showToast("Shopping cart cleared.", "info");
  };

  const isInCart = (productId) => {
    if (!productId) return false;
    const targetId = String(productId);
    return cart.some(
      (item) => String(item.id) === targetId || String(item._id) === targetId
    );
  };

  // Cart calculations
  const cartCount = cart.reduce(
    (total, item) => total + Math.max(0, Number(item.qty) || 1),
    0
  );

  const cartSubtotal = cart.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * Math.max(0, Number(item.qty) || 1),
    0
  );

  const deliveryCharge = 0;
  const cartTotal = cartSubtotal + deliveryCharge;

  const totalSavings = cart.reduce(
    (total, item) =>
      total +
      Math.max(0, (Number(item.oldPrice) || 0) - (Number(item.price) || 0)) *
        Math.max(0, Number(item.qty) || 1),
    0
  );

  // ==========================================
  // WISHLIST ACTIONS
  // ==========================================
  const isInWishlist = (productId) => {
    if (!productId) return false;
    const targetId = String(productId);
    return wishlist.some(
      (item) => String(item.id) === targetId || String(item._id) === targetId
    );
  };

  const addToWishlist = (product) => {
    const normalized = normalizeProduct(product);
    if (!isInWishlist(normalized.id)) {
      setWishlist((prev) => [normalized, ...prev]);
      showToast(`Saved "${normalized.name}" to wishlist!`, "success");
      return true;
    }
    return false;
  };

  const removeFromWishlist = (productId) => {
    const targetId = String(productId);
    setWishlist((prev) =>
      prev.filter(
        (item) => String(item.id) !== targetId && String(item._id) !== targetId
      )
    );
    showToast("Item removed from wishlist.", "info");
  };

  const toggleWishlist = (product) => {
    const normalized = normalizeProduct(product);
    if (isInWishlist(normalized.id)) {
      removeFromWishlist(normalized.id);
      return false;
    } else {
      addToWishlist(normalized);
      return true;
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast("Wishlist cleared.", "info");
  };

  const moveToCart = (product, quantity = 1) => {
    const normalized = normalizeProduct(product);
    addToCart(normalized, quantity);
    removeFromWishlist(normalized.id);
  };

  const moveAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((item) => {
      addToCart(item, 1);
    });
    setWishlist([]);
    showToast(`Moved all ${wishlist.length} items to shopping cart!`, "success");
  };

  const wishlistCount = wishlist.length;

  return (
    <ShopContext.Provider
      value={{
        // Cart
        cart,
        setCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isInCart,
        cartCount,
        cartSubtotal,
        deliveryCharge,
        cartTotal,
        totalSavings,

        // Wishlist
        wishlist,
        setWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        moveToCart,
        moveAllToCart,
        wishlistCount,

        // Notifications
        toast,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};

export default ShopContext;

