import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";



import "./App.css";
import Topbar from "./Component/Topbar/Topbar";
import Home from "./Pages/Home/Home";
import Navbar from "./Component/Navbar/Navbar";
import Footer from "./Component/Footer/Footer";
import About from "./Pages/About/About";

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

          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;