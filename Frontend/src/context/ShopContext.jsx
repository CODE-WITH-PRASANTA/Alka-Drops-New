import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=700&auto=format&fit=crop&q=85";

const ShopContext = createContext();

// Helper to obtain unique user identifier from localStorage
const getUserIdentifier = () => {
  try {
    const raw = localStorage.getItem("alka_user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user ? String(user._id || user.id || user.email || "").trim() : null;
  } catch {
    return null;
  }
};

const getCartStorageKey = (uid) => {
  return uid ? `shoppingCart_user_${uid}` : "shoppingCart_guest";
};

const getWishlistStorageKey = (uid) => {
  return uid ? `alkaWishlist_user_${uid}` : "alkaWishlist_guest";
};

// Safe storage reader with legacy fallback migration
const loadStoredItems = (key, fallbackLegacyKey = null) => {
  try {
    let saved = localStorage.getItem(key);
    if (!saved && fallbackLegacyKey) {
      saved = localStorage.getItem(fallbackLegacyKey);
      if (saved) {
        localStorage.setItem(key, saved);
        localStorage.removeItem(fallbackLegacyKey);
      }
    }
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (e) {
    console.error("Storage read error:", e);
    return [];
  }
};

export const ShopProvider = ({ children }) => {
  // Current user ID reference to manage cart isolation
  const activeUserIdRef = useRef(getUserIdentifier());
  const [activeUserId, setActiveUserId] = useState(() => getUserIdentifier());

  // ==========================================
  // CART STATE (ISOLATED PER USER / GUEST)
  // ==========================================
  const [cart, setCart] = useState(() => {
    const uid = getUserIdentifier();
    const storageKey = getCartStorageKey(uid);
    return loadStoredItems(storageKey, uid ? null : "shoppingCart");
  });

  // ==========================================
  // WISHLIST STATE (ISOLATED PER USER / GUEST)
  // ==========================================
  const [wishlist, setWishlist] = useState(() => {
    const uid = getUserIdentifier();
    const storageKey = getWishlistStorageKey(uid);
    return loadStoredItems(storageKey, uid ? null : "alkaWishlist");
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
  // USER LOGIN / LOGOUT TRANSITION HANDLING
  // ==========================================
  useEffect(() => {
    const handleAuthChange = () => {
      const newUid = getUserIdentifier();
      const prevUid = activeUserIdRef.current;

      if (newUid === prevUid) return;

      activeUserIdRef.current = newUid;
      setActiveUserId(newUid);

      if (newUid && !prevUid) {
        // CASE 1: Guest just LOGGED IN
        // Take any items the guest had picked before logging in
        const guestCart = loadStoredItems("shoppingCart_guest", "shoppingCart");
        const userSavedCart = loadStoredItems(getCartStorageKey(newUid));

        // Merge guest items into user cart without losing previous user items
        let mergedCart = [...userSavedCart];
        if (guestCart.length > 0) {
          guestCart.forEach((gItem) => {
            const gId = String(gItem.id || gItem._id);
            const existingIdx = mergedCart.findIndex(
              (uItem) => String(uItem.id || uItem._id) === gId
            );
            if (existingIdx > -1) {
              const currentQty = Number(mergedCart[existingIdx].qty) || 1;
              const addedQty = Number(gItem.qty) || 1;
              mergedCart[existingIdx] = {
                ...mergedCart[existingIdx],
                qty: currentQty + addedQty,
              };
            } else {
              mergedCart.push(gItem);
            }
          });
          // Clear guest cart once absorbed
          try {
            localStorage.removeItem("shoppingCart_guest");
            localStorage.removeItem("shoppingCart");
          } catch {}
        }

        // Save merged cart to user's storage
        try {
          localStorage.setItem(getCartStorageKey(newUid), JSON.stringify(mergedCart));
        } catch {}

        setCart(mergedCart);

        // Also merge wishlist
        const guestWishlist = loadStoredItems("alkaWishlist_guest", "alkaWishlist");
        const userWishlist = loadStoredItems(getWishlistStorageKey(newUid));
        let mergedWishlist = [...userWishlist];
        guestWishlist.forEach((gw) => {
          const wId = String(gw.id || gw._id);
          if (!mergedWishlist.some((uw) => String(uw.id || uw._id) === wId)) {
            mergedWishlist.push(gw);
          }
        });
        try {
          localStorage.removeItem("alkaWishlist_guest");
          localStorage.removeItem("alkaWishlist");
          localStorage.setItem(getWishlistStorageKey(newUid), JSON.stringify(mergedWishlist));
        } catch {}
        setWishlist(mergedWishlist);
      } else if (!newUid && prevUid) {
        // CASE 2: User just LOGGED OUT
        // DO NOT show the logged-out user's items! Switch to fresh guest cart.
        const guestCart = loadStoredItems("shoppingCart_guest");
        setCart(guestCart);

        const guestWishlist = loadStoredItems("alkaWishlist_guest");
        setWishlist(guestWishlist);
      } else if (newUid && prevUid && newUid !== prevUid) {
        // CASE 3: Switched between two different user accounts
        const otherUserCart = loadStoredItems(getCartStorageKey(newUid));
        setCart(otherUserCart);
        const otherUserWishlist = loadStoredItems(getWishlistStorageKey(newUid));
        setWishlist(otherUserWishlist);
      }
    };

    window.addEventListener("alkaAuthUpdated", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("alkaAuthUpdated", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // ==========================================
  // PERSIST CART (TIED TO CURRENT ACCOUNT)
  // ==========================================
  useEffect(() => {
    try {
      const storageKey = getCartStorageKey(activeUserId);
      localStorage.setItem(storageKey, JSON.stringify(cart));
      window.dispatchEvent(new Event("shoppingCartUpdated"));
    } catch (e) {
      console.error("Error saving cart to storage:", e);
    }
  }, [cart, activeUserId]);

  // ==========================================
  // PERSIST WISHLIST (TIED TO CURRENT ACCOUNT)
  // ==========================================
  useEffect(() => {
    try {
      const storageKey = getWishlistStorageKey(activeUserId);
      localStorage.setItem(storageKey, JSON.stringify(wishlist));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (e) {
      console.error("Error saving wishlist to storage:", e);
    }
  }, [wishlist, activeUserId]);

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
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => String(item.id) === targetId || String(item._id) === targetId
      );

      if (existing) {
        const currentQty = Number(existing.qty || existing.quantity) || 1;
        const nextQty = currentQty + delta;

        // When quantity reaches 0 or below, remove item from cart
        if (nextQty <= 0) {
          showToast(`"${existing.name || existing.title || "Item"}" removed from cart.`, "info");
          return prevCart.filter(
            (item) => String(item.id) !== targetId && String(item._id) !== targetId
          );
        }
      }

      return prevCart.map((item) => {
        if (String(item.id) === targetId || String(item._id) === targetId) {
          const currentQty = Number(item.qty || item.quantity) || 1;
          const nextQty = Math.max(1, currentQty + delta);
          return { ...item, qty: nextQty, quantity: nextQty };
        }
        return item;
      });
    });
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

  const getItemQty = (productId) => {
    if (!productId) return 0;
    const targetId = String(productId);
    const item = cart.find(
      (p) => String(p.id) === targetId || String(p._id) === targetId
    );
    return item ? Math.max(0, Number(item.qty || item.quantity) || 0) : 0;
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

  const addToWishlist = (product, silent = false) => {
    const normalized = normalizeProduct(product);
    if (!isInWishlist(normalized.id)) {
      setWishlist((prev) => [normalized, ...prev]);
      if (!silent) {
        showToast(`Saved "${normalized.name}" to wishlist!`, "success");
      }
      return true;
    }
    return false;
  };

  const removeFromWishlist = (productId, silent = false) => {
    const targetId = String(productId);
    const targetItem = wishlist.find(
      (item) => String(item.id) === targetId || String(item._id) === targetId
    );
    setWishlist((prev) =>
      prev.filter(
        (item) => String(item.id) !== targetId && String(item._id) !== targetId
      )
    );
    if (!silent) {
      const name = targetItem?.name || targetItem?.title || "Item";
      showToast(`Removed "${name}" from wishlist.`, "info");
    }
  };

  const toggleWishlist = (product) => {
    if (!product) return false;
    const pId = String(product._id || product.id);
    if (isInWishlist(pId)) {
      removeFromWishlist(pId);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

  const moveToCart = (product, quantity = 1) => {
    if (!product) return;
    const pId = String(product._id || product.id);
    const normalized = normalizeProduct(product);
    addToCart(normalized, quantity);
    removeFromWishlist(pId, true);
    showToast(`Moved "${normalized.name}" to cart!`, "success");
  };

  const moveAllToCart = () => {
    if (wishlist.length === 0) return;
    const count = wishlist.length;
    wishlist.forEach((item) => {
      addToCart(item, 1);
    });
    setWishlist([]);
    showToast(`Moved all ${count} item(s) to your cart!`, "success");
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast("Wishlist cleared.", "info");
  };

  const wishlistCount = wishlist.length;

  return (
    <ShopContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isInCart,
        getItemQty,
        cartCount,
        cartSubtotal,
        deliveryCharge,
        cartTotal,
        totalSavings,
        wishlist,
        setWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        moveToCart,
        moveAllToCart,
        isInWishlist,
        wishlistCount,
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
