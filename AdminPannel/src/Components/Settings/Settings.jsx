import React, { useState } from "react";
import {
  FiSettings,
  FiSave,
  FiCheckCircle,
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiDroplet,
  FiShield,
  FiSliders,
} from "react-icons/fi";
import "./Settings.css";

const Settings = () => {
  const [formData, setFormData] = useState({
    brandName: "Alka Drops Premium Alkaline Water",
    tagline: "Natural Mineral Balance & Everyday Hydration",
    supportPhone: "+91 91732 70924",
    supportEmail: "info@alkadrops.com",
    address: "Survey No 48, Wadgaon Sheri, Nagar Road, Pune, Maharashtra 411014",
    defaultDeliveryWindow: "06:00 AM - 09:00 AM",
    phLevelStandard: "8.5+ to 9.0 pH",
    tdsTarget: "120 - 150 PPM",
    securityDeposit20L: "150",
    freeDeliveryThreshold: "500",
    emailNotifications: true,
    smsDispatchAlerts: true,
    maintenanceMode: false,
  });

  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="SettingsPage">
      {savedToast && (
        <div className="SettingsPage-toast">
          <FiCheckCircle /> Settings updated successfully!
        </div>
      )}

      <header className="SettingsPage-header">
        <div className="SettingsPage-heading">
          <div className="SettingsPage-headingIcon">
            <FiSettings />
          </div>
          <h1>System & Brand Settings</h1>
        </div>
        <button type="submit" form="settingsForm" className="SettingsPage-saveBtn">
          <FiSave /> <span>Save Configuration</span>
        </button>
      </header>

      <form id="settingsForm" onSubmit={handleSave} className="SettingsPage-form">
        {/* Brand & Contact */}
        <div className="SettingsPage-sectionCard">
          <div className="SettingsPage-sectionTitle">
            <FiSliders />
            <h3>Brand Profile & Customer Care</h3>
          </div>
          <div className="SettingsPage-grid2">
            <div className="formGroup">
              <label>Company / Brand Name</label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              />
            </div>
            <div className="formGroup">
              <label>Brand Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
            <div className="formGroup">
              <label><FiPhone /> Customer Support Phone</label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              />
            </div>
            <div className="formGroup">
              <label><FiMail /> Customer Support Email</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              />
            </div>
          </div>
          <div className="formGroup full">
            <label><FiMapPin /> Main Bottling Plant / Depot Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        {/* Quality Standards & Operating Rules */}
        <div className="SettingsPage-sectionCard">
          <div className="SettingsPage-sectionTitle">
            <FiDroplet />
            <h3>Water Purity Standards & Delivery Policies</h3>
          </div>
          <div className="SettingsPage-grid2">
            <div className="formGroup">
              <label>Alkaline pH Target</label>
              <input
                type="text"
                value={formData.phLevelStandard}
                onChange={(e) => setFormData({ ...formData, phLevelStandard: e.target.value })}
              />
            </div>
            <div className="formGroup">
              <label>Mineral TDS Range</label>
              <input
                type="text"
                value={formData.tdsTarget}
                onChange={(e) => setFormData({ ...formData, tdsTarget: e.target.value })}
              />
            </div>
            <div className="formGroup">
              <label>Standard 20L Jar Refundable Deposit (₹)</label>
              <input
                type="number"
                value={formData.securityDeposit20L}
                onChange={(e) => setFormData({ ...formData, securityDeposit20L: e.target.value })}
              />
            </div>
            <div className="formGroup">
              <label>Free Delivery Threshold Order (₹)</label>
              <input
                type="number"
                value={formData.freeDeliveryThreshold}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* System Toggles */}
        <div className="SettingsPage-sectionCard">
          <div className="SettingsPage-sectionTitle">
            <FiShield />
            <h3>Notification & System Controls</h3>
          </div>
          <div className="SettingsPage-toggleRow">
            <div>
              <strong>Instant SMS & WhatsApp Alerts to Customers</strong>
              <p>Send automated tracking alerts when delivery partner starts morning run.</p>
            </div>
            <input
              type="checkbox"
              checked={formData.smsDispatchAlerts}
              onChange={(e) => setFormData({ ...formData, smsDispatchAlerts: e.target.checked })}
            />
          </div>
          <div className="SettingsPage-toggleRow">
            <div>
              <strong>Order Confirmation Email Receipts</strong>
              <p>Email PDF invoices automatically to customers upon order placement.</p>
            </div>
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;

