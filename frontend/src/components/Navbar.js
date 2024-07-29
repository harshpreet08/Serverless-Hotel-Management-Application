// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cognitoLoginPath } from "../config";
import NotificationsIcon from "@mui/icons-material/Notifications";

const Navbar = () => {
  const { auth, logout } = useAuth();

  return (
    <nav className="bg-yellow-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-white text-lg font-bold">
            Home
          </Link>
          <Link to="/properties" className="text-white text-lg font-bold ml-3">
            Properties
          </Link>
          <Link to="/feedbacks" className="text-white text-lg font-bold ml-3">
            Feedbacks
          </Link>
          {auth.role === "property_agent" && (
            <Link
              to="/login-stats"
              className="text-white text-lg font-bold ml-3"
            >
              Dashboard
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {!auth.isAuthenticated ? (
            <>
              <Link className="text-white" to={cognitoLoginPath}>
                Login
              </Link>
              <Link to="/signup" className="text-white">
                Signup
              </Link>
            </>
          ) : (
            <>
              <span className="text-white">Hello, {auth.user}</span>
              <a href="/preview.html" className="text-white">
                <NotificationsIcon fontSize="medium" />
              </a>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
