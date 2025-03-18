"use client";

import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Hotels from "./pages/Hotels";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Home, Heart, LogOut, LogIn, UserPlus } from "lucide-react";
import { Toaster, toast } from "sonner";

function App() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation(); // ✅ Get the current route

  return (
    <>
      {/* ✅ Hide navbar when on /admin */}
      {location.pathname !== "/admin" && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6 text-lg font-semibold">
              <Link to="/" className="flex items-center gap-2">
                <span className="hidden sm:inline-block">Travel Leads</span>
              </Link>

              {user ? (
                <nav className="flex items-center gap-4">
                  <Link
                    to="/hotels"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                  >
                    <Home className="h-4 w-4" />
                    <span>Hotels</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>
                </nav>
              ) : (
                <nav className="flex items-center gap-4">
                  <Link
                    to="/signup"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Signup</span>
                  </Link>
                  <Link
                    to="/login"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </nav>
              )}
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden md:inline-block">
                  Welcome, {user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Routes */}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={user ? <Hotels /> : <Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hotels" element={user ? <Hotels /> : <Login />} />
          <Route path="/wishlist" element={user ? <Wishlist /> : <Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <Toaster />
    </>
  );
}

export default App;
