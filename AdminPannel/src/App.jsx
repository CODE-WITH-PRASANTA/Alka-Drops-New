import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./Layout/MainLayout/MainLayout";

// Dashboard
import Dashboard from "./Pages/Dashboard/Dashboard";

// Admin Components
import AddStock from "./Components/AddStock/AddStock";
import ShopManage from "./Components/ShopManage/ShopManage";
import BlogPosting from "./Components/BlogPosting/BlogPosting";
import BlogManagement from "./Components/BlogManagement/BlogManagement";
import BlogCategory from "./Components/BlogCategory/BlogCategory";
import BlogComments from "./Components/BlogComments/BlogComments";
import ProductManagement from "./Components/ProductManagement/ProductManagement";
import TeamManagement from "./Components/TeamManagement/TeamManagement";
import GalleryManagement from "./Components/GalleryManagement/GalleryManagement";
import SubscriptionManagement from "./Components/SubscriptionManagement/SubscriptionManagement";
import OrderManagement from "./Components/OrderManagement/OrderManagement";
import SubscriptionOrders from "./Components/SubscriptionOrders/SubscriptionOrders";
import UserManagement from "./Components/UserManagement/UserManagement";
import DeliveryBoyId from "./Components/DeliveryBoyId/DeliveryBoyId";
import AddDeliveryBoy from "./Components/DeliveryBoyId/AddDeliveryBoy";
import AssigningBottle from "./Components/AssigningBottle/AssigningBottle";
import Settings from "./Components/Settings/Settings";
import ReportManagement from "./Components/ReportManagement/ReportManagement";
import EnquiryManagement from "./Components/EnquiryManagement/EnquiryManagement";
import ReviewManagement from "./Components/ReviewManagement/ReviewManagement";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* MAIN ADMIN LAYOUT */}
        <Route path="/" element={<MainLayout />}>
          {/* DEFAULT ROUTE */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          {/* DASHBOARD */}
          <Route path="admin/dashboard" element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* BLOG MANAGEMENT */}
          <Route path="admin/blog-post" element={<BlogPosting />} />
          <Route path="blog-post" element={<BlogPosting />} />

          <Route path="admin/blog-management" element={<BlogManagement />} />
          <Route path="blog-management" element={<BlogManagement />} />

          <Route path="admin/blog-category" element={<BlogCategory />} />
          <Route path="blog-category" element={<BlogCategory />} />

          <Route path="admin/blog-comments" element={<BlogComments />} />
          <Route path="blog-comments" element={<BlogComments />} />

          {/* SHOP */}
          <Route path="admin/shop/manage" element={<ShopManage />} />
          <Route path="shop/manage" element={<ShopManage />} />

          <Route path="admin/shop/add-stock" element={<AddStock />} />
          <Route path="shop/add-stock" element={<AddStock />} />

          {/* PRODUCT MANAGEMENT */}
          <Route path="admin/product-management" element={<ProductManagement />} />
          <Route path="product-management" element={<ProductManagement />} />

          {/* TEAM MANAGEMENT */}
          <Route path="admin/team-management" element={<TeamManagement />} />
          <Route path="team-management" element={<TeamManagement />} />

          {/* GALLERY MANAGEMENT */}
          <Route path="admin/gallery-management" element={<GalleryManagement />} />
          <Route path="gallery-management" element={<GalleryManagement />} />

          {/* SUBSCRIPTION MANAGEMENT */}
          <Route path="admin/subscription-management" element={<SubscriptionManagement />} />
          <Route path="subscription-management" element={<SubscriptionManagement />} />

          {/* ORDER MANAGEMENT */}
          <Route path="admin/order-management" element={<OrderManagement />} />
          <Route path="order-management" element={<OrderManagement />} />

          {/* SUBSCRIPTION ORDERS */}
          <Route path="admin/subscription-orders" element={<SubscriptionOrders />} />
          <Route path="subscription-orders" element={<SubscriptionOrders />} />

          {/* USER MANAGEMENT */}
          <Route path="admin/user-management" element={<UserManagement />} />
          <Route path="user-management" element={<UserManagement />} />

          {/* DELIVERY BOY MANAGEMENT */}
          <Route path="admin/delivery-boy-id" element={<DeliveryBoyId />} />
          <Route path="delivery-boy-id" element={<DeliveryBoyId />} />

          <Route path="admin/add-delivery-boy" element={<AddDeliveryBoy />} />
          <Route path="add-delivery-boy" element={<AddDeliveryBoy />} />

          <Route path="admin/assigning-bottle" element={<AssigningBottle />} />
          <Route path="assigning-bottle" element={<AssigningBottle />} />

          {/* SETTINGS */}
          <Route path="admin/settings" element={<Settings />} />
          <Route path="settings" element={<Settings />} />

          {/* REPORT MANAGEMENT */}
          <Route path="admin/report-management" element={<ReportManagement />} />
          <Route path="report-management" element={<ReportManagement />} />

          {/* ENQUIRY MANAGEMENT */}
          <Route path="admin/enquiry-management" element={<EnquiryManagement />} />
          <Route path="enquiry-management" element={<EnquiryManagement />} />

          {/* REVIEW MANAGEMENT */}
          <Route path="admin/review-management" element={<ReviewManagement />} />
          <Route path="review-management" element={<ReviewManagement />} />
        </Route>

        {/* FALLBACK ROUTE */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;