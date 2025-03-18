import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Hotels from "./pages/Hotels";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation(); // ✅ Get the current route

  return (
    <>
      {/* ✅ Hide navbar when on /admin */}
      {location.pathname !== "/admin" && (
        <nav className="p-4 bg-gray-200 flex justify-between">
          <div>
            {user ? (
              <>
                <Link to="/hotels" className="mr-4">Hotels</Link>
                <Link to="/wishlist" className="mr-4">Wishlist</Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="mr-4">Signup</Link>
                <Link to="/login" className="mr-4">Login</Link>
              </>
            )}
          </div>
          <div>
            {user ? (
              <>
                <span className="mr-4">Welcome, {user.name}</span>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </nav>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hotels" element={user ? <Hotels /> : <Login />} />
        <Route path="/wishlist" element={user ? <Wishlist /> : <Login />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* ✅ No Navbar Here */}
      </Routes>
    </>
  );
}

export default App;
