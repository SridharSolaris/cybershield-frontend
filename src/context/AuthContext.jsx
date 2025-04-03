// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const checkTokenExpiration = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            handleLogout();
            return;
        }

        try {
            // Decode JWT token
            const [, payloadBase64] = token.split('.');
            const payload = JSON.parse(atob(payloadBase64));

            // Check if token has expired
            const currentTime = Date.now() / 1000;
            if (payload.exp <= currentTime) {
                console.log("Token expired, logging out...");
                handleLogout();
            } else {
                // Set timer for auto logout when token expires
                const timeUntilExpiry = (payload.exp - currentTime) * 1000;
                setTimeout(handleLogout, timeUntilExpiry);
            }
        } catch (error) {
            console.error("Invalid token format:", error);
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
        localStorage.setItem("token", token);
        checkTokenExpiration(); // Start monitoring token expiration
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
            checkTokenExpiration();
        }

        // Check token every minute
        const interval = setInterval(checkTokenExpiration, 60000);
        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
