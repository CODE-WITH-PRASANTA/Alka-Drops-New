import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";



import MainLayout from "./Layout/MainLayout/MainLayout";
import DashboardMain   from "./Pages/Dashboard/DashboardMain";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          {/* Default Route */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Route */}
          <Route path="dashboard" element={<DashboardMain  />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;