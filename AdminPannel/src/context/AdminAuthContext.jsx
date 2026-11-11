import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("alka_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("alka_admin_token") || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Sync token into API client header and verify with backend
  const verifyCurrentSession = async () => {
    const savedToken = localStorage.getItem("alka_admin_token");
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      API.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      const res = await API.get("/admin-users/me");
      if (res.data?.success && res.data.user) {
        setAdminUser(res.data.user);
        localStorage.setItem("alka_admin_user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn("Session verification warning:", err?.response?.data?.message || err.message);
      // If 401, keep state or allow re-login
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyCurrentSession();
  }, []);

  // Login handler
  const login = async (identifier, password) => {
    try {
      const res = await API.post("/admin-users/login", { identifier, password });
      if (res.data?.success) {
        const { token: newToken, user } = res.data;
        setToken(newToken);
        setAdminUser(user);

        localStorage.setItem("alka_admin_token", newToken);
        localStorage.setItem("alka_admin_user", JSON.stringify(user));
        API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        return { success: true, user };
      }
      return { success: false, message: res.data?.message || "Login failed" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid credentials or server error.",
      };
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setAdminUser(null);
    try {
      localStorage.removeItem("alka_admin_token");
      localStorage.removeItem("alka_admin_user");
    } catch {}
    delete API.defaults.headers.common["Authorization"];
  };

  const refreshUser = async () => {
    try {
      const res = await API.get("/admin-users/me");
      if (res.data?.success && res.data.user) {
        setAdminUser(res.data.user);
        localStorage.setItem("alka_admin_user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const role = adminUser?.role || "admin";
  const isAuthenticated = Boolean(token && adminUser);
  const isAdmin = role === "admin";
  const isDeliveryBoy = role === "delivery_boy";

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        role,
        isAuthenticated,
        isAdmin,
        isDeliveryBoy,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export default AdminAuthContext;

