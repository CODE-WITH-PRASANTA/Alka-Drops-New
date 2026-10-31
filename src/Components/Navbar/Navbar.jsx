import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiShoppingCart,
  FiX,
} from "react-icons/fi";

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
  { to: "/testimonials", label: "Testimonials" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  }, [location.pathname]);

  // Close mobile menu with Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
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

  return (
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
          </div>
        </div>

        {/* Right-Side Actions */}
        <div className="navbar-actions">
          {/* Static Cart Icon — No Context or Dynamic Count */}
          <button
            type="button"
            className="navbar-icon-btn cart-icon-relative"
            onClick={() => handleNavigate("/cart")}
            aria-label="View Shopping Cart"
          >
            <FiShoppingCart />
          </button>

          {/* Desktop Login Button */}
          <button
            type="button"
            className="navbar-btn-secondary hide-on-mobile"
            onClick={() => handleNavigate("/login")}
          >
            Log In
          </button>

          {/* Desktop Contact Button */}
          <button
            type="button"
            className="navbar-btn-primary hide-on-mobile"
            onClick={() => handleNavigate("/contact")}
          >
            Contact Us
          </button>

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
  );
};

export default Navbar;