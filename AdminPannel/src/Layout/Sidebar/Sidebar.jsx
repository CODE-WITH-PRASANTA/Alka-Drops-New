
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Images,
  BookOpen,
  FileText,
  Newspaper,
  MessageSquare,
  Users,
  Package,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  ChevronDown,
  UserRound,
  Tags,
  Receipt,
  UserPlus,
  MapPin,
  Box,
  ShoppingCart,
} from "lucide-react";

import bottleImg from "../../assets/Screenshot (1).webp";
import "./Sidebar.css";

const WHITE_CUTOFF = 246;
const FEATHER_START = 208;

const useBackgroundRemovedImage = (src) => {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;

    if (!canvas) return undefined;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = src;

    img.onload = () => {
      if (cancelled) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const minChannel = Math.min(r, g, b);

          if (minChannel >= WHITE_CUTOFF) {
            data[i + 3] = 0;
          } else if (minChannel > FEATHER_START) {
            const fade =
              (minChannel - FEATHER_START) /
              (WHITE_CUTOFF - FEATHER_START);

            data[i + 3] = Math.round(data[i + 3] * (1 - fade));
          }
        }

        ctx.putImageData(imageData, 0, 0);
      } catch (err) {
        console.warn("Bottle background removal skipped:", err);
      }

      setIsReady(true);
    };

    img.onerror = () => {
      if (!cancelled) setIsReady(false);
    };

    return () => {
      cancelled = true;
    };
  }, [src]);

  return { canvasRef, isReady };
};

const AlkaDropsMark = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 40 40"
    width="40"
    height="40"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="alkaMarkBgDark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0b1e3d" />
        <stop offset="50%" stopColor="#061226" />
        <stop offset="100%" stopColor="#020814" />
      </linearGradient>

      <linearGradient id="alkaMarkBorder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="100%" stopColor="rgba(79,169,245,0.2)" />
      </linearGradient>

      <linearGradient id="alkaMarkDropVibrant" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>

      <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="2.5"
          floodColor="#0284c7"
          floodOpacity="0.6"
        />
      </filter>
    </defs>

    <rect
      x="0.5"
      y="0.5"
      width="39"
      height="39"
      rx="11.5"
      fill="none"
      stroke="url(#alkaMarkBorder)"
    />

    <rect
      x="1.5"
      y="1.5"
      width="37"
      height="37"
      rx="10.5"
      fill="url(#alkaMarkBgDark)"
    />

    <path
      d="M20 7.5 C15.2 15 10.8 20.6 10.8 25.8 C10.8 31.5 14.8 35.5 20 35.5 C25.2 35.5 29.2 31.5 29.2 25.8 C29.2 20.6 24.8 15 20 7.5 Z"
      fill="url(#alkaMarkDropVibrant)"
      filter="url(#dropGlow)"
    />

    <path
      d="M14.5 23.5 C14.5 27.2 17 30 20.2 30.4"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.85"
    />

    <circle cx="24.5" cy="16.5" r="1.4" fill="#ffffff" />
  </svg>
);

