import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";



import MainLayout from "./Layout/MainLayout/MainLayout";
import Dashboard from "./Pages/Dashboard/Dashboard";

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
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;