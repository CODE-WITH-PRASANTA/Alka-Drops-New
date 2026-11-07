import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUploadCloud,
  FiCamera,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiKey,
  FiFileText,
  FiTruck,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiShield,
  FiRefreshCw,
  FiCheck,
  FiCopy,
} from "react-icons/fi";
import API from "../../services/api";
import "./AddDeliveryBoy.css";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  password: "AlkaDelivery@2026",
  aadharNumber: "",
  panNumber: "",
  presentAddress: {
    street: "",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
  },
  permanentAddress: {
    street: "",
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751012",
  },
  sameAsPresent: true,
  vehicleType: "Electric Loader Van",
  vehicleNumber: "",
  route: "Zone A - Nayapalli / IRC Village / Jaydev Vihar",
  dailyQuota: "120 Jars",
  status: "On Duty",
  avatar: "",
};

const AddDeliveryBoy = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(initialFormState);
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [copiedKey, setCopiedKey] = useState("");

  // Handle standard form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrorMessage("");

    if (name.startsWith("present.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        presentAddress: { ...prev.presentAddress, [key]: value },
        permanentAddress: prev.sameAsPresent
          ? { ...prev.presentAddress, [key]: value }
          : prev.permanentAddress,
      }));
    } else if (name.startsWith("permanent.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        permanentAddress: { ...prev.permanentAddress, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Toggle same address checkbox
  const handleSameAddressToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsPresent: isChecked,
      permanentAddress: isChecked ? { ...prev.presentAddress } : prev.permanentAddress,
    }));
  };

  // Handle Profile Picture File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image file is too large. Maximum allowed size is 5MB.");
      return;
    }

    setErrorMessage("");
    setProfileFile(file);

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to server immediately to obtain permanent WebP URL
    try {
      setIsUploadingPhoto(true);
      const uploadData = new FormData();
      uploadData.append("image", file);

      const res = await API.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const serverUrl = res.data?.url || res.data?.fileUrl;
      if (serverUrl) {
        setFormData((prev) => ({ ...prev, avatar: serverUrl }));
      }
    } catch (err) {
      console.warn("Direct upload failed, will fallback to local preview:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Remove uploaded profile photo
  const handleRemovePhoto = () => {
    setProfileFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Copy to clipboard helper
  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validations
    if (!formData.name.trim()) {
      setErrorMessage("Please enter the delivery partner's full legal name.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Please enter a valid login email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please enter contact mobile number.");
      return;
    }
    if (!formData.aadharNumber.trim() || formData.aadharNumber.replace(/\s+/g, "").length < 12) {
      setErrorMessage("A valid 12-digit Aadhar Card Number is required for KYC compliance.");
      return;
    }
    if (!formData.panNumber.trim() || formData.panNumber.trim().length < 10) {
      setErrorMessage("A valid 10-character PAN Card Number is required.");
      return;
    }
    if (!formData.vehicleNumber.trim()) {
      setErrorMessage("Vehicle registration number is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      // If user selected a file but it hasn't uploaded to server yet
      let finalAvatarUrl = formData.avatar;
      if (profileFile && !finalAvatarUrl) {
        try {
          const uploadData = new FormData();
          uploadData.append("image", profileFile);
          const uploadRes = await API.post("/upload", uploadData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          finalAvatarUrl = uploadRes.data?.url || uploadRes.data?.fileUrl || "";
        } catch (uploadErr) {
          console.error("Failed to upload avatar image:", uploadErr);
        }
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password || "AlkaDelivery@2026",
        phone: formData.phone.trim(),
        aadharNumber: formData.aadharNumber.trim(),
        panNumber: formData.panNumber.trim().toUpperCase(),
        presentAddress: formData.presentAddress,
        permanentAddress: formData.sameAsPresent
          ? formData.presentAddress
          : formData.permanentAddress,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        route: formData.route,
        dailyQuota: formData.dailyQuota,
        status: formData.status,
        avatar: finalAvatarUrl || "",
      };

      const res = await API.post("/delivery-boys", payload);

      if (res.data?.success) {
        setSuccessData({
          partnerId: res.data.rider?.partnerId || "ALK-DB-NEW",
          name: res.data.rider?.name || formData.name,
          email: res.data.rider?.email || formData.email,
          phone: res.data.rider?.phone || formData.phone,
          password: formData.password || "AlkaDelivery@2026",
          role: "Delivery Boy",
          avatar: finalAvatarUrl,
          vehicleNumber: res.data.rider?.vehicleNumber || formData.vehicleNumber,
          route: res.data.rider?.route || formData.route,
        });
      } else {
        setErrorMessage(res.data?.message || "Failed to create delivery agent account.");
      }
    } catch (err) {
      console.error("Create Delivery Agent Error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to connect to server. Please verify backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAvatar = previewUrl || formData.avatar;

  return (
    <div className="AddDeliveryBoy-page">
      {/* Top Breadcrumb & Header */}
      <div className="AddDeliveryBoy-header">
        <div className="AddDeliveryBoy-headingWrap">
          <button
            type="button"
            className="AddDeliveryBoy-backBtn"
            onClick={() => navigate("/admin/delivery-boy-id")}
            title="Back to Fleet & ID Cards"
          >
            <FiArrowLeft />
          </button>
          <div>
            <div className="AddDeliveryBoy-breadcrumb">
              <span>Delivery Fleet</span> / <span className="active">Add Delivery Agent</span>
            </div>
            <h1 className="AddDeliveryBoy-title">
              Register Delivery Agent
              <span className="AddDeliveryBoy-pill">Official Onboarding</span>
            </h1>
            <p className="AddDeliveryBoy-subtitle">
              Issue system credentials, record KYC identity documents, assign operational route and vehicle, and integrate a new delivery partner into the Alka Drops fleet.
            </p>
          </div>
        </div>

        <div className="AddDeliveryBoy-headerActions">
          <Link to="/admin/delivery-boy-id" className="AddDeliveryBoy-btn outline">
            <FiCreditCard /> View Delivery Fleet &amp; ID Cards
          </Link>
        </div>
      </div>

      {/* Success Modal / Banner */}
      {successData && (
        <div className="AddDeliveryBoy-successCard">
          <div className="AddDeliveryBoy-successTop">
            <div className="AddDeliveryBoy-successIcon">
              <FiCheckCircle />
            </div>
            <div>
              <h2>Delivery Account Successfully Created!</h2>
              <p>
                The new delivery partner has been registered with system role <strong>"Delivery Boy"</strong> and granted portal access.
              </p>
            </div>
          </div>

          <div className="AddDeliveryBoy-credGrid">
            <div className="credItem">
              <span className="label">Official Partner ID</span>
              <div className="valWrap">
                <span className="val badgeId">{successData.partnerId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(successData.partnerId, "pid")}
                  className="copyBtn"
                  title="Copy Partner ID"
                >
                  {copiedKey === "pid" ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
            </div>

            <div className="credItem">
              <span className="label">Login Email</span>
              <div className="valWrap">
                <span className="val">{successData.email}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(successData.email, "email")}
                  className="copyBtn"
                  title="Copy Email"
                >
                  {copiedKey === "email" ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
            </div>

            <div className="credItem">
              <span className="label">Initial Password</span>
              <div className="valWrap">
                <span className="val code">{successData.password}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(successData.password, "pass")}
                  className="copyBtn"
                  title="Copy Password"
                >
                  {copiedKey === "pass" ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
            </div>

            <div className="credItem">
              <span className="label">System Role</span>
              <div className="valWrap">
                <span className="val role">{successData.role}</span>
              </div>
            </div>
          </div>

          <div className="AddDeliveryBoy-successActions">
            <button
              type="button"
              className="AddDeliveryBoy-btn primary"
              onClick={() => navigate("/admin/delivery-boy-id")}
            >
              <FiCreditCard /> View in Fleet &amp; Print ID Card
            </button>
            <button
              type="button"
              className="AddDeliveryBoy-btn outline"
              onClick={() => {
                setSuccessData(null);
                setFormData(initialFormState);
                setProfileFile(null);
                setPreviewUrl("");
              }}
            >
              + Register Another Delivery Agent
            </button>
          </div>
        </div>
      )}

      {/* Main Form Layout (2 Columns on Desktop) */}
      <div className="AddDeliveryBoy-layout">
        {/* Left Side: Creation Form */}
        <div className="AddDeliveryBoy-formContainer">
          {errorMessage && (
            <div className="AddDeliveryBoy-alert error">
              <FiAlertCircle />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="AddDeliveryBoy-form">
            {/* PROFILE PICTURE SECTION */}
            <div className="AddDeliveryBoy-photoCard">
              <div className="AddDeliveryBoy-photoPreviewWrap">
                <div className="AddDeliveryBoy-photoPreview">
                  {activeAvatar ? (
                    <img src={activeAvatar} alt="Delivery Agent Preview" />
                  ) : (
                    <div className="AddDeliveryBoy-photoPlaceholder">
                      <FiUser />
                    </div>
                  )}

                  {isUploadingPhoto && (
                    <div className="AddDeliveryBoy-photoUploading">
                      <FiRefreshCw className="spin" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="AddDeliveryBoy-photoCameraBtn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
                >
                  <FiCamera />
                </button>
              </div>

              <div className="AddDeliveryBoy-photoInfo">
                <h3>Delivery Agent Profile Picture</h3>
                <p>
                  Upload a clear passport-style photo of the delivery personnel. This will appear on their official Alka Drops ID Card pass and system profile.
                </p>

                <div className="AddDeliveryBoy-photoButtons">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="AddDeliveryBoy-btn upload"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                  >
                    <FiUploadCloud /> {activeAvatar ? "Change Photo" : "Upload Profile Picture"}
                  </button>

                  {activeAvatar && (
                    <button
                      type="button"
                      className="AddDeliveryBoy-btn remove"
                      onClick={handleRemovePhoto}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  )}
                </div>
                <span className="AddDeliveryBoy-photoHelp">
                  Supported formats: PNG, JPG, WEBP. Max file size: 5MB.
                </span>
              </div>
            </div>

            {/* SECTION 1: ACCOUNT & LOGIN CREDENTIALS */}
            <div className="AddDeliveryBoy-section">
              <div className="AddDeliveryBoy-sectionHead">
                <div className="stepNum">1</div>
                <div>
                  <h2>Account &amp; Login Credentials</h2>
                  <p>Primary contact and credentials to access delivery partner portal</p>
                </div>
              </div>

              <div className="AddDeliveryBoy-grid two-col">
                <div className="AddDeliveryBoy-field">
                  <label>Full Legal Name *</label>
                  <div className="inputWithIcon">
                    <FiUser className="inputIcon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Deepak Kumar Nayak"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="AddDeliveryBoy-field">
                  <label>Email Address (Account Login) *</label>
                  <div className="inputWithIcon">
                    <FiMail className="inputIcon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. deepak.delivery@alkadrops.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="AddDeliveryBoy-field">
                  <label>Contact Phone Number *</label>
                  <div className="inputWithIcon">
                    <FiPhone className="inputIcon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="AddDeliveryBoy-field">
                  <label>Assigned System Role</label>
                  <div className="inputWithIcon">
                    <FiShield className="inputIcon" />
                    <input
                      type="text"
                      value="Delivery Boy"
                      readOnly
                      className="readOnlyInput"
                      title="System role is locked to Delivery Boy"
                    />
                  </div>
                </div>

                <div className="AddDeliveryBoy-field full-width">
                  <label>Initial Login Password *</label>
                  <div className="inputWithIcon">
                    <FiKey className="inputIcon" />
                    <input
                      type="text"
                      name="password"
                      placeholder="Initial login password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                    />
                  </div>
                  <small className="fieldHint">
                    Delivery agent will use this password along with their email to log into the delivery portal.
                  </small>
                </div>
              </div>
            </div>

            {/* SECTION 2: IDENTITY & KYC DOCUMENTS */}
            <div className="AddDeliveryBoy-section">
              <div className="AddDeliveryBoy-sectionHead">
                <div className="stepNum">2</div>
                <div>
                  <h2>Identity &amp; Government KYC Documents</h2>
                  <p>Required compliance documents for background verification</p>
                </div>
              </div>

              <div className="AddDeliveryBoy-grid two-col">
                <div className="AddDeliveryBoy-field">
                  <label>Aadhar Card Number (12 Digits) *</label>
                  <div className="inputWithIcon">
                    <FiFileText className="inputIcon" />
                    <input
                      type="text"
                      name="aadharNumber"
                      placeholder="e.g. 5621 8902 4412"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      maxLength={14}
                      required
                    />
                  </div>
                </div>

                <div className="AddDeliveryBoy-field">
                  <label>PAN Card Number (10 Characters) *</label>
                  <div className="inputWithIcon">
                    <FiFileText className="inputIcon" />
                    <input
                      type="text"
                      name="panNumber"
                      placeholder="e.g. ABCDE1234F"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      maxLength={10}
                      style={{ textTransform: "uppercase" }}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: PRESENT RESIDENTIAL ADDRESS */}
            <div className="AddDeliveryBoy-section">
              <div className="AddDeliveryBoy-sectionHead">
                <div className="stepNum">3</div>
                <div>
                  <h2>Present Residential Address</h2>
                  <p>Current address where the delivery partner is currently staying</p>
                </div>
              </div>

              <div className="AddDeliveryBoy-grid">
                <div className="AddDeliveryBoy-field full-width">
                  <label>Street / Flat / House / Landmark *</label>
                  <div className="inputWithIcon">
                    <FiMapPin className="inputIcon" />
                    <input
                      type="text"
                      name="present.street"
                      placeholder="e.g. Plot No 120, Near Crown Hotel, Nayapalli"
                      value={formData.presentAddress.street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="AddDeliveryBoy-grid three-col">
                  <div className="AddDeliveryBoy-field">
                    <label>City</label>
                    <input
                      type="text"
                      name="present.city"
                      value={formData.presentAddress.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="AddDeliveryBoy-field">
                    <label>State</label>
                    <input
                      type="text"
                      name="present.state"
                      value={formData.presentAddress.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="AddDeliveryBoy-field">
                    <label>PIN Code</label>
                    <input
                      type="text"
                      name="present.postalCode"
                      value={formData.presentAddress.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: PERMANENT RESIDENTIAL ADDRESS */}
            <div className="AddDeliveryBoy-section">
              <div className="AddDeliveryBoy-sectionHead">
                <div className="stepNum">4</div>
                <div>
                  <h2>Permanent Residential Address</h2>
                  <p>Permanent address as per government identity records</p>
                </div>
              </div>

              <div className="AddDeliveryBoy-checkboxWrap">
                <label className="checkboxLabel">
                  <input
                    type="checkbox"
                    checked={formData.sameAsPresent}
                    onChange={handleSameAddressToggle}
                  />
                  <span>Permanent address is the same as present residential address</span>
                </label>
              </div>

              {!formData.sameAsPresent && (
                <div className="AddDeliveryBoy-grid" style={{ marginTop: "14px" }}>
                  <div className="AddDeliveryBoy-field full-width">
                    <label>Permanent Street / Village / Landmark *</label>
                    <input
                      type="text"
                      name="permanent.street"
                      placeholder="Permanent address"
                      value={formData.permanentAddress.street}
                      onChange={handleInputChange}
                      required={!formData.sameAsPresent}
                    />
                  </div>

                  <div className="AddDeliveryBoy-grid three-col">
                    <div className="AddDeliveryBoy-field">
                      <label>City</label>
                      <input
                        type="text"
                        name="permanent.city"
                        value={formData.permanentAddress.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="AddDeliveryBoy-field">
                      <label>State</label>
                      <input
                        type="text"
                        name="permanent.state"
                        value={formData.permanentAddress.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="AddDeliveryBoy-field">
                      <label>PIN Code</label>
                      <input
                        type="text"
                        name="permanent.postalCode"
                        value={formData.permanentAddress.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: FLEET VEHICLE & OPERATIONAL ROUTE */}
            <div className="AddDeliveryBoy-section">
              <div className="AddDeliveryBoy-sectionHead">
                <div className="stepNum">5</div>
                <div>
                  <h2>Vehicle &amp; Operational Route Assignment</h2>
                  <p>Delivery vehicle specs, assigned delivery zone, and daily jar capacity</p>
                </div>
              </div>

              <div className="AddDeliveryBoy-grid two-col">
                <div className="AddDeliveryBoy-field">
                  <label>Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                  >
                    <option value="Electric Loader Van">Electric Loader Van (Recommended)</option>
                    <option value="3-Wheeler E-Rickshaw">3-Wheeler E-Rickshaw (High Capacity)</option>
                    <option value="Hero Electric Scooter">Hero Electric Scooter (Express)</option>
                    <option value="Tata Ace Mini Truck">Tata Ace Mini Truck (Bulk Delivery)</option>
                    <option value="Mahindra Bolero Pickup">Mahindra Bolero Pickup</option>
                  </select>
                </div>

                <div className="AddDeliveryBoy-field">
                  <label>Vehicle Registration Number *</label>
                  <div className="inputWithIcon">
                    <FiTruck className="inputIcon" />
                    <input
                      type="text"
                      name="vehicleNumber"
                      placeholder="e.g. OD-02-AX-8910"
                      value={formData.vehicleNumber}
                      onChange={handleInputChange}
                      style={{ textTransform: "uppercase" }}
                      required
                    />
                  </div>
                </div>

                <div className="AddDeliveryBoy-field">
                  <label>Assigned Delivery Route / Sector</label>
                  <select
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                  >
                    <option value="Zone A - Nayapalli / IRC Village / Jaydev Vihar">
                      Zone A - Nayapalli / IRC Village / Jaydev Vihar
                    </option>
                    <option value="Zone B - Saheed Nagar / Satya Nagar / Kharvel Nagar">
                      Zone B - Saheed Nagar / Satya Nagar / Kharvel Nagar
                    </option>
                    <option value="Zone C - Patia / Infocity / KIIT Road / Chandrasekharpur">
                      Zone C - Patia / Infocity / KIIT Road / Chandrasekharpur
                    </option>
                    <option value="Zone D - Khandagiri / Jagamara / Pokhariput">
                      Zone D - Khandagiri / Jagamara / Pokhariput
                    </option>
                    <option value="Zone E - Rasulgarh / Mancheswar / Cuttack Road">
                      Zone E - Rasulgarh / Mancheswar / Cuttack Road
                    </option>
                  </select>
                </div>

                <div className="AddDeliveryBoy-field">
                  <label>Daily Water Delivery Capacity</label>
                  <select
                    name="dailyQuota"
                    value={formData.dailyQuota}
                    onChange={handleInputChange}
                  >
                    <option value="80 Jars">80 Jars / Day</option>
                    <option value="120 Jars">120 Jars / Day (Standard Fleet)</option>
                    <option value="160 Jars">160 Jars / Day (Heavy Duty)</option>
                    <option value="200 Jars">200 Jars / Day (Bulk Route)</option>
                  </select>
                </div>

                <div className="AddDeliveryBoy-field">
                  <label>Initial Duty Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="On Duty">On Duty (Active Dispatch)</option>
                    <option value="Off Duty">Off Duty (Standby)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="AddDeliveryBoy-formActions">
              <button
                type="submit"
                className="AddDeliveryBoy-btn primary submitBtn"
                disabled={isSubmitting || isUploadingPhoto}
              >
                {isSubmitting ? (
                  <>
                    <FiRefreshCw className="spin" /> Generating Account &amp; Issuing ID...
                  </>
                ) : (
                  <>
                    <FiCheckCircle /> Register Delivery Agent &amp; Issue ID
                  </>
                )}
              </button>

              <button
                type="button"
                className="AddDeliveryBoy-btn cancel"
                onClick={() => navigate("/admin/delivery-boy-id")}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Live ID Card Pass Preview */}
        <div className="AddDeliveryBoy-previewPanel">
          <div className="AddDeliveryBoy-previewSticky">
            <div className="AddDeliveryBoy-previewBadgeTitle">
              <FiCreditCard /> Live Official ID Pass Preview
            </div>

            {/* Rendered Physical ID Badge */}
            <div className="AddDeliveryBoy-idCard">
              <div className="AddDeliveryBoy-idCardTop">
                <div className="brandBadge">ALKA DROPS</div>
                <div className="passType">OFFICIAL HYDRATION DELIVERY PASS</div>
              </div>

              <div className="AddDeliveryBoy-idCardBody">
                <div className="avatarRing">
                  {activeAvatar ? (
                    <img src={activeAvatar} alt="Partner Photo" />
                  ) : (
                    <div className="avatarDefault">
                      <FiUser />
                    </div>
                  )}
                </div>

                <h3 className="partnerName">
                  {formData.name.trim() || "Delivery Personnel Name"}
                </h3>

                <span className="partnerRole">
                  ROLE: DELIVERY BOY
                </span>

                <div className="partnerIdPill">
                  <span>ID:</span>
                  <strong>ALK-DB-NEW</strong>
                </div>

                <div className="detailsTable">
                  <div className="row">
                    <span className="lbl">Contact:</span>
                    <span className="val">{formData.phone.trim() || "+91 XXXXX XXXXX"}</span>
                  </div>
                  <div className="row">
                    <span className="lbl">Email:</span>
                    <span className="val small">{formData.email.trim() || "partner@alkadrops.com"}</span>
                  </div>
                  <div className="row">
                    <span className="lbl">Vehicle:</span>
                    <span className="val">
                      {formData.vehicleNumber.trim().toUpperCase() || "OD-XX-XX-XXXX"}
                    </span>
                  </div>
                  <div className="row">
                    <span className="lbl">Route:</span>
                    <span className="val">{formData.route}</span>
                  </div>
                  <div className="row">
                    <span className="lbl">Quota:</span>
                    <span className="val">{formData.dailyQuota}</span>
                  </div>
                </div>

                <div className="idCardSecurity">
                  <div className="barcodeSimulation">
                    <div className="bars"></div>
                    <span>GOVT KYC VERIFIED &bull; OFFICIAL ALKA PASS</span>
                  </div>
                </div>
              </div>

              <div className="AddDeliveryBoy-idCardBottom">
                <span>Doorstep Hydration Fleet Network &bull; Bhubaneswar</span>
              </div>
            </div>

            {/* Quick Helper Callout */}
            <div className="AddDeliveryBoy-helperCallout">
              <h4>
                <FiShield /> Role &amp; Security Privileges
              </h4>
              <p>
                Creating this delivery account grants access to the Alka Drops Delivery Companion App with role <strong>"Delivery Boy"</strong>, enabling jar scan verification, OTP confirmation, and route GPS tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDeliveryBoy;

