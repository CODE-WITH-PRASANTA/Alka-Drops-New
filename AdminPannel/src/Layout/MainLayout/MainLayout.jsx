import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

import "./MainLayout.css";

const MainLayout = () => {
  const location = useLocation();

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
