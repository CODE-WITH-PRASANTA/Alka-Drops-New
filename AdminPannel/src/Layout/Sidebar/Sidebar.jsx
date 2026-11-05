import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Package,
  Users,
  Images,
  Crown,
  ShoppingCart,
  CalendarDays,
  UserRound,
  Truck,
  Settings,
  ChartNoAxesColumn,
  Mail,
  Star,
  ChevronDown,
  X,
  FileText,
  ClipboardList,
  Droplets,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

const menuItems = [
  { title: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  {
    title: "Blog Management",
    icon: Newspaper,
    children: [
      { title: "Blog Post", path: "/admin/blog-post", icon: FileText },
      {
        title: "Blog Management",
        path: "/admin/blog-management",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Product Management",
    path: "/admin/product-management",
    icon: Package,
  },
  { title: "Team Management", path: "/admin/team-management", icon: Users },
  {
    title: "Gallery Management",
    path: "/admin/gallery-management",
    icon: Images,
  },
  {
    title: "Subscription Management",
    path: "/admin/subscription-management",
    icon: Crown,
  },
  {
    title: "Order Management",
    path: "/admin/order-management",
    icon: ShoppingCart,
  },
  {
    title: "Subscription Orders Manage",
    path: "/admin/subscription-orders",
    icon: CalendarDays,
  },
  { title: "User Management", path: "/admin/user-management", icon: UserRound },
  {
    title: "Delivery Boy Management",
    icon: Truck,
    children: [
      {
        title: "Delivery Boy ID Generation",
        path: "/admin/delivery-boy-id",
        icon: FileText,
      },
      {
        title: "Assigning Bottle",
        path: "/admin/assigning-bottle",
        icon: ClipboardList,
      },
    ],
  },
  { title: "Settings", path: "/admin/settings", icon: Settings },
  {
    title: "Report Management",
    path: "/admin/report-management",
    icon: ChartNoAxesColumn,
  },
  {
    title: "Enquiry Management",
    path: "/admin/enquiry-management",
    icon: Mail,
  },
  { title: "Review Management", path: "/admin/review-management", icon: Star },
];

const Sidebar = ({
  isVisible = true,
  isMobileOpen = false,
  onCloseMobile = () => {},
}) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  // Open the dropdown whose child matches the current URL.
  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => child.path === location.pathname)
    );

    setOpenDropdown(activeParent?.title || null);
  }, [location.pathname]);

  const handleDropdown = (title) => {
    setOpenDropdown((current) => (current === title ? null : title));
  };

  const handleNavigation = () => {
    onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="alka-sidebar-overlay"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`alka-sidebar ${!isVisible ? "alka-sidebar-hidden" : ""} ${
          isMobileOpen ? "alka-sidebar-mobile-open" : ""
        }`}
      >
        <div className="alka-sidebar-header">
          <div className="alka-brand">
            <div className="alka-brand-icon">
              <Droplets size={24} />
            </div>

            <div className="alka-brand-info">
              <span className="alka-brand-name">Alka Drops</span>
              <span className="alka-brand-subtitle">Admin Panel</span>
            </div>
          </div>

          <button
            type="button"
            className="alka-mobile-close"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="alka-sidebar-content">
          <div className="alka-section-label">MAIN MENU</div>

          <nav className="alka-sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = Boolean(item.children?.length);
              const isOpen = openDropdown === item.title;
              const childActive = item.children?.some(
                (child) => child.path === location.pathname
              );

              if (hasChildren) {
                return (
                  <div
                    className={`alka-menu-group ${
                      isOpen ? "alka-menu-group-open" : ""
                    }`}
                    key={item.title}
                  >
                    <button
                      type="button"
                      className={`alka-menu-link alka-dropdown-trigger ${
                        childActive ? "alka-active" : ""
                      }`}
                      onClick={() => handleDropdown(item.title)}
                      aria-expanded={isOpen}
                    >
                      <span className="alka-menu-icon">
                        <Icon size={20} />
                      </span>

                      <span className="alka-menu-text">{item.title}</span>

                      <ChevronDown
                        size={17}
                        className={`alka-dropdown-chevron ${
                          isOpen ? "alka-chevron-open" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`alka-submenu ${
                        isOpen ? "alka-submenu-open" : ""
                      }`}
                    >
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;

                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={handleNavigation}
                            className={({ isActive }) =>
                              `alka-submenu-link ${
                                isActive ? "alka-submenu-active" : ""
                              }`
                            }
                          >
                            <span className="alka-submenu-icon">
                              <ChildIcon size={16} />
                            </span>

                            <span>{child.title}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    `alka-menu-link ${isActive ? "alka-active" : ""}`
                  }
                >
                  <span className="alka-menu-icon">
                    <Icon size={20} />
                  </span>

                  <span className="alka-menu-text">{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="alka-sidebar-footer">
          <div className="alka-footer-icon">
            <Droplets size={18} />
          </div>

          <div className="alka-footer-content">
            <span className="alka-footer-title">Alka Drops</span>
            <span className="alka-footer-version">Admin Dashboard</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;