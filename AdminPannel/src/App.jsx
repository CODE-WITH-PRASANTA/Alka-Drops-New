
import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./Layout/MainLayout/MainLayout";

// Dashboard


// Admin Components
import AddStock from "./Components/AddStock/AddStock";

import BlogPosting from "./Components/BlogPosting/BlogPosting";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import BlogCategory from "./Components/BlogCategory/BlogCategory";
import Dashboard from "./Pages/Dashboard/Dashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* MAIN ADMIN LAYOUT */}
        <Route path="/" element={<MainLayout />}>

          {/* DEFAULT ROUTE */}
          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />

          {/* DASHBOARD */}
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          {/* ADD STOCK */}
          <Route
            path="admin/shop/add-stock"
            element={<AddStock />}
          />

          {/* BLOG POST */}
          <Route
            path="admin/blog-post"
            element={<BlogPosting />}
          />

          {/* BLOG MANAGEMENT */}
          <Route
            path="admin/blog-management"
            element={<BlogManagement />}
          />

          {/* BLOG CATEGORY */}
          <Route
            path="admin/blog-category"
            element={<BlogCategory />}
          />

        </Route>

        {/* FALLBACK ROUTE */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
