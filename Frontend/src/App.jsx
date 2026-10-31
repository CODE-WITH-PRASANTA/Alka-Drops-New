import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

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

import Blog from "./Pages/Blog/Blog";
import BlogCommentsSection from "./Components/BlogCommentsSection/BlogCommentsSection";
import Service from "./Pages/service/service";
import Team from "./Pages/Team/Team";
import Gallary from "./Pages/Gallary/Gallary";

const App = () => {
  return (
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
            <Route
              path="/blog-details"
              element={<BlogCommentsSection />}
            />

            {/* Team and Gallery */}
            <Route path="/team" element={<Team />} />
            <Route path="/gallery" element={<Gallary />} />

            {/* Shop */}
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop-details" element={<ShopDetails />} />

            {/* Subscription, FAQ, and Cart */}
            <Route path="/pricing" element={<Subscription />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;