// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ element, ...rest }) => {
  const { auth } = useAuth();

  if (!auth.isAuthenticated || auth.role !== "registered_user") {
    return <Navigate to="/" />;
  }

  return element;
};

export default ProtectedRoute;
