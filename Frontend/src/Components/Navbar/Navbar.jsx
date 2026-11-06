import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiShoppingCart,
  FiHeart,
  FiX,
  FiUser,
  FiMapPin,
  FiPackage,
  FiLogOut,
  FiChevronDown,
  FiRefreshCw,
} from "react-icons/fi";
import { useShop } from "../../context/ShopContext";
import API from "../../services/api";

import "./Navbar.css";
import logo from "../../assets/ALKA DROPS LOGO.png";

// Desktop breakpoint — keep in sync with Navbar.css
const DESKTOP_MIN_WIDTH = 1241;

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Subscription" },
  { to: "/shop", label: "Shop" },
  { to: "/services", label: "Services" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQs" },
  { to: "/team", label: "Our Team" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, wishlistCount } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("alka_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const profileDropdownRef = useRef(null);

  // Sync auth state on changes or cross-tab events
  useEffect(() => {
    const syncUser = () => {
      try {
        const saved = localStorage.getItem("alka_user");
        setCurrentUser(saved ? JSON.parse(saved) : null);
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener("alkaAuthUpdated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("alkaAuthUpdated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock background scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Close mobile menu with Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(min-width: ${DESKTOP_MIN_WIDTH}px)`
    );

    const handleChange = (event) => {
      if (event.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((previous) => !previous);
  };

  const handleNavigate = (path) => {
    closeMobileMenu();
    navigate(path);
  };

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    closeMobileMenu();
    try {
      await API.post("/auth/logout").catch(() => {});
    } catch {}
    localStorage.removeItem("alka_user");
    localStorage.removeItem("alka_user_token");
    setCurrentUser(null);
    window.dispatchEvent(new Event("alkaAuthUpdated"));
    navigate("/");
  };

  const openAccountTab = (tab) => {
    setIsProfileDropdownOpen(false);
    closeMobileMenu();
    navigate(`/account?tab=${tab}`);
  };

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "U";

  const firstName = currentUser?.name
    ? currentUser.name.split(" ")[0]
    : "Account";

  return (
    <>
      <header
        className={`navbar-wrapper ${
          isScrolled ? "scrolled-state" : "hero-state"
        }`}
      >
        <nav className="navbar" aria-label="Main Navigation">
          {/* Brand Logo */}
          <Link
            to="/"
            className="navbar-brand"
            onClick={closeMobileMenu}
            aria-label="Alka Drops Home"
          >
            <img
              src={logo}
              alt="Alka Drops Logo"
              className="navbar-logo"
            />
          </Link>

          {/* Desktop Navigation / Mobile Drawer */}
          <div
            id="primary-navigation"
            className={`navbar-menu-container ${
              isMobileMenuOpen ? "is-open" : ""
            }`}
          >
            <ul className="navbar-menu">
              {NAV_LINKS.map((link, index) => (
                <li
                  className="navbar-item"
                  key={link.to}
                  style={{ "--i": index }}
                >
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `navbar-link ${isActive ? "active-link" : ""}`
                    }
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Mobile Navigation Actions */}
            <div className="navbar-mobile-actions">
              {currentUser ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      background: "#f0f7ff",
                      borderRadius: "12px",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar.startsWith("http") ? currentUser.avatar : `http://localhost:5000${currentUser.avatar}`}
                        alt={currentUser.name || "User"}
                        className="navbar-user-avatar large"
                      />
                    ) : (
                      <span className="navbar-user-avatar large">{userInitial}</span>
                    )}
                    <div style={{ minWidth: 0, textAlign: "left" }}>
                      <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>
                        {currentUser.name}
                      </strong>
                      <span style={{ fontSize: "12px", color: "#64748b", display: "block", wordBreak: "break-all" }}>
                        {currentUser.email}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={() => openAccountTab("profile")}
                  >
                    <FiUser /> <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={() => openAccountTab("subscriptions")}
                  >
                    <FiRefreshCw /> <span>My Subscriptions</span>
                  </button>

                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={() => openAccountTab("addresses")}
                  >
                    <FiMapPin /> <span>My Addresses</span>
                  </button>

                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={() => openAccountTab("orders")}
                  >
                    <FiPackage /> <span>My Orders</span>
                  </button>

                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={() => {
                      closeMobileMenu();
                      handleNavigate("/wishlist");
                    }}
                  >
                    <FiHeart /> <span>My Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="navbar-cart-badge navbar-wishlist-badge inline">
                        {wishlistCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="navbar-dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <FiLogOut /> <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="navbar-btn-secondary full-width"
                    onClick={() => handleNavigate("/login")}
                  >
                    Log In
                  </button>

                  <button
                    type="button"
                    className="navbar-btn-primary full-width"
                    onClick={() => handleNavigate("/shop")}
                  >
                    Order Now
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right-Side Actions */}
          <div className="navbar-actions">
            {/* Wishlist Icon Button */}
            <button
              type="button"
              className="navbar-icon-btn cart-icon-relative"
              onClick={() => handleNavigate("/wishlist")}
              aria-label="View Wishlist"
              title="My Wishlist"
            >
              <FiHeart />
              {wishlistCount > 0 && (
                <span className="navbar-cart-badge navbar-wishlist-badge">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon Button with Dynamic Badge */}
            <button
              type="button"
              className="navbar-icon-btn cart-icon-relative"
              onClick={() => handleNavigate("/cart")}
              aria-label="View Shopping Cart"
              title="Shopping Cart"
            >
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="navbar-cart-badge">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Desktop User Account Pill OR Login Button */}
            {currentUser ? (
              <div
                className="navbar-profile-wrapper hide-on-mobile"
                ref={profileDropdownRef}
              >
                <button
                  type="button"
                  className="navbar-profile-pill-btn"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Account Profile Menu"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar.startsWith("http") ? currentUser.avatar : `http://localhost:5000${currentUser.avatar}`}
                      alt={currentUser.name || "User"}
                      className="navbar-user-avatar"
                    />
                  ) : (
                    <span className="navbar-user-avatar">
                      {userInitial}
                    </span>
                  )}
                  <span className="navbar-user-name-text">
                    {firstName}
                  </span>
                  <FiChevronDown
                    className={`navbar-profile-arrow ${
                      isProfileDropdownOpen ? "open" : ""
                    }`}
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="navbar-profile-dropdown" role="menu">
                    <div
                      className="navbar-dropdown-user-header"
                      onClick={() => openAccountTab("profile")}
                      title="View Profile Details"
                    >
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar.startsWith("http") ? currentUser.avatar : `http://localhost:5000${currentUser.avatar}`}
                          alt={currentUser.name || "User"}
                          className="navbar-user-avatar large"
                        />
                      ) : (
                        <span className="navbar-user-avatar large">
                          {userInitial}
                        </span>
                      )}
                      <div className="navbar-dropdown-meta">
                        <strong className="navbar-dropdown-name">
                          {currentUser.name || "Customer"}
                        </strong>
                        <span className="navbar-dropdown-email">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>

                    <div className="navbar-dropdown-divider" />

                    <button
                      type="button"
                      className="navbar-dropdown-item"
                      onClick={() => openAccountTab("profile")}
                      role="menuitem"
                    >
                      <FiUser /> <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      className="navbar-dropdown-item"
                      onClick={() => openAccountTab("subscriptions")}
                      role="menuitem"
                    >
                      <FiRefreshCw /> <span>My Subscriptions</span>
                    </button>

                    <button
                      type="button"
                      className="navbar-dropdown-item"
                      onClick={() => openAccountTab("addresses")}
                      role="menuitem"
                    >
                      <FiMapPin /> <span>My Addresses</span>
                    </button>

                    <button
                      type="button"
                      className="navbar-dropdown-item"
                      onClick={() => openAccountTab("orders")}
                      role="menuitem"
                    >
                      <FiPackage /> <span>My Orders</span>
                    </button>

                    <button
                      type="button"
                      className="navbar-dropdown-item"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleNavigate("/wishlist");
                      }}
                      role="menuitem"
                    >
                      <FiHeart /> <span>My Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="navbar-cart-badge navbar-wishlist-badge inline">
                          {wishlistCount}
                        </span>
                      )}
                    </button>

                    <div className="navbar-dropdown-divider" />

                    <button
                      type="button"
                      className="navbar-dropdown-item logout"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <FiLogOut /> <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="navbar-btn-secondary hide-on-mobile"
                onClick={() => handleNavigate("/login")}
              >
                Log In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className={`navbar-toggle ${
                isMobileMenuOpen ? "is-open" : ""
              }`}
              onClick={toggleMobileMenu}
              aria-label={
                isMobileMenuOpen
                  ? "Close Navigation Menu"
                  : "Open Navigation Menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="primary-navigation"
            >
              {isMobileMenuOpen ? (
                <FiX className="navbar-toggle-icon" />
              ) : (
                <>
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                  <span className="hamburger-line"></span>
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="navbar-backdrop"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
      </header>
    </>
  );
};

export default Navbar;
