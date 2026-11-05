import React, { useEffect, useRef, useState } from "react";
import "./FloatingIcons.css";

/* ---------------------------------
   Alka Drops Contact Details
--------------------------------- */
const CONTACT = {
  display: "+91 73270 92477",
  tel: "+917327092477",
  wa: "917327092477",
};

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello Alka Drops! I would like to get more information about your alkaline water."
);

const CALL_HREF = `tel:${CONTACT.tel}`;
const WHATSAPP_HREF = `https://wa.me/${CONTACT.wa}?text=${WHATSAPP_MESSAGE}`;

/* Show the scroll-to-top button after this many px */
const SHOW_AFTER = 300;

/* Scroll progress ring: circle r=24 -> circumference */
const RING_RADIUS = 24;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/* ---------------------------------
   Icons
--------------------------------- */
const PhoneIcon = () => (
  <svg className="FloatingIcons__svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="FloatingIcons__svg FloatingIcons__svg--wa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15c-1.49 0-2.94-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.01 4.54-3.69 8.23-8.22 8.23zm4.51-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.47-.31z" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg
    className="FloatingIcons__svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

/* ---------------------------------
   Helpers
--------------------------------- */
const isPageScroller = (el) =>
  !el ||
  el === window ||
  el === document ||
  el === document.documentElement ||
  el === document.body;

const getMetrics = (el) => {
  if (isPageScroller(el)) {
    const doc = document.documentElement;
    const body = document.body;
    const top = window.scrollY || doc.scrollTop || body.scrollTop || 0;
    const height = Math.max(doc.scrollHeight, body.scrollHeight);
    return { top, max: height - window.innerHeight };
  }
  return { top: el.scrollTop, max: el.scrollHeight - el.clientHeight };
};

const isMainScroller = (el) =>
  el.scrollHeight - el.clientHeight > 200 &&
  el.clientHeight >= window.innerHeight * 0.5;

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const getScrolledElements = (preferred) => {
  const list = new Set();
  const pageEl = document.scrollingElement || document.documentElement;
  list.add(pageEl);
  list.add(document.documentElement);
  list.add(document.body);

  if (preferred) list.add(preferred);

  document.querySelectorAll("body *").forEach((el) => {
    if (el.scrollTop > 0) list.add(el);
  });

  return Array.from(list).filter((el) => el && el.scrollTop > 0);
};

/* ---------------------------------
   Component
--------------------------------- */
const FloatingIcons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [progress, setProgress] = useState(0);

  const scrollerRef = useRef(null);
  const animRef = useRef({ frame: 0, stop: null });

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const { top, max } = getMetrics(scrollerRef.current);
      setShowScrollTop(top > SHOW_AFTER);
      setProgress(max > 0 ? Math.min(1, Math.max(0, top / max)) : 0);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const handleScroll = (event) => {
      const target = event.target;

      if (isPageScroller(target)) {
        scrollerRef.current = null;
      } else if (target instanceof Element && isMainScroller(target)) {
        scrollerRef.current = target;
      } else {
        return;
      }

      schedule();
    };

    update();

    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", schedule);
      if (animRef.current.stop) animRef.current.stop();
    };
  }, []);

  const scrollToTop = () => {
    if (animRef.current.stop) animRef.current.stop();

    if (window.lenis && typeof window.lenis.scrollTo === "function") {
      window.lenis.scrollTo(0, { duration: 1.2 });
      return;
    }

    const elements = getScrolledElements(scrollerRef.current);
    if (!elements.length) return;

    const starts = elements.map((el) => el.scrollTop);
    const farthest = Math.max(...starts);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.scrollBehavior;
    const prevBody = body.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";

    const setPosition = (ratio) => {
      elements.forEach((el, i) => {
        const value = Math.round(starts[i] * (1 - ratio));
        if (el === html || el === body || el === document.scrollingElement) {
          window.scrollTo(0, value);
        }
        el.scrollTop = value;
      });
    };

    let cancelled = false;

    const cleanup = () => {
      cancelled = true;
      cancelAnimationFrame(animRef.current.frame);
      window.removeEventListener("wheel", cleanup);
      window.removeEventListener("touchstart", cleanup);
      window.removeEventListener("keydown", cleanup);
      html.style.scrollBehavior = prevHtml;
      body.style.scrollBehavior = prevBody;
      animRef.current.stop = null;
    };

    animRef.current.stop = cleanup;

    if (reduceMotion) {
      setPosition(1);
      cleanup();
      return;
    }

    const duration = Math.min(1400, Math.max(500, farthest * 0.25));
    const startTime = performance.now();

    window.addEventListener("wheel", cleanup, { passive: true });
    window.addEventListener("touchstart", cleanup, { passive: true });
    window.addEventListener("keydown", cleanup);

    const step = (now) => {
      if (cancelled) return;

      const t = Math.min(1, (now - startTime) / duration);
      setPosition(easeInOutCubic(t));

      if (t < 1) {
        animRef.current.frame = requestAnimationFrame(step);
      } else {
        cleanup();
      }
    };

    animRef.current.frame = requestAnimationFrame(step);
  };

  return (
    <aside className="FloatingIcons" aria-label="Alka Drops quick actions">
      {/* Scroll to top */}
      <div
        className={`FloatingIcons__item FloatingIcons__item--scroll ${
          showScrollTop ? "FloatingIcons__item--visible" : ""
        }`}
      >
        <button
          type="button"
          className="FloatingIcons__btn FloatingIcons__btn--scroll"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          tabIndex={showScrollTop ? 0 : -1}
        >
          <svg className="FloatingIcons__ring" viewBox="0 0 52 52" aria-hidden="true">
            <circle className="FloatingIcons__ring-track" cx="26" cy="26" r={RING_RADIUS} />
            <circle
              className="FloatingIcons__ring-bar"
              cx="26"
              cy="26"
              r={RING_RADIUS}
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - progress)}
            />
          </svg>
          <ArrowUpIcon />
        </button>
      </div>

      {/* Call Alka Drops */}
      <div className="FloatingIcons__item FloatingIcons__item--call" style={{ "--enter": 1 }}>
        <a
          href={CALL_HREF}
          className="FloatingIcons__btn FloatingIcons__btn--call"
          aria-label={`Call Alka Drops at ${CONTACT.display}`}
        >
          <PhoneIcon />
        </a>
      </div>

      {/* WhatsApp Alka Drops */}
      <div className="FloatingIcons__item FloatingIcons__item--whatsapp" style={{ "--enter": 2 }}>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="FloatingIcons__btn FloatingIcons__btn--whatsapp"
          aria-label={`Chat with Alka Drops on WhatsApp at ${CONTACT.display}`}
        >
          <WhatsAppIcon />
        </a>
      </div>
    </aside>
  );
};

export default FloatingIcons;