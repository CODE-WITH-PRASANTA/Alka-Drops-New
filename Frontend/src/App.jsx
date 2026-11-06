import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import { ShopProvider } from "./context/ShopContext";
import ShopToast from "./Components/ShopToast/ShopToast";

import Topbar from "./Components/Topbar/Topbar";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Contact from "./Pages/Contact/Contact";
import Shop from "./Pages/Shop/Shop";
import ShopDetails from "./Pages/ShopDetails/ShopDetails";
import Subscription from "./Pages/Subscription/Subscription";
import Faq from "./Pages/Faq/Faq";
import Cart from "./Pages/Cart/Cart";
import Wishlist from "./Pages/Wishlist/Wishlist";

import Blog from "./Pages/Blog/Blog";
import BlogDetails from "./Pages/BlogDetails/BlogDetails";
import Team from "./Pages/Team/Team";
import Gallary from "./Pages/Gallary/Gallary";
import Service from "./Pages/Service/Service";
import FloatingIcons from "./Components/FloatingIcons/FloatingIcons";
import Login from "./Components/Login/Login";

const App = () => {
  return (
    <ShopProvider>
      <BrowserRouter>
        <div className="App">
          <Topbar />
          <Navbar />

          <main className="App-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />

              {/* Services */}
              <Route path="/services" element={<Service />} />
              <Route path="/service-details" element={<Service />} />

              {/* Contact */}
              <Route path="/contact" element={<Contact />} />

              {/* Blog */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetails />} />
              <Route path="/blog-details" element={<BlogDetails />} />
              <Route path="/blog-details/:slug" element={<BlogDetails />} />
              <Route path="/blog-detais" element={<BlogDetails />} />

              {/* Team and Gallery */}
              <Route path="/team" element={<Team />} />
              <Route path="/gallery" element={<Gallary />} />

              {/* Shop */}
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop-details" element={<ShopDetails />} />

              {/* Subscription, FAQ, Cart & Wishlist */}
              <Route path="/pricing" element={<Subscription />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/login" element={<Login defaultMode="login" />} />
              <Route path="/register" element={<Login defaultMode="register" />} />
              <Route path="/signup" element={<Login defaultMode="register" />} />
            </Routes>
          </main>

          <Footer />
        </div>
        <FloatingIcons />
        <ShopToast />
      </BrowserRouter>
    </ShopProvider>
  );
};

export default App;
