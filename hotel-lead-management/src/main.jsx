import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Hotels from "./pages/Hotels";
import Wishlist from "./pages/Wishlist"
import AdminDashboard from "./pages/AdminDashboard";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/admin" element={<AdminDashboard/>} />
    </Routes>
  </Router>
);
