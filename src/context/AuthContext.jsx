// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create and export the AuthContext
export const AuthContext = createContext();

// Create and export the useAuth hook
export const useAuth = () => {
    return useContext(AuthContext);
};

// The AuthProvider component
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const checkTokenExpiration = () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            // Decode JWT token
            const [, payload] = token.split('.');
            const decodedPayload = JSON.parse(atob(payload));
            const expirationTime = decodedPayload.exp * 1000; // Convert to milliseconds

            if (Date.now() >= expirationTime) {
                console.log("Token expired, logging out...");
                handleLogout();
            } else {
                // Set timeout to logout when token expires
                const timeUntilExpiration = expirationTime - Date.now();
                setTimeout(handleLogout, timeUntilExpiration);
            }
        } catch (error) {
            console.error("Error checking token:", error);
            handleLogout();
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
        navigate("/login");
    };

    const login = (token) => {
        setIsLoggedIn(true);
        localStorage.setItem("token", token); // Store token in localStorage
        checkTokenExpiration();
    };

    const logout = () => {
        handleLogout();
    };

    useEffect(() => {
        checkTokenExpiration();
        const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
