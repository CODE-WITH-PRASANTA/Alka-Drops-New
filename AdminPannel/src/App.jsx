import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./Layout/MainLayout/MainLayout";
import Dashboard from "./Pages/Dashboard/Dashboard";
import AddStock from "./Components/AddStock/AddStock";
import BlogPosting from "./Components/BlogPosting/BlogPosting";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import BlogCategory from "./Components/BlogCategory/BlogCategory";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          {/* Default Route */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Route */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/admin/shop/add-stock" element={<AddStock />} />
          <Route path="/admin/blog-post" element={<BlogPosting />} />
          <Route path="/admin/blog-management" element={<BlogManagement />} />
          <Route path="/admin/blog-category" element={<BlogCategory />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
