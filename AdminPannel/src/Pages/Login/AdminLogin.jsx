import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
  FiTruck,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiArrowLeft,
  FiKey,
} from "react-icons/fi";
import { Droplets } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import API from "../../services/api";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuth();

  const [activeRole, setActiveRole] = useState("admin"); // 'admin' or 'delivery_boy'
  const [identifier, setIdentifier] = useState("admin@alkadrops.com");
  const [password, setPassword] = useState("AlkaAdmin@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // OTP-based Forgot Password states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Send OTP, 2: "First Verified", 3: "Then Confirm and Password"
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotMaskedEmail, setForgotMaskedEmail] = useState("");
  const [forgotResetToken, setForgotResetToken] = useState("");
  const [forgotDemoOtp, setForgotDemoOtp] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  const handleRoleTabChange = (role) => {
    setActiveRole(role);
    setErrorMessage("");
    setSuccessMessage("");
    if (role === "admin") {
      setIdentifier("admin@alkadrops.com");
      setPassword("AlkaAdmin@2026");
    } else {
      setIdentifier("ramesh.delivery@alkadrops.com");
      setPassword("9823045671");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage("Please enter both login identifier and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const result = await login(identifier.trim(), password);

      if (result.success && result.user) {
        const from = location.state?.from?.pathname;
        if (result.user.role === "delivery_boy") {
          navigate(from || "/admin/delivery-dashboard", { replace: true });
        } else {
          navigate(from || "/admin/dashboard", { replace: true });
        }
      } else {
        setErrorMessage(result.message || "Invalid credentials.");
      }
    } catch (err) {
      setErrorMessage("Failed to authenticate. Please verify your backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- OTP PASSWORD RESET HANDLERS ---------- */

  // Step 1: Send OTP
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setErrorMessage("Please enter your registered email address or mobile number.");
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await API.post("/admin-users/send-reset-otp", { identifier: forgotIdentifier.trim() });
      if (res.data?.success) {
        setForgotMaskedEmail(res.data.maskedEmail || forgotIdentifier.trim());
        setForgotDemoOtp(res.data.otp || "");
        setSuccessMessage(res.data.message);
        setForgotStep(2); // Advance to "first verified"
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: "First Verified" (Verify OTP)
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    if (forgotOtp.trim().length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await API.post("/admin-users/verify-reset-otp", {
        identifier: forgotIdentifier.trim(),
        otp: forgotOtp.trim(),
      });
      if (res.data?.success) {
        setForgotResetToken(res.data.resetToken || "");
        setSuccessMessage("Code verified! Now enter your new password.");
        setForgotStep(3); // Advance to "then confirm and password"
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: "Then Confirm and Password" (Update Password)
  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await API.post("/admin-users/reset-password", {
        identifier: forgotIdentifier.trim(),
        resetToken: forgotResetToken,
        otp: forgotOtp.trim(),
        password: forgotNewPassword,
        confirmPassword: forgotConfirmPassword,
      });
      if (res.data?.success) {
        setSuccessMessage(res.data.message);
        setIdentifier(forgotIdentifier.trim());
        setPassword(forgotNewPassword);
        setTimeout(() => {
          setIsForgotMode(false);
          setForgotStep(1);
          setForgotOtp("");
          setForgotNewPassword("");
          setForgotConfirmPassword("");
          setSuccessMessage("Password updated! Sign in with your new password.");
        }, 1800);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="AdminLogin-container">
      <div className="AdminLogin-card">
        {/* Brand Header */}
        <div className="AdminLogin-brand">
          <div className="AdminLogin-logoWrap">
            <Droplets className="AdminLogin-logoIcon" size={32} />
          </div>
          <h2 className="AdminLogin-brandName">ALKA DROPS</h2>
          <span className="AdminLogin-portalTag">Operations &amp; Fleet Access Portal</span>
        </div>

        {/* Role Segment Tabs */}
        <div className="AdminLogin-roleTabs">
          <button
            type="button"
            className={`AdminLogin-roleTab ${activeRole === "admin" ? "active" : ""}`}
            onClick={() => handleRoleTabChange("admin")}
          >
            <FiShield />
            <span>Administrator</span>
          </button>
          <button
            type="button"
            className={`AdminLogin-roleTab ${activeRole === "delivery_boy" ? "active" : ""}`}
            onClick={() => handleRoleTabChange("delivery_boy")}
          >
            <FiTruck />
            <span>Delivery Partner</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="AdminLogin-alert error">
            <FiAlertCircle />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="AdminLogin-alert success">
            <FiCheckCircle />
            <span>{successMessage}</span>
          </div>
        )}

        {!isForgotMode ? (
          /* Normal Sign In Form */
          <>
            <form onSubmit={handleSubmit} className="AdminLogin-form">
              <div className="AdminLogin-field">
                <label>
                  {activeRole === "delivery_boy"
                    ? "Email or Mobile Number"
                    : "Admin Email"}
                </label>
                <div className="AdminLogin-inputWrap">
                  {activeRole === "delivery_boy" ? (
                    <FiPhone className="inputIcon" />
                  ) : (
                    <FiMail className="inputIcon" />
                  )}
                  <input
                    type="text"
                    placeholder={
                      activeRole === "delivery_boy"
                        ? "e.g. ramesh.delivery@alkadrops.com or 9823045671"
                        : "e.g. admin@alkadrops.com"
                    }
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="AdminLogin-field">
                <div className="AdminLogin-fieldHead">
                  <label>
                    {activeRole === "delivery_boy"
                      ? "Password or Mobile Number"
                      : "Secure Password"}
                  </label>
                  <button
                    type="button"
                    className="AdminLogin-forgotLink"
                    onClick={() => {
                      setIsForgotMode(true);
                      setForgotStep(1);
                      setForgotIdentifier(identifier);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="AdminLogin-inputWrap">
                  <FiLock className="inputIcon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      activeRole === "delivery_boy"
                        ? "Enter password or 10-digit mobile number"
                        : "Enter password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="AdminLogin-eyeBtn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {activeRole === "delivery_boy" && (
                  <span className="AdminLogin-fieldHint">
                    <FiCheckCircle size={13} style={{ color: "#0d9488", flexShrink: 0 }} />
                    <span>First-time login? Use your registered 10-digit mobile number as password.</span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="AdminLogin-submitBtn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Authenticating..."
                ) : (
                  <>
                    <span>Sign In to {activeRole === "admin" ? "Admin Portal" : "Rider App"}</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Footer */}
            <div className="AdminLogin-demoFooter">
              <span className="demoTitle">One-Tap Quick Demo Credentials:</span>
              <div className="demoButtons">
                <button
                  type="button"
                  className="demoPill"
                  onClick={() => handleRoleTabChange("admin")}
                >
                  <FiShield size={13} style={{ marginRight: "6px" }} /> Fill Admin (admin@alkadrops.com)
                </button>
                <button
                  type="button"
                  className="demoPill"
                  onClick={() => {
                    setActiveRole("delivery_boy");
                    setErrorMessage("");
                    setIdentifier("ramesh.delivery@alkadrops.com");
                    setPassword("9823045671");
                  }}
                >
                  <FiTruck size={13} style={{ marginRight: "6px" }} /> Fill Rider (ramesh.delivery@alkadrops.com / 9823045671)
                </button>
                <button
                  type="button"
                  className="demoPill"
                  onClick={() => {
                    setActiveRole("delivery_boy");
                    setErrorMessage("");
                    setIdentifier("9823045671");
                    setPassword("9823045671");
                  }}
                >
                  <FiPhone size={13} style={{ marginRight: "6px" }} /> Fill Rider by Mobile (9823045671 / 9823045671)
                </button>
              </div>
            </div>
          </>
        ) : (
          /* OTP-Based Password Reset Flow (Step 1 -> Step 2 -> Step 3) */
          <div className="AdminLogin-forgotSection">
            {/* Stepper Header */}
            <div className="AdminLogin-stepper">
              <div className={`AdminLogin-step ${forgotStep >= 1 ? "active" : ""} ${forgotStep > 1 ? "completed" : ""}`}>
                <span className="stepCircle">{forgotStep > 1 ? "✓" : "1"}</span>
                <span className="stepText">Identify</span>
              </div>
              <div className={`stepDivider ${forgotStep > 1 ? "completed" : ""}`} />
              <div className={`AdminLogin-step ${forgotStep >= 2 ? "active" : ""} ${forgotStep > 2 ? "completed" : ""}`}>
                <span className="stepCircle">{forgotStep > 2 ? "✓" : "2"}</span>
                <span className="stepText">Verify OTP</span>
              </div>
              <div className={`stepDivider ${forgotStep > 2 ? "completed" : ""}`} />
              <div className={`AdminLogin-step ${forgotStep === 3 ? "active" : ""}`}>
                <span className="stepCircle">3</span>
                <span className="stepText">Password</span>
              </div>
            </div>

            {/* STEP 1: Enter Account */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendResetOtp} className="AdminLogin-form">
                <div className="AdminLogin-forgotHeading">
                  <h3>Reset Your Password</h3>
                  <p>Enter your registered email address or mobile number to receive a 6-digit verification code.</p>
                </div>

                <div className="AdminLogin-field">
                  <label>Registered Email or Mobile Number</label>
                  <div className="AdminLogin-inputWrap">
                    <FiMail className="inputIcon" />
                    <input
                      type="text"
                      placeholder="e.g. admin@alkadrops.com or 9823045671"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="AdminLogin-submitBtn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending Code..."
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: "First Verified" (Verify OTP) */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyResetOtp} className="AdminLogin-form">
                <div className="AdminLogin-forgotHeading">
                  <h3>Verify Security Code</h3>
                  <p>
                    We sent a 6-digit OTP code to <strong>{forgotMaskedEmail}</strong>. Enter it below to verify your account.
                  </p>
                </div>

                <div className="AdminLogin-field">
                  <label>6-Digit Verification Code</label>
                  <div className="AdminLogin-inputWrap">
                    <FiCheckCircle className="inputIcon" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="• • • • • •"
                      className="otpInput"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      autoFocus
                    />
                  </div>
                  {forgotDemoOtp && (
                    <button
                      type="button"
                      className="AdminLogin-quickOtp"
                      onClick={() => setForgotOtp(forgotDemoOtp)}
                    >
                      Fill Code: <strong>{forgotDemoOtp}</strong>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="AdminLogin-submitBtn"
                  disabled={isSubmitting || forgotOtp.trim().length !== 6}
                >
                  {isSubmitting ? (
                    "Verifying Code..."
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <FiCheckCircle />
                    </>
                  )}
                </button>

                <div className="AdminLogin-subActions">
                  <button
                    type="button"
                    className="textBtn"
                    onClick={handleSendResetOtp}
                    disabled={isSubmitting}
                  >
                    Resend Code
                  </button>
                  <span className="dot">•</span>
                  <button
                    type="button"
                    className="textBtn"
                    onClick={() => {
                      setForgotStep(1);
                      setErrorMessage("");
                    }}
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: "Then Confirm and Password" (New Password & Confirm) */}
            {forgotStep === 3 && (
              <form onSubmit={handleConfirmResetPassword} className="AdminLogin-form">
                <div className="AdminLogin-forgotHeading">
                  <div className="AdminLogin-verifiedTag">
                    <FiCheckCircle size={14} /> Code Verified Successfully
                  </div>
                  <h3>Set New Password</h3>
                  <p>Choose a secure password for your account.</p>
                </div>

                <div className="AdminLogin-field">
                  <label>New Password</label>
                  <div className="AdminLogin-inputWrap">
                    <FiLock className="inputIcon" />
                    <input
                      type={showForgotNewPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="AdminLogin-eyeBtn"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    >
                      {showForgotNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="AdminLogin-field">
                  <label>Confirm New Password</label>
                  <div className="AdminLogin-inputWrap">
                    <FiLock className="inputIcon" />
                    <input
                      type={showForgotConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password to confirm"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="AdminLogin-eyeBtn"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    >
                      {showForgotConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="AdminLogin-submitBtn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Updating Password..."
                  ) : (
                    <>
                      <span>Confirm &amp; Update Password</span>
                      <FiLock />
                    </>
                  )}
                </button>
              </form>
            )}

            <button
              type="button"
              className="AdminLogin-backBtn"
              onClick={() => {
                setIsForgotMode(false);
                setForgotStep(1);
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              <FiArrowLeft />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;