const Sidebar = ({ isCollapsed, isMobileOpen }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const location = useLocation();

  const {
    canvasRef: bottleCanvasRef,
    isReady: isBottleReady,
  } = useBackgroundRemovedImage(bottleImg);

  const toggleDropdown = (title) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const menuItems = [
    {
      type: "link",
      icon: <LayoutDashboard size={20} />,
      text: "Dashboard",
      path: "/dashboard",
    },
    {
      type: "link",
      icon: <ShoppingBag size={20} />,
      text: "Shop",
      path: "/shop",
    },
    {
      type: "link",
      icon: <ClipboardList size={20} />,
      text: "Orders",
      path: "/orders",
    },
    {
      type: "link",
      icon: <Images size={20} />,
      text: "Gallery",
      path: "/gallery",
    },
    {
      type: "dropdown",
      icon: <BookOpen size={20} />,
      text: "Blog",
      subItems: [
        {
          text: "Blog Post",
          path: "/blog/post",
          icon: <FileText size={16} />,
        },
        {
          text: "Blog Management",
          path: "/blog/management",
          icon: <Newspaper size={16} />,
        },
       
      ],
    },
    {
      type: "link",
      icon: <MessageSquare size={20} />,
      text: "Enquiry",
      path: "/enquiry",
    },
    {
      type: "link",
      icon: <Users size={20} />,
      text: "Customers",
      path: "/customers",
    },
    {
      type: "link",
      icon: <Package size={20} />,
      text: "Products",
      path: "/products",
    },
    {
      type: "link",
      icon: <Truck size={20} />,
      text: "Delivery",
      path: "/delivery",
    },
    {
      type: "link",
      icon: <Wallet size={20} />,
      text: "Finance",
      path: "/finance",
    },
    {
      type: "link",
      icon: <BarChart3 size={20} />,
      text: "Reports",
      path: "/reports",
    },
    {
      type: "link",
      icon: <Settings size={20} />,
      text: "Settings",
      path: "/settings",
    },
  ];

  // Automatically open the dropdown when one of its pages is active.
  useEffect(() => {
    const activeDropdowns = {};

    menuItems.forEach((item) => {
      if (item.type === "dropdown") {
        const hasActiveChild = item.subItems.some(
          (subItem) =>
            location.pathname === subItem.path ||
            location.pathname.startsWith(`${subItem.path}/`)
        );

        if (hasActiveChild) {
          activeDropdowns[item.text] = true;
        }
      }
    });

    setOpenDropdowns((prev) => ({
      ...prev,
      ...activeDropdowns,
    }));
  }, [location.pathname]);

  return (
    <aside
      className={`Sidebar ${isCollapsed ? "collapsed" : ""} ${
        isMobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="Sidebar-sheen" aria-hidden="true" />

      {/* Logo */}
      <div className="Sidebar-logo">
        <div className="Sidebar-logo-iconWrap">
          <AlkaDropsMark className="Sidebar-logo-icon" />
        </div>

        {!isCollapsed && (
          <div className="Sidebar-logo-text-group">
            <span className="Sidebar-logo-text">Alka Drops</span>
            <span className="Sidebar-logo-tagline">
              Pure. Refreshing. Healthy.
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="Sidebar-nav">
        {menuItems.map((item, index) => {
          if (item.type === "link") {
            return (
              <NavLink
                key={index}
                to={item.path}
                title={isCollapsed ? item.text : undefined}
                className={({ isActive }) =>
                  `Sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <span className="Sidebar-icon">{item.icon}</span>

                {!isCollapsed && (
                  <span className="Sidebar-text">{item.text}</span>
                )}
              </NavLink>
            );
          }

          const isDropdownOpen = !!openDropdowns[item.text];

          return (
            <div
              key={index}
              className={`Sidebar-dropdown-wrapper ${
                isDropdownOpen ? "is-open" : ""
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  !isCollapsed && toggleDropdown(item.text)
                }
                title={isCollapsed ? item.text : undefined}
                className="Sidebar-link Sidebar-dropdown-toggle"
                aria-expanded={isDropdownOpen}
              >
                <span className="Sidebar-icon">{item.icon}</span>

                {!isCollapsed && (
                  <>
                    <span className="Sidebar-text">{item.text}</span>

                    <ChevronDown
                      size={16}
                      className={`Sidebar-chevron ${
                        isDropdownOpen ? "rotated" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {!isCollapsed && (
                <div className="Sidebar-submenu">
                  {item.subItems.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `Sidebar-submenu-link ${
                          isActive ? "active" : ""
                        }`
                      }
                    >
                      <span className="Sidebar-submenu-icon">
                        {subItem.icon}
                      </span>
                      <span>{subItem.text}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Bottle Design */}
      {!isCollapsed && (
        <div className="Sidebar-brandFooter">
          <svg
            className="Sidebar-brandFooter-waves"
            viewBox="0 0 270 170"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="wave wave-1"
              d="M0 90 Q34 66 68 90 T136 90 T204 90 T272 90 V170 H0 Z"
            />
            <path
              className="wave wave-2"
              d="M0 112 Q34 88 68 112 T136 112 T204 112 T272 112 V170 H0 Z"
            />
            <path
              className="wave wave-3"
              d="M0 134 Q34 114 68 134 T136 134 T204 134 T272 134 V170 H0 Z"
            />

            <circle className="droplet droplet-1" cx="24" cy="56" r="2.4" />
            <circle className="droplet droplet-2" cx="54" cy="82" r="1.8" />
            <circle className="droplet droplet-3" cx="12" cy="96" r="1.5" />
            <circle className="droplet droplet-4" cx="200" cy="38" r="2.2" />
            <circle className="droplet droplet-5" cx="220" cy="56" r="1.6" />
          </svg>

          <div className="Sidebar-bottle-wrapper">
            <div className="Sidebar-bottle-glow" />
            <div className="Sidebar-bottle-ring" />

            <canvas
              ref={bottleCanvasRef}
              className={`Sidebar-bottle-img ${
                isBottleReady ? "is-ready" : ""
              }`}
              role="img"
              aria-label="Alka Drops water bottle"
            />

            <div className="Sidebar-bottle-shadow" />
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
