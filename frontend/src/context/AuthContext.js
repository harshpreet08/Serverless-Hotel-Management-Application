import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { setDoc, doc, updateDoc, increment } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    role: null,
  });

  const analyticsSubmission = async (username, isLogin = true) => {
    try {
      const docRef = doc(db, "loginStatistics", username);

      if (isLogin) {
        await setDoc(
          docRef,
          {
            email: username,
            login: new Date(),
          },
          { merge: true }
        );
        console.log("Login timestamp added/updated in Firebase ---->");
      } else {
        await updateDoc(docRef, {
          logout: new Date(),
          times: increment(1),
        });
        console.log("Logout timestamp updated in Firebase ---->");
      }
    } catch (error) {
      console.error("Error submitting analytics data: ", error);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("username");
    const isAuthCompleted = localStorage.getItem("isAuthCompleted");
    const role = localStorage.getItem("role");

    if (storedToken && storedUser && isAuthCompleted) {
      setAuth({
        isAuthenticated: true,
        user: storedUser,
        token: storedToken,
        role,
      });
    }
  }, []);

  const login = async (username, token, role) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("username", username);
    localStorage.setItem("isAuthCompleted", true);
    localStorage.setItem("role", role);
    await analyticsSubmission(username);
    setAuth({
      isAuthenticated: true,
      user: username,
      token,
      role,
    });
  };

  const logout = async () => {
    await analyticsSubmission(auth.user, false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("isAuthCompleted");
    localStorage.removeItem("role");
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      role: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
