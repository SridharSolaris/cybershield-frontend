// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    let logoutTimer = null;

    const parseJwt = (token) => {
        try {
            const [, payloadBase64] = token.split(".");
            return JSON.parse(atob(payloadBase64));
        } catch (error) {
            console.error("Error decoding JWT token:", error);
            return null;
        }
    };

    const handleLogout = useCallback(() => {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
        navigate("/login");
        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }
    }, [navigate]);

    const checkTokenExpiration = useCallback(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            handleLogout();
            return;
        }

        const payload = parseJwt(token);
        if (!payload || !payload.exp) {
            handleLogout();
            return;
        }

        const currentTime = Date.now() / 1000;
        if (payload.exp <= currentTime) {
            console.log("Token expired, logging out...");
            handleLogout();
        } else {
            const timeUntilExpiry = (payload.exp - currentTime) * 1000;
            logoutTimer = setTimeout(handleLogout, timeUntilExpiry);
        }
    }, [handleLogout]);

    const login = (token) => {
        const payload = parseJwt(token);
        if (!payload || !payload.exp) {
            console.error("Invalid token format, rejecting login.");
            return;
        }

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
        return () => {
            clearInterval(interval);
            if (logoutTimer) clearTimeout(logoutTimer);
        };
    }, [checkTokenExpiration]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout: handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
