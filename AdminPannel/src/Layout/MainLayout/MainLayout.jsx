import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

import "./MainLayout.css";

const pageTitles = {
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

// Fallback title for routes that are not listed above.
const prettify = (pathname) =>
  pathname
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

const MainLayout = () => {
  const location = useLocation();

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const currentTitle =
    pageTitles[location.pathname] || prettify(location.pathname);

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth <= 768;

      setIsMobile(mobile);

      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen((previous) => !previous);
    } else {
      setIsSidebarVisible((previous) => !previous);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  // Close the mobile sidebar after every page change.
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div
      className={`MainLayout ${
        isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"
      } ${isMobileOpen ? "mobile-sidebar-open" : ""}`}
    >
      <Sidebar
        isVisible={isMobile ? true : isSidebarVisible}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobileSidebar}
      />

      <div className="MainLayout-container">
        <Topbar toggleSidebar={toggleSidebar} />

        <main className="MainLayout-content">
          <h1 className="page-title">{currentTitle}</h1>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
