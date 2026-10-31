import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import "./MainLayout.css";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className={`MainLayout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
      />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="MainLayout-overlay"
          onClick={closeMobileSidebar}
        />
      )}

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