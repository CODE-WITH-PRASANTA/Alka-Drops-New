
import React, { useState, useEffect, useRef } from "react";

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
  X,
  LayoutDashboard,
  Newspaper,
  Package,
  Users,
  Images,
  Crown,
  ShoppingCart,
  CalendarDays,
  Truck,
  ChartNoAxesColumn,
  Mail,
  Star,
  FileText,
  ClipboardList,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import "./Topbar.css";

/* =========================================
   ROUTE TITLES
========================================= */

const routeTitles = {
  "/admin/dashboard": "Dashboard",

  "/admin/blog-post": "Blog Post",
  "/admin/blog-management": "Blog Management",

  "/admin/product-management": "Product Management",
  "/admin/team-management": "Team Management",
  "/admin/gallery-management": "Gallery Management",

  "/admin/subscription-management": "Subscription Management",
  "/admin/order-management": "Order Management",
  "/admin/subscription-orders": "Subscription Orders Management",

  "/admin/user-management": "User Management",

  "/admin/delivery-boy-id": "Delivery Boy ID Generation",
  "/admin/assigning-bottle": "Assigning Bottle",

  "/admin/settings": "Settings",
  "/admin/report-management": "Report Management",
  "/admin/enquiry-management": "Enquiry Management",
  "/admin/review-management": "Review Management",
};

/* =========================================
   ROUTE ICONS
========================================= */

const routeIcons = {
  "/admin/dashboard": LayoutDashboard,

  "/admin/blog-post": FileText,
  "/admin/blog-management": Newspaper,

  "/admin/product-management": Package,
  "/admin/team-management": Users,
  "/admin/gallery-management": Images,

  "/admin/subscription-management": Crown,
  "/admin/order-management": ShoppingCart,
  "/admin/subscription-orders": CalendarDays,

  "/admin/user-management": Users,

  "/admin/delivery-boy-id": Truck,
  "/admin/assigning-bottle": ClipboardList,

  "/admin/settings": Settings,
  "/admin/report-management": ChartNoAxesColumn,
  "/admin/enquiry-management": Mail,
  "/admin/review-management": Star,
};

/* =========================================
   BREADCRUMB PARENT ROUTES
========================================= */

const routeParents = {
  "/admin/blog-post": "Blog Management",
  "/admin/blog-management": "Blog Management",

  "/admin/delivery-boy-id": "Delivery Boy Management",
  "/admin/assigning-bottle": "Delivery Boy Management",
};

/* =========================================
   FALLBACK ROUTE TITLE
========================================= */

const prettify = (pathname) => {
  return (
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase()) ||
    "Dashboard"
  );
};

/* =========================================
   TOPBAR COMPONENT
========================================= */

const Topbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  /* =========================================
     SEARCH STATE
  ========================================= */

  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  /* =========================================
     DROPDOWN STATES
  ========================================= */

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /* =========================================
     NOTIFICATIONS
  ========================================= */

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to Alka Drops",
      message: "Your admin dashboard is ready.",
      time: "Recently",
      unread: true,
    },

    {
      id: 2,
      title: "Dashboard updated",
      message: "Your dashboard is running successfully.",
      time: "Recently",
      unread: true,
    },
  ]);

  /* =========================================
     REFS
  ========================================= */

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  /* =========================================
     CURRENT ROUTE INFORMATION
  ========================================= */

  const currentTitle =
    routeTitles[location.pathname] || prettify(location.pathname);

  const parentTitle = routeParents[location.pathname];

  const CurrentIcon = routeIcons[location.pathname] || LayoutDashboard;

  /* =========================================
     UNREAD NOTIFICATION COUNT
  ========================================= */

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  /* =========================================
     SEARCHABLE ADMIN PAGES
  ========================================= */

  const searchablePages = Object.entries(routeTitles).map(
    ([path, title]) => ({
      path,
      title,
    })
  );

  const filteredPages = searchablePages.filter((page) =>
    page.title.toLowerCase().includes(searchValue.trim().toLowerCase())
  );

  /* =========================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  ========================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* =========================================
     CLOSE DROPDOWNS WHEN ROUTE CHANGES
  ========================================= */

  useEffect(() => {
    setNotificationOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  /* =========================================
     SEARCH CHANGE
  ========================================= */

  const handleSearchChange = (value) => {
    setSearchValue(value);

    setSearchOpen(value.trim().length > 0);
  };

  /* =========================================
     SEARCH NAVIGATION
  ========================================= */

  const handleSearchNavigate = (path) => {
    navigate(path);

    setSearchValue("");
    setSearchOpen(false);
  };

  /* =========================================
     CLEAR SEARCH
  ========================================= */

  const handleClearSearch = () => {
    setSearchValue("");
    setSearchOpen(false);
  };

  /* =========================================
     MARK ALL NOTIFICATIONS READ
  ========================================= */

  const markAllRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  /* =========================================
     MARK INDIVIDUAL NOTIFICATION READ
  ========================================= */

  const handleNotificationClick = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    setProfileOpen(false);

    // Add your actual authentication logout logic here.
    // Example:
    // localStorage.removeItem("token");

    navigate("/login");
  };

  /* =========================================
     TOGGLE NOTIFICATIONS
  ========================================= */

  const handleNotificationToggle = () => {
    setNotificationOpen((previous) => !previous);

    setProfileOpen(false);
    setSearchOpen(false);
  };

  /* =========================================
     TOGGLE PROFILE
  ========================================= */

  const handleProfileToggle = () => {
    setProfileOpen((previous) => !previous);

    setNotificationOpen(false);
    setSearchOpen(false);
  };

  /* =========================================
     TOPBAR JSX
  ========================================= */

  return (
    <header className="alka-topbar">

      {/* =====================================
          LEFT SECTION
      ===================================== */}

      <div className="alka-topbar-left">

        {/* SIDEBAR TOGGLE */}

        <button
          type="button"
          className="alka-topbar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Menu size={21} strokeWidth={2} />
        </button>

        {/* BREADCRUMB */}

        <div className="alka-breadcrumb">

          {/* HOME */}

          <Link
            to="/admin/dashboard"
            className="alka-breadcrumb-home"
          >
            Home
          </Link>

          <span className="alka-breadcrumb-separator">
            /
          </span>

          {/* PARENT */}

          {parentTitle && (
            <>
              <span className="alka-breadcrumb-parent">
                {parentTitle}
              </span>

              <span className="alka-breadcrumb-separator">
                /
              </span>
            </>
          )}

          {/* CURRENT PAGE */}

          <div className="alka-breadcrumb-current">

            <span className="alka-breadcrumb-icon">
              <CurrentIcon size={16} />
            </span>

            <span>{currentTitle}</span>

          </div>

        </div>

      </div>

      {/* =====================================
          RIGHT SECTION
      ===================================== */}

      <div className="alka-topbar-right">

        {/* ===================================
            SEARCH
        =================================== */}

        <div
          className={`alka-search-wrapper ${
            searchOpen ? "alka-search-active" : ""
          }`}
          ref={searchRef}
        >

          {/* SEARCH BOX */}

          <div className="alka-search-box">

            <Search
              size={18}
              className="alka-search-icon"
            />

            <input
              type="text"
              value={searchValue}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              onFocus={() => {
                if (searchValue.trim()) {
                  setSearchOpen(true);
                }
              }}
              placeholder="Search pages..."
              aria-label="Search admin pages"
            />

            {/* CLEAR SEARCH */}

            {searchValue && (
              <button
                type="button"
                className="alka-search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}

          </div>

          {/* SEARCH RESULTS */}

          {searchOpen && (
            <div className="alka-search-dropdown">

              <div className="alka-dropdown-heading">
                SEARCH RESULTS
              </div>

              {filteredPages.length > 0 ? (

                filteredPages.map((page) => {

                  const PageIcon =
                    routeIcons[page.path] || LayoutDashboard;

                  return (
                    <button
                      key={page.path}
                      type="button"
                      className="alka-search-result"
                      onClick={() =>
                        handleSearchNavigate(page.path)
                      }
                    >

                      <span className="alka-search-result-icon">
                        <PageIcon size={17} />
                      </span>

                      <span>{page.title}</span>

                    </button>
                  );

                })

              ) : (

                <div className="alka-search-empty">
                  No pages found
                </div>

              )}

            </div>
          )}

        </div>

        {/* ===================================
            NOTIFICATIONS
        =================================== */}

        <div
          className="alka-topbar-dropdown-wrapper"
          ref={notificationRef}
        >

          {/* NOTIFICATION BUTTON */}

          <button
            type="button"
            className={`alka-topbar-icon-button ${
              notificationOpen
                ? "alka-topbar-button-active"
                : ""
            }`}
            onClick={handleNotificationToggle}
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >

            <Bell size={19} strokeWidth={1.9} />

            {/* UNREAD BADGE */}

            {unreadCount > 0 && (
              <span className="alka-notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}

          </button>

          {/* NOTIFICATION DROPDOWN */}

          {notificationOpen && (

            <div className="alka-notification-dropdown">

              {/* HEADER */}

              <div className="alka-notification-header">

                <div>

                  <h3>Notifications</h3>

                  <span>
                    {unreadCount > 0
                      ? `${unreadCount} unread notifications`
                      : "You're all caught up"}
                  </span>

                </div>

                {/* MARK ALL READ */}

                <button
                  type="button"
                  className="alka-mark-read"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </button>

              </div>

              {/* NOTIFICATION LIST */}

              <div className="alka-notification-list">

                {notifications.length > 0 ? (

                  notifications.map((notification) => (

                    <button
                      key={notification.id}
                      type="button"
                      className={`alka-notification-item ${
                        notification.unread
                          ? "alka-notification-unread"
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationClick(notification.id)
                      }
                    >

                      {/* ICON */}

                      <span className="alka-notification-icon">
                        <Bell size={17} />
                      </span>

                      {/* CONTENT */}

                      <span className="alka-notification-content">

                        <strong>
                          {notification.title}
                        </strong>

                        <span>
                          {notification.message}
                        </span>

                        <small>
                          {notification.time}
                        </small>

                      </span>

                      {/* UNREAD DOT */}

                      {notification.unread && (
                        <span className="alka-unread-dot" />
                      )}

                    </button>

                  ))

                ) : (

                  <div className="alka-notification-empty">

                    <Bell size={24} />

                    <span>No notifications</span>

                  </div>

                )}

              </div>

              {/* FOOTER */}

              <div className="alka-notification-footer">

                <span>Alka Drops Admin</span>

              </div>

            </div>

          )}

        </div>

        {/* ===================================
            PROFILE
        =================================== */}

        <div
          className="alka-topbar-dropdown-wrapper"
          ref={profileRef}
        >

          {/* PROFILE BUTTON */}

          <button
            type="button"
            className={`alka-profile-button ${
              profileOpen ? "alka-profile-active" : ""
            }`}
            onClick={handleProfileToggle}
            aria-expanded={profileOpen}
            aria-label="Admin profile"
          >

            {/* AVATAR */}

            <div className="alka-profile-avatar">

              <UserRound size={19} />

            </div>

            {/* PROFILE INFO */}

            <div className="alka-profile-info">

              <span className="alka-profile-name">
                Admin
              </span>

              <span className="alka-profile-role">
                Administrator
              </span>

            </div>

            {/* CHEVRON */}

            <ChevronDown
              size={16}
              className={`alka-profile-chevron ${
                profileOpen
                  ? "alka-profile-chevron-open"
                  : ""
              }`}
            />

          </button>

          {/* PROFILE DROPDOWN */}

          {profileOpen && (

            <div className="alka-profile-dropdown">

              {/* PROFILE HEADER */}

              <div className="alka-profile-dropdown-header">

                <div className="alka-profile-avatar-large">

                  <UserRound size={23} />

                </div>

                <div className="alka-profile-dropdown-text">

                  <strong>Admin</strong>

                  <small>Administrator</small>

                </div>

              </div>

              {/* DIVIDER */}

              <div className="alka-profile-dropdown-divider" />

              {/* SETTINGS */}

              <Link
                to="/admin/settings"
                className="alka-profile-dropdown-item"
                onClick={() => setProfileOpen(false)}
              >

                <Settings size={17} />

                <span>Settings</span>

              </Link>

              {/* LOGOUT */}

              <button
                type="button"
                className="alka-profile-dropdown-item alka-logout-item"
                onClick={handleLogout}
              >

                <LogOut size={17} />

                <span>Logout</span>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
};

export default Topbar;
