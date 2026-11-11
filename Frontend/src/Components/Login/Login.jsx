import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDroplet,
  FiTruck,
  FiRefreshCw,
  FiFeather,
  FiUser,
  FiUserPlus,
  FiMail,
  FiLock,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiX,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import API from "../../services/api";

/* Put your image at src/assets/login-image.png and adjust this path if needed */
import loginImage from "../../assets/login-image.png";

import "./Login.css";

/* =========================================
   CONSTANTS & HELPERS
========================================= */

const REMEMBER_KEY = "alkaDropsRememberedEmail";

const FEATURES = [
  { icon: FiDroplet, text: "pH 8.5+ Alkaline Water" },
  { icon: FiTruck, text: "Home Delivery" },
  { icon: FiRefreshCw, text: "Easy Subscription" },
  { icon: FiFeather, text: "Eco-Friendly Refills" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

const getPasswordScore = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

/* =========================================
   REUSABLE FIELD
========================================= */

const LoginField = ({
  id,
  label,
  icon: Icon,
  error,
  trailing,
  ...inputProps
}) => (
  <div className="Login-field">
    <label className="Login-field-label" htmlFor={id}>
      {label}
    </label>

    <div className={`Login-field-box ${error ? "Login-field-box--error" : ""}`}>
      <span className="Login-field-icon" aria-hidden="true">
        <Icon />
      </span>

      <input
        id={id}
        className="Login-field-input"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />

      {trailing}
    </div>

    {error && (
      <span className="Login-field-error" id={`${id}-error`} role="alert">
        {error}
      </span>
    )}
  </div>
);

const LoginStatus = ({ status }) =>
  status.message ? (
    <div
      className={`Login-status Login-status--${status.type}`}
      role={status.type === "error" ? "alert" : "status"}
    >
      {status.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
      <span>{status.message}</span>
    </div>
  ) : null;

/* =========================================
   MAIN COMPONENT
========================================= */

const Login = ({ defaultMode = "login" }) => {
  const navigate = useNavigate();
  const mounted = useRef(true);

  // "login" | "register" | "forgot"
  const [mode, setMode] = useState(defaultMode);

  useEffect(() => {
    if (defaultMode && defaultMode !== mode) {
      setMode(defaultMode);
    }
  }, [defaultMode]);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState(() => {
    let savedEmail = "";
    try {
      savedEmail = localStorage.getItem(REMEMBER_KEY) || "";
    } catch {
      savedEmail = "";
    }
    return { email: savedEmail, password: "", remember: Boolean(savedEmail) };
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  // Forgot Password 3-step OTP state:
  // Step 1: Send OTP -> Step 2: "First Verified" -> Step 3: "Then Confirm and Password"
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({
    identifier: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotMeta, setForgotMeta] = useState({
    maskedEmail: "",
    resetToken: "",
    demoOtp: "",
  });
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [forgotErrors, setForgotErrors] = useState({});

  const [loginStatus, setLoginStatus] = useState({ type: "", message: "" });
  const [registerStatus, setRegisterStatus] = useState({ type: "", message: "" });
  const [forgotStatus, setForgotStatus] = useState({ type: "", message: "" });

  // Google OAuth states
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleAuthData, setGoogleAuthData] = useState({
    name: "Saroj Kumar Mallik",
    email: "sarojkumarmallik94@gmail.com",
  });
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const isFlipped = mode === "register";
  const passwordScore = getPasswordScore(registerData.password);

  /* Card height follows the active side, so there is no empty space */
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [flipHeight, setFlipHeight] = useState(null);

  useLayoutEffect(() => {
    const face = isFlipped ? backRef.current : frontRef.current;
    if (!face) return undefined;

    const updateHeight = () => setFlipHeight(face.offsetHeight);
    updateHeight();

    if (typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(updateHeight);
    observer.observe(face);
    return () => observer.disconnect();
  }, [isFlipped, mode]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /* ---------- switching views ---------- */

  const resetMessages = () => {
    setLoginErrors({});
    setRegisterErrors({});
    setForgotErrors({});
    setLoginStatus({ type: "", message: "" });
    setRegisterStatus({ type: "", message: "" });
    setForgotStatus({ type: "", message: "" });
  };

  const switchMode = (nextMode) => {
    if (isSubmitting || nextMode === mode) return;
    resetMessages();
    if (nextMode === "login") {
      setForgotStep(1);
    }
    setMode(nextMode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- input handlers ---------- */

  const handleLoginChange = (event) => {
    const { name, value, type, checked } = event.target;
    setLoginData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
    setLoginErrors((previous) => ({ ...previous, [name]: "" }));
    setLoginStatus({ type: "", message: "" });
  };

  const handleRegisterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setRegisterData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
    setRegisterErrors((previous) => ({ ...previous, [name]: "" }));
    setRegisterStatus({ type: "", message: "" });
  };

  const handleForgotChange = (event) => {
    setForgotData({ email: event.target.value });
    setForgotErrors({});
    setForgotStatus({ type: "", message: "" });
  };

  /* ---------- LOGIN ---------- */

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const errors = {};
    if (!EMAIL_PATTERN.test(loginData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!loginData.password) {
      errors.password = "Please enter your password.";
    }

    setLoginErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSubmitting(true);
    setLoginStatus({ type: "", message: "" });

    try {
      const res = await API.post("/auth/login", {
        email: loginData.email.trim(),
        password: loginData.password,
      });

      if (res.data?.token) {
        localStorage.setItem("alka_user_token", res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem("alka_user", JSON.stringify(res.data.user));
      }
      window.dispatchEvent(new Event("alkaAuthUpdated"));

      try {
        if (loginData.remember) {
          localStorage.setItem(REMEMBER_KEY, loginData.email.trim());
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      } catch {
        /* storage unavailable - ignore */
      }

      if (!mounted.current) return;
      setLoginStatus({
        type: "success",
        message: res.data?.message || "Login successful! Redirecting...",
      });

      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect") || "/";
      const hasCheckout = params.get("checkout") === "true";
      const finalDest = hasCheckout
        ? `${redirectTarget}${redirectTarget.includes("?") ? "&" : "?"}checkout=true`
        : redirectTarget;

      window.setTimeout(() => {
        if (mounted.current) navigate(finalDest);
      }, 900);
    } catch (err) {
      if (mounted.current) {
        setLoginStatus({
          type: "error",
          message:
            err.response?.data?.message ||
            "Unable to log in. Please verify your email and password.",
        });
      }
    } finally {
      if (mounted.current) setIsSubmitting(false);
    }
  };

  /* ---------- REGISTER ---------- */

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const errors = {};

    if (registerData.name.trim().length < 2) {
      errors.name = "Please enter your full name.";
    }
    if (!EMAIL_PATTERN.test(registerData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!PHONE_PATTERN.test(registerData.phone.trim())) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }
    if (registerData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (registerData.confirmPassword !== registerData.password) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (!registerData.terms) {
      errors.terms = "Please accept the terms to continue.";
    }

    setRegisterErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSubmitting(true);
    setRegisterStatus({ type: "", message: "" });

    try {
      const res = await API.post("/auth/register", {
        name: registerData.name.trim(),
        email: registerData.email.trim(),
        phone: registerData.phone.trim(),
        password: registerData.password,
      });

      if (!mounted.current) return;

      const registeredEmail = registerData.email.trim();

      // If token & user returned, save to localStorage
      if (res.data?.token) {
        localStorage.setItem("alka_user_token", res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem("alka_user", JSON.stringify(res.data.user));
      }
      window.dispatchEvent(new Event("alkaAuthUpdated"));

      setRegisterStatus({
        type: "success",
        message: res.data?.message || "Account created successfully! Welcome to Alka Drops.",
      });

      window.setTimeout(() => {
        if (!mounted.current) return;
        setLoginData((previous) => ({
          ...previous,
          email: registeredEmail,
          password: "",
        }));
        setRegisterData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          terms: false,
        });
        resetMessages();
        setLoginStatus({
          type: "success",
          message: "Account created! Please log in to continue.",
        });
        setMode("login");
      }, 1400);
    } catch (err) {
      if (mounted.current) {
        setRegisterStatus({
          type: "error",
          message:
            err.response?.data?.message ||
            "Could not create your account. Please try again or use another email.",
        });
      }
    } finally {
      if (mounted.current) setIsSubmitting(false);
    }
  };

  /* ---------- FORGOT PASSWORD (OTP BASED 3-STEP INTEGRATION) ---------- */

  // Step 1: Send OTP
  const handleForgotSendOtp = async (event) => {
    if (event) event.preventDefault();
    if (isSubmitting) return;

    const id = (forgotData.identifier || "").trim();
    if (!id) {
      setForgotErrors({ identifier: "Please enter your registered email or 10-digit mobile number." });
      return;
    }

    setIsSubmitting(true);
    setForgotStatus({ type: "", message: "" });
    setForgotErrors({});

    try {
      const res = await API.post("/auth/send-reset-otp", { identifier: id });
      if (mounted.current) {
        setForgotMeta({
          maskedEmail: res.data?.maskedEmail || id,
          resetToken: "",
          demoOtp: res.data?.otp || "",
        });
        setForgotStatus({
          type: "success",
          message: res.data?.message || "Verification code sent successfully!",
        });
        setForgotStep(2); // Advance to "first verified"
      }
    } catch (err) {
      if (mounted.current) {
        setForgotStatus({
          type: "error",
          message: err.response?.data?.message || "Could not find an account with that email/phone.",
        });
      }
    } finally {
      if (mounted.current) setIsSubmitting(false);
    }
  };

  // Step 2: "First Verified" (Verify OTP)
  const handleForgotVerifyOtp = async (event) => {
    if (event) event.preventDefault();
    if (isSubmitting) return;

    const otpCode = (forgotData.otp || "").trim();
    if (otpCode.length !== 6) {
      setForgotErrors({ otp: "Please enter the complete 6-digit verification code." });
      return;
    }

    setIsSubmitting(true);
    setForgotStatus({ type: "", message: "" });
    setForgotErrors({});

    try {
      const res = await API.post("/auth/verify-reset-otp", {
        identifier: forgotData.identifier.trim(),
        otp: otpCode,
      });

      if (mounted.current) {
        setForgotMeta((prev) => ({
          ...prev,
          resetToken: res.data?.resetToken || "",
        }));
        setForgotStatus({
          type: "success",
          message: "Verification confirmed! Now set your new password.",
        });
        setForgotStep(3); // Advance to "then confirm and password"
      }
    } catch (err) {
      if (mounted.current) {
        setForgotStatus({
          type: "error",
          message: err.response?.data?.message || "Invalid or expired verification code. Please check and try again.",
        });
      }
    } finally {
      if (mounted.current) setIsSubmitting(false);
    }
  };

  // Step 3: "Then Confirm and Password" (Reset Password)
  const handleForgotResetPassword = async (event) => {
    if (event) event.preventDefault();
    if (isSubmitting) return;

    const errors = {};
    if (!forgotData.newPassword || forgotData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters long.";
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match. Please verify.";
    }

    setForgotErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSubmitting(true);
    setForgotStatus({ type: "", message: "" });

    try {
      const res = await API.post("/auth/reset-password", {
        identifier: forgotData.identifier.trim(),
        resetToken: forgotMeta.resetToken,
        otp: forgotData.otp.trim(),
        password: forgotData.newPassword,
        confirmPassword: forgotData.confirmPassword,
      });

      if (mounted.current) {
        setForgotStatus({
          type: "success",
          message: res.data?.message || "Password updated successfully! Redirecting to login...",
        });

        // Set login prefill
        setLoginData((prev) => ({
          ...prev,
          email: forgotData.identifier.includes("@") ? forgotData.identifier.trim() : prev.email,
          password: "",
        }));

        window.setTimeout(() => {
          if (!mounted.current) return;
          setForgotStep(1);
          setForgotData({ identifier: "", otp: "", newPassword: "", confirmPassword: "" });
          resetMessages();
          setLoginStatus({
            type: "success",
            message: "Password reset complete! Please log in with your new password.",
          });
          setMode("login");
        }, 1800);
      }
    } catch (err) {
      if (mounted.current) {
        setForgotStatus({
          type: "error",
          message: err.response?.data?.message || "Failed to update password. Please try again.",
        });
      }
    } finally {
      if (mounted.current) setIsSubmitting(false);
    }
  };

  /* ---------- SOCIAL LOGIN (GOOGLE INTEGRATION) ---------- */

  const handleGoogleAuthSuccess = async (authPayload) => {
    setIsGoogleSubmitting(true);
    const setStatus = isFlipped ? setRegisterStatus : setLoginStatus;
    setStatus({ type: "", message: "" });

    try {
      const res = await API.post("/auth/google", authPayload);

      if (res.data?.token) {
        localStorage.setItem("alka_user_token", res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem("alka_user", JSON.stringify(res.data.user));
      }
      window.dispatchEvent(new Event("alkaAuthUpdated"));

      setStatus({
        type: "success",
        message: res.data?.message || "Google sign-in successful! Redirecting...",
      });

      setIsGoogleModalOpen(false);

      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect") || "/account";
      const hasCheckout = params.get("checkout") === "true";
      const finalDest = hasCheckout
        ? `${redirectTarget}${redirectTarget.includes("?") ? "&" : "?"}checkout=true`
        : redirectTarget;

      window.setTimeout(() => {
        if (mounted.current) navigate(finalDest);
      }, 700);
    } catch (err) {
      if (mounted.current) {
        setStatus({
          type: "error",
          message:
            err.response?.data?.message ||
            "Google sign-in failed. Please try again or use email login.",
        });
      }
    } finally {
      if (mounted.current) setIsGoogleSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider !== "Google") return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

    // Method 1: Google OAuth2 Token Client (Opens standard Google Sign-In popup)
    if (clientId && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const userRes = await fetch(
                  "https://www.googleapis.com/oauth2/v3/userinfo",
                  {
                    headers: {
                      Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                  }
                );
                if (userRes.ok) {
                  const profile = await userRes.json();
                  await handleGoogleAuthSuccess({
                    email: profile.email,
                    name: profile.name,
                    avatar: profile.picture,
                    googleId: profile.sub,
                  });
                  return;
                }
              } catch (fetchErr) {
                console.warn("Error fetching Google profile:", fetchErr);
              }
            }
            setIsGoogleModalOpen(true);
          },
          error_callback: (err) => {
            console.warn("Google popup error:", err);
            setIsGoogleModalOpen(true);
          },
        });
        client.requestAccessToken();
        return;
      } catch (err) {
        console.warn("Failed to launch Google OAuth2 token client:", err);
      }
    }

    // Method 2: Google Identity Services One Tap
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              handleGoogleAuthSuccess({ credential: response.credential });
            }
          },
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsGoogleModalOpen(true);
          }
        });
        return;
      } catch (gisErr) {
        console.warn("GIS prompt error:", gisErr);
      }
    }

    // Fallback: Opens Google Account sign-in dialog
    setIsGoogleModalOpen(true);
  };

  /* =========================================
     SHARED UI PIECES
  ========================================= */

  const renderTabs = () => (
    <div
      className={`Login-tabs ${isFlipped ? "Login-tabs--register" : ""}`}
      role="tablist"
      aria-label="Login or Register"
    >
      <span className="Login-tabs-indicator" aria-hidden="true" />

      <button
        type="button"
        role="tab"
        aria-selected={!isFlipped}
        className={`Login-tab ${!isFlipped ? "Login-tab--active" : ""}`}
        onClick={() => switchMode("login")}
      >
        <FiUser />
        Login
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={isFlipped}
        className={`Login-tab ${isFlipped ? "Login-tab--active" : ""}`}
        onClick={() => switchMode("register")}
      >
        <FiUserPlus />
        Register
      </button>
    </div>
  );

  const renderSocial = () => (
    <>
      <div className="Login-divider">
        <span>Or continue with</span>
      </div>

      <div className="Login-social">
        <button
          type="button"
          className="Login-social-button"
          onClick={() => handleSocialLogin("Google")}
        >
          <FcGoogle />
          <span>Continue with Google</span>
        </button>
      </div>
    </>
  );

  const passwordToggle = (visible, setVisible, label) => (
    <button
      type="button"
      className="Login-eye"
      onClick={() => setVisible((previous) => !previous)}
      aria-label={visible ? `Hide ${label}` : `Show ${label}`}
    >
      {visible ? <FiEyeOff /> : <FiEye />}
    </button>
  );

  const submitContent = (idleText, busyText) =>
    isSubmitting ? (
      <>
        <FiLoader className="Login-spinner" />
        <span>{busyText}</span>
      </>
    ) : (
      <>
        <span>{idleText}</span>
        <FiArrowRight />
      </>
    );

  /* =========================================
     RENDER
  ========================================= */

  return (
    <main
      className="Login"
      style={{ "--login-bg-image": `url(${loginImage})` }}
    >
      <div className="Login-overlay" aria-hidden="true" />

      <div className="Login-container">
        {/* ============ LEFT CONTENT ============ */}
        <section className="Login-hero" aria-label="Alka Drops welcome">
          <span className="Login-badge">
            <FiDroplet />
            {isFlipped ? "Join Alka Drops" : "Welcome Back"}
          </span>

          <h1 className="Login-title">
            Stay Hydrated
            <br />
            with <span>Alka Drops</span>
          </h1>

          <p className="Login-subtitle">
            Pure, alkaline water for a healthier,
            <br className="Login-break" />
            more active life.
          </p>

          <ul className="Login-features">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li className="Login-feature" key={text}>
                <span className="Login-feature-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="Login-feature-text">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ============ RIGHT FORM CARD ============ */}
        <section className="Login-card-wrap" aria-label="Account access">
          <div
            className={`Login-flip ${isFlipped ? "Login-flip--flipped" : ""}`}
            style={flipHeight ? { height: flipHeight } : undefined}
          >
            {/* ---------- FRONT: LOGIN / FORGOT ---------- */}
            <div
              ref={frontRef}
              className={`Login-face Login-face--front ${
                isFlipped ? "Login-face--hidden" : ""
              }`}
              aria-hidden={isFlipped}
            >
              {renderTabs()}

              {mode !== "forgot" ? (
                <div className="Login-panel" key="login-panel">
                  <div className="Login-heading">
                    <h2>
                      {new URLSearchParams(window.location.search).get("checkout") === "true"
                        ? "Login to Complete Your Order"
                        : "Login to Your Account"}
                    </h2>
                    <p>
                      {new URLSearchParams(window.location.search).get("checkout") === "true"
                        ? "Your cart items are safely preserved. Log in to finish checkout."
                        : "Access your orders, subscriptions, and more."}
                    </p>
                  </div>

                  <form className="Login-form" onSubmit={handleLoginSubmit} noValidate>
                    <LoginField
                      id="login-email"
                      label="Email Address"
                      icon={FiMail}
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      autoComplete="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      error={loginErrors.email}
                    />

                    <LoginField
                      id="login-password"
                      label="Password"
                      icon={FiLock}
                      type={showLoginPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      error={loginErrors.password}
                      trailing={passwordToggle(
                        showLoginPassword,
                        setShowLoginPassword,
                        "password"
                      )}
                    />

                    <div className="Login-options">
                      <label className="Login-check">
                        <input
                          type="checkbox"
                          name="remember"
                          checked={loginData.remember}
                          onChange={handleLoginChange}
                        />
                        <span className="Login-check-box" aria-hidden="true" />
                        <span className="Login-check-text">Remember me</span>
                      </label>

                      <button
                        type="button"
                        className="Login-link"
                        onClick={() => switchMode("forgot")}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <LoginStatus status={loginStatus} />

                    <button
                      type="submit"
                      className="Login-submit"
                      disabled={isSubmitting}
                    >
                      {submitContent("Login Now", "Logging in...")}
                    </button>
                  </form>

                  {renderSocial()}

                  <p className="Login-switch">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      className="Login-link Login-link--strong"
                      onClick={() => switchMode("register")}
                    >
                      Register Now
                    </button>
                  </p>
                </div>
              ) : (
                <div className="Login-panel Login-panel--otpFlow" key="forgot-panel">
                  {/* Stepper Progress */}
                  <div className="Login-stepper">
                    <div className={`Login-stepItem ${forgotStep >= 1 ? "active" : ""} ${forgotStep > 1 ? "completed" : ""}`}>
                      <span className="stepNum">{forgotStep > 1 ? "✓" : "1"}</span>
                      <span className="stepLabel">Account</span>
                    </div>
                    <div className={`stepLine ${forgotStep > 1 ? "completed" : ""}`} />
                    <div className={`Login-stepItem ${forgotStep >= 2 ? "active" : ""} ${forgotStep > 2 ? "completed" : ""}`}>
                      <span className="stepNum">{forgotStep > 2 ? "✓" : "2"}</span>
                      <span className="stepLabel">Verify OTP</span>
                    </div>
                    <div className={`stepLine ${forgotStep > 2 ? "completed" : ""}`} />
                    <div className={`Login-stepItem ${forgotStep === 3 ? "active" : ""}`}>
                      <span className="stepNum">3</span>
                      <span className="stepLabel">New Password</span>
                    </div>
                  </div>

                  {/* STEP 1: Enter Email / Phone -> Send Code */}
                  {forgotStep === 1 && (
                    <>
                      <div className="Login-heading">
                        <h2>Reset Password</h2>
                        <p>
                          Enter your registered email address or mobile number to receive a 6-digit verification code.
                        </p>
                      </div>

                      <form className="Login-form" onSubmit={handleForgotSendOtp} noValidate>
                        <LoginField
                          id="forgot-identifier"
                          label="Registered Email or Mobile"
                          icon={FiMail}
                          type="text"
                          name="identifier"
                          placeholder="e.g. name@example.com or 9823045671"
                          autoComplete="username"
                          value={forgotData.identifier}
                          onChange={(e) => {
                            setForgotData((prev) => ({ ...prev, identifier: e.target.value }));
                            setForgotErrors({});
                          }}
                          error={forgotErrors.identifier}
                        />

                        <LoginStatus status={forgotStatus} />

                        <button
                          type="submit"
                          className="Login-submit"
                          disabled={isSubmitting}
                        >
                          {submitContent("Send Verification Code", "Sending Code...")}
                        </button>
                      </form>
                    </>
                  )}

                  {/* STEP 2: "First Verified" (Enter and Verify OTP) */}
                  {forgotStep === 2 && (
                    <>
                      <div className="Login-heading">
                        <h2>Verify Security Code</h2>
                        <p>
                          We sent a 6-digit OTP to <strong>{forgotMeta.maskedEmail}</strong>. Please enter it to verify your identity.
                        </p>
                      </div>

                      <form className="Login-form" onSubmit={handleForgotVerifyOtp} noValidate>
                        <div className="Login-field">
                          <label className="Login-field-label" htmlFor="forgot-otp">
                            6-Digit Verification Code (OTP)
                          </label>
                          <div className={`Login-field-box ${forgotErrors.otp ? "Login-field-box--error" : ""}`}>
                            <span className="Login-field-icon" aria-hidden="true">
                              <FiCheckCircle />
                            </span>
                            <input
                              id="forgot-otp"
                              className="Login-field-input Login-otpInput"
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="• • • • • •"
                              value={forgotData.otp}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setForgotData((prev) => ({ ...prev, otp: val }));
                                setForgotErrors({});
                              }}
                              autoFocus
                            />
                          </div>
                          {forgotErrors.otp && (
                            <span className="Login-field-error" role="alert">
                              {forgotErrors.otp}
                            </span>
                          )}
                        </div>

                        {forgotMeta.demoOtp && (
                          <button
                            type="button"
                            className="Login-quickOtpPill"
                            onClick={() => {
                              setForgotData((prev) => ({ ...prev, otp: forgotMeta.demoOtp }));
                              setForgotErrors({});
                            }}
                          >
                            <span>One-Tap Fill OTP:</span> <strong>{forgotMeta.demoOtp}</strong>
                          </button>
                        )}

                        <LoginStatus status={forgotStatus} />

                        <button
                          type="submit"
                          className="Login-submit"
                          disabled={isSubmitting || forgotData.otp.length !== 6}
                        >
                          {submitContent("Verify OTP", "Verifying...")}
                        </button>

                        <div className="Login-otpSubActions">
                          <button
                            type="button"
                            className="Login-link"
                            onClick={handleForgotSendOtp}
                            disabled={isSubmitting}
                          >
                            Resend Code
                          </button>
                          <span className="dot">•</span>
                          <button
                            type="button"
                            className="Login-link"
                            onClick={() => {
                              setForgotStep(1);
                              setForgotErrors({});
                              setForgotStatus({ type: "", message: "" });
                            }}
                          >
                            Change Email / Mobile
                          </button>
                        </div>
                      </form>
                    </>
                  )}

                  {/* STEP 3: "Then Confirm and Password" (New Password & Confirm) */}
                  {forgotStep === 3 && (
                    <>
                      <div className="Login-heading">
                        <div className="Login-verifiedBadge">
                          <FiCheckCircle size={15} /> OTP Code Verified
                        </div>
                        <h2>Create New Password</h2>
                        <p>
                          Identity confirmed! Please choose a new, secure password for your account.
                        </p>
                      </div>

                      <form className="Login-form" onSubmit={handleForgotResetPassword} noValidate>
                        <div className="Login-field-group">
                          <LoginField
                            id="forgot-new-password"
                            label="New Password"
                            icon={FiLock}
                            type={showForgotNewPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder="At least 6 characters"
                            value={forgotData.newPassword}
                            onChange={(e) => {
                              setForgotData((prev) => ({ ...prev, newPassword: e.target.value }));
                              setForgotErrors({});
                            }}
                            error={forgotErrors.newPassword}
                            trailing={passwordToggle(
                              showForgotNewPassword,
                              setShowForgotNewPassword,
                              "new password"
                            )}
                          />

                          {forgotData.newPassword && (
                            <div className="Login-strength" aria-live="polite">
                              <div className="Login-strength-bars">
                                {[1, 2, 3, 4].map((level) => (
                                  <span
                                    key={level}
                                    className={
                                      getPasswordScore(forgotData.newPassword) >= level
                                        ? `Login-strength-bar Login-strength-bar--on Login-strength-bar--level${getPasswordScore(forgotData.newPassword)}`
                                        : "Login-strength-bar"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="Login-strength-label">
                                {STRENGTH_LABELS[getPasswordScore(forgotData.newPassword)]}
                              </span>
                            </div>
                          )}
                        </div>

                        <LoginField
                          id="forgot-confirm-password"
                          label="Confirm Password"
                          icon={FiLock}
                          type={showForgotConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="Re-enter password to confirm"
                          value={forgotData.confirmPassword}
                          onChange={(e) => {
                            setForgotData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                            setForgotErrors({});
                          }}
                          error={forgotErrors.confirmPassword}
                          trailing={passwordToggle(
                            showForgotConfirmPassword,
                            setShowForgotConfirmPassword,
                            "confirm password"
                          )}
                        />

                        <LoginStatus status={forgotStatus} />

                        <button
                          type="submit"
                          className="Login-submit"
                          disabled={isSubmitting}
                        >
                          {submitContent("Confirm & Update Password", "Updating Password...")}
                        </button>
                      </form>
                    </>
                  )}

                  <button
                    type="button"
                    className="Login-back"
                    onClick={() => switchMode("login")}
                  >
                    <FiArrowLeft />
                    Back to Login
                  </button>
                </div>
              )}
            </div>

            {/* ---------- BACK: REGISTER ---------- */}
            <div
              ref={backRef}
              className={`Login-face Login-face--back ${
                !isFlipped ? "Login-face--hidden" : ""
              }`}
              aria-hidden={!isFlipped}
            >
              {renderTabs()}

              <div className="Login-panel">
                <div className="Login-heading">
                  <h2>Create Your Account</h2>
                  <p>Join Alka Drops for fresh alkaline water at your door.</p>
                </div>

                <form
                  className="Login-form"
                  onSubmit={handleRegisterSubmit}
                  noValidate
                >
                  <LoginField
                    id="register-name"
                    label="Full Name"
                    icon={FiUser}
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    autoComplete="name"
                    maxLength={100}
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    error={registerErrors.name}
                  />

                  <LoginField
                    id="register-email"
                    label="Email Address"
                    icon={FiMail}
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    autoComplete="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    error={registerErrors.email}
                  />

                  <LoginField
                    id="register-phone"
                    label="Mobile Number"
                    icon={FiPhone}
                    type="tel"
                    name="phone"
                    placeholder="10-digit Mobile Number"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={registerData.phone}
                    onChange={(event) => {
                      event.target.value = event.target.value.replace(/\D/g, "");
                      handleRegisterChange(event);
                    }}
                    error={registerErrors.phone}
                  />

                  <div className="Login-field-group">
                    <LoginField
                      id="register-password"
                      label="Password"
                      icon={FiLock}
                      type={showRegisterPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create Password"
                      autoComplete="new-password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      error={registerErrors.password}
                      trailing={passwordToggle(
                        showRegisterPassword,
                        setShowRegisterPassword,
                        "password"
                      )}
                    />

                    {registerData.password && (
                      <div className="Login-strength" aria-live="polite">
                        <div className="Login-strength-bars">
                          {[1, 2, 3, 4].map((level) => (
                            <span
                              key={level}
                              className={
                                passwordScore >= level
                                  ? `Login-strength-bar Login-strength-bar--on Login-strength-bar--level${passwordScore}`
                                  : "Login-strength-bar"
                              }
                            />
                          ))}
                        </div>
                        <span className="Login-strength-label">
                          {STRENGTH_LABELS[passwordScore]}
                        </span>
                      </div>
                    )}
                  </div>

                  <LoginField
                    id="register-confirm"
                    label="Confirm Password"
                    icon={FiLock}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    error={registerErrors.confirmPassword}
                    trailing={passwordToggle(
                      showConfirmPassword,
                      setShowConfirmPassword,
                      "confirm password"
                    )}
                  />

                  <div className="Login-terms">
                    <label className="Login-check">
                      <input
                        type="checkbox"
                        name="terms"
                        checked={registerData.terms}
                        onChange={handleRegisterChange}
                      />
                      <span className="Login-check-box" aria-hidden="true" />
                      <span className="Login-check-text">
                        I agree to the Terms &amp; Privacy Policy
                      </span>
                    </label>

                    {registerErrors.terms && (
                      <span className="Login-field-error" role="alert">
                        {registerErrors.terms}
                      </span>
                    )}
                  </div>

                  <LoginStatus status={registerStatus} />

                  <button
                    type="submit"
                    className="Login-submit"
                    disabled={isSubmitting}
                  >
                    {submitContent("Create Account", "Creating account...")}
                  </button>
                </form>

                {renderSocial()}

                <p className="Login-switch">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="Login-link Login-link--strong"
                    onClick={() => switchMode("login")}
                  >
                    Login Now
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= GOOGLE SIGN-IN MODAL ================= */}
      {isGoogleModalOpen && (
        <div
          className="Login-googleModal-overlay"
          onClick={() => setIsGoogleModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-modal-title"
        >
          <div
            className="Login-googleModal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="Login-googleModal-header">
              <div className="Login-googleModal-titleWrap">
                <FcGoogle className="Login-googleModal-logo" />
                <div>
                  <h3 id="google-modal-title">Sign in with Google</h3>
                  <p>
                    Choose an account to continue to <strong>Alka Drops</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="Login-googleModal-close"
                onClick={() => setIsGoogleModalOpen(false)}
                aria-label="Close Google Sign-In"
              >
                <FiX />
              </button>
            </div>

            <div className="Login-googleModal-body">
              {/* Account Quick Select Card */}
              <div
                className="Login-googleModal-accountPick"
                onClick={() =>
                  handleGoogleAuthSuccess({
                    name: googleAuthData.name,
                    email: googleAuthData.email,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      googleAuthData.name
                    )}&background=0a53c1&color=fff`,
                    googleId: `google_${Date.now()}`,
                  })
                }
              >
                <div className="Login-googleModal-avatar">
                  {googleAuthData.name.charAt(0).toUpperCase()}
                </div>
                <div className="Login-googleModal-accountInfo">
                  <strong>{googleAuthData.name}</strong>
                  <span>{googleAuthData.email}</span>
                </div>
                <FiArrowRight className="Login-googleModal-arrow" />
              </div>

              <div className="Login-googleModal-divider">
                <span>or enter Google account details</span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGoogleAuthSuccess({
                    name: googleAuthData.name,
                    email: googleAuthData.email,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      googleAuthData.name
                    )}&background=0a53c1&color=fff`,
                    googleId: `google_${Date.now()}`,
                  });
                }}
              >
                <div className="Login-googleModal-field">
                  <label>Google Name</label>
                  <input
                    type="text"
                    value={googleAuthData.name}
                    onChange={(e) =>
                      setGoogleAuthData({
                        ...googleAuthData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Your Google Account Name"
                    required
                  />
                </div>

                <div className="Login-googleModal-field">
                  <label>Google Email Address</label>
                  <input
                    type="email"
                    value={googleAuthData.email}
                    onChange={(e) =>
                      setGoogleAuthData({
                        ...googleAuthData,
                        email: e.target.value,
                      })
                    }
                    placeholder="yourname@gmail.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="Login-googleModal-submitBtn"
                  disabled={isGoogleSubmitting}
                >
                  {isGoogleSubmitting ? (
                    <>
                      <FiLoader className="Login-spinner" />
                      <span>Authenticating with Google...</span>
                    </>
                  ) : (
                    <>
                      <FcGoogle />
                      <span>
                        Continue as{" "}
                        {googleAuthData.name.split(" ")[0] || "Google User"}
                      </span>
                    </>
                  )}
                </button>
              </form>

              <p className="Login-googleModal-privacyNote">
                To continue, Google will share your name, email address, language
                preference, and profile picture with Alka Drops. Review Alka Drops&rsquo;
                Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Login;