import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import Topbar from "./Components/Topbar/Topbar";
import Home from "./Pages/Home/Home";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import About from "./Pages/About/About";

import Contact from "./Pages/Contact/Contact";
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
            <Route path="/services" element={<Service />} />
            <Route path="/service-details" element={<Service />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog-details" element={< BlogCommentsSection/>} />
            <Route path="/team" element={< Team/>} />
            <Route path="/gallery" element={<Gallary />} />

          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;