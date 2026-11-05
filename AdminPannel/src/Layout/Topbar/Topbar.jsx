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

  "/admin/user-management": UserRound,

  "/admin/delivery-boy-id": Truck,
  "/admin/assigning-bottle": ClipboardList,

  "/admin/settings": Settings,
  "/admin/report-management": ChartNoAxesColumn,
  "/admin/enquiry-management": Mail,
  "/admin/review-management": Star,
};

// Parent group shown in the breadcrumb for dropdown children.
const routeParents = {
  "/admin/blog-post": "Blog Management",
  "/admin/blog-management": "Blog Management",
  "/admin/delivery-boy-id": "Delivery Boy Management",
  "/admin/assigning-bottle": "Delivery Boy Management",
};

// Fallback title for routes that are not listed above.
const prettify = (pathname) =>
  pathname
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

const Topbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const currentTitle =
    routeTitles[location.pathname] || prettify(location.pathname);

  const parentTitle = routeParents[location.pathname];

  const CurrentIcon = routeIcons[location.pathname] || LayoutDashboard;

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  // Close dropdowns when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Close dropdowns when changing pages.
  useEffect(() => {
    setNotificationOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Search current admin pages.
  const searchablePages = Object.entries(routeTitles).map(([path, title]) => ({
    path,
    title,
  }));

  const filteredPages = searchablePages.filter((page) =>
    page.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSearchChange = (value) => {
    setSearchValue(value);
    setSearchOpen(value.trim().length > 0);
  };

  const handleSearchNavigate = (path) => {
    navigate(path);

    setSearchValue("");
    setSearchOpen(false);
  };

  const markAllRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const handleNotificationClick = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  const handleLogout = () => {
    setProfileOpen(false);

    // Connect your actual logout logic here.
    // Example:
    // localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <header className="alka-topbar">
      {/* LEFT SECTION */}
      <div className="alka-topbar-left">
        {/* Sidebar toggle (flush with the sidebar edge) */}
        <button
          type="button"
          className="alka-topbar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Menu size={21} strokeWidth={2} />
        </button>

        {/* Breadcrumb: Home / Parent / Current page */}
        <div className="alka-breadcrumb">
          <Link to="/admin/dashboard" className="alka-breadcrumb-home">
            Home
          </Link>

          <span className="alka-breadcrumb-separator">/</span>

          {parentTitle && (
            <>
              <span className="alka-breadcrumb-parent">{parentTitle}</span>
              <span className="alka-breadcrumb-separator">/</span>
            </>
          )}

          <div className="alka-breadcrumb-current">
            <span className="alka-breadcrumb-icon">
              <CurrentIcon size={16} />
            </span>

            <span>{currentTitle}</span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="alka-topbar-right">
        {/* Search */}
        <div
          className={`alka-search-wrapper ${
            searchOpen ? "alka-search-active" : ""
          }`}
          ref={searchRef}
        >
          <div className="alka-search-box">
            <Search size={18} className="alka-search-icon" />

            <input
              type="text"
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => {
                if (searchValue.trim()) {
                  setSearchOpen(true);
                }
              }}
              placeholder="Search pages..."
              aria-label="Search admin pages"
            />

            {searchValue && (
              <button
                type="button"
                className="alka-search-clear"
                onClick={() => {
                  setSearchValue("");
                  setSearchOpen(false);
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {searchOpen && (
            <div className="alka-search-dropdown">
              <div className="alka-dropdown-heading">SEARCH RESULTS</div>

              {filteredPages.length > 0 ? (
                filteredPages.map((page) => {
                  const PageIcon = routeIcons[page.path] || LayoutDashboard;

                  return (
                    <button
                      key={page.path}
                      type="button"
                      className="alka-search-result"
                      onClick={() => handleSearchNavigate(page.path)}
                    >
                      <span className="alka-search-result-icon">
                        <PageIcon size={17} />
                      </span>

                      <span>{page.title}</span>
                    </button>
                  );
                })
              ) : (
                <div className="alka-search-empty">No pages found</div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="alka-topbar-dropdown-wrapper" ref={notificationRef}>
          <button
            type="button"
            className={`alka-topbar-icon-button ${
              notificationOpen ? "alka-topbar-button-active" : ""
            }`}
            onClick={() => setNotificationOpen((previous) => !previous)}
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            <Bell size={19} strokeWidth={1.9} />

            {unreadCount > 0 && (
              <span className="alka-notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="alka-notification-dropdown">
              <div className="alka-notification-header">
                <div>
                  <h3>Notifications</h3>

                  <span>
                    {unreadCount > 0
                      ? `${unreadCount} unread notifications`
                      : "You're all caught up"}
                  </span>
                </div>

                <button
                  type="button"
                  className="alka-mark-read"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              </div>

              <div className="alka-notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className={`alka-notification-item ${
                        notification.unread ? "alka-notification-unread" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <span className="alka-notification-icon">
                        <Bell size={17} />
                      </span>

                      <span className="alka-notification-content">
                        <strong>{notification.title}</strong>

                        <span>{notification.message}</span>

                        <small>{notification.time}</small>
                      </span>

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

              <div className="alka-notification-footer">
                <span>Alka Drops Admin</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="alka-topbar-dropdown-wrapper" ref={profileRef}>
          <button
            type="button"
            className={`alka-profile-button ${
              profileOpen ? "alka-profile-active" : ""
            }`}
            onClick={() => setProfileOpen((previous) => !previous)}
            aria-expanded={profileOpen}
          >
            <div className="alka-profile-avatar">
              <UserRound size={19} />
            </div>

            <div className="alka-profile-info">
              <span className="alka-profile-name">Admin</span>

              <span className="alka-profile-role">Administrator</span>
            </div>

            <ChevronDown
              size={16}
              className={`alka-profile-chevron ${
                profileOpen ? "alka-profile-chevron-open" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="alka-profile-dropdown">
              <div className="alka-profile-dropdown-header">
                <div className="alka-profile-avatar-large">
                  <UserRound size={23} />
                </div>

                <div className="alka-profile-dropdown-text">
                  <strong>Admin</strong>

                  <small>Administrator</small>
                </div>
              </div>

              <div className="alka-profile-dropdown-divider" />

              <Link
                to="/admin/settings"
                className="alka-profile-dropdown-item"
                onClick={() => setProfileOpen(false)}
              >
                <Settings size={17} />

                <span>Settings</span>
              </Link>

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