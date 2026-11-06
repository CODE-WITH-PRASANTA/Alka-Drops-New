import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import "./ShopToast.css";

const ShopToast = () => {
  const { toast, showToast } = useShop();

  if (!toast?.visible) return null;

  const isError = toast.type === "error";
  const isInfo = toast.type === "info";

  return (
    <div className={`ShopToast ${isError ? "ShopToast-error" : isInfo ? "ShopToast-info" : "ShopToast-success"}`}>
      <div className="ShopToast-icon">
        {isError ? (
          <AlertCircle size={20} />
        ) : isInfo ? (
          <Info size={20} />
        ) : (
          <CheckCircle2 size={20} />
        )}
      </div>
      <div className="ShopToast-content">
        <span className="ShopToast-title">
          {isError ? "Notification" : isInfo ? "Cart & Wishlist" : "Success"}
        </span>
        <p className="ShopToast-message">{toast.message}</p>
      </div>
      <button
        type="button"
        className="ShopToast-close"
        onClick={() => showToast("", "info")}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ShopToast;

