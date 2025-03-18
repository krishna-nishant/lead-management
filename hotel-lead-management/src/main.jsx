import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import AuthProvider from "./context/AuthContext"; // ✅ Import Auth Context
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider> {/* ✅ Wrap the entire app with AuthProvider */}
      <App />
    </AuthProvider>
  </Router>
);
