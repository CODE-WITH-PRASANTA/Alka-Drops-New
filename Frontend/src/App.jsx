import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";



import "./App.css";
import Topbar from "./Components/Topbar/Topbar";
import Home from "./Pages/Home/Home";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import About from "./Pages/About/About";
import Contact from "./Pages/Contact/Contact";
import Shop from "./Pages/Shop/Shop";
import ShopDetails from "./Pages/ShopDetails/ShopDetails";
import Subscription from "./Pages/Subscription/Subscription";
import Faq from "./Pages/Faq/Faq";
import Cart from "./Pages/Cart/Cart";

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
            <Route path="/contact" element={<Contact/>} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop-details" element={<ShopDetails />} />
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