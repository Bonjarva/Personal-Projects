// ─────────────────────────────────────────────────────────────────────────────
// External Dependencies
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────
interface LoginPageProps {
  onLogin: (token: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration Constants
// ─────────────────────────────────────────────────────────────────────────────
// Centralized API endpoint for authentication
const API_URL = import.meta.env.VITE_API_URL ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage Component
// ─────────────────────────────────────────────────────────────────────────────
const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // ───────────────────────────────────────────────────────────────────────────
  // State: Form fields & error message
  // ───────────────────────────────────────────────────────────────────────────
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ───────────────────────────────────────────────────────────────────────────
  // Navigation hook for redirects
  // ───────────────────────────────────────────────────────────────────────────
  const navigate = useNavigate();

  // ───────────────────────────────────────────────────────────────────────────
  // Handler: Form submission
  // ───────────────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(""); // Reset previous errors
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Username: username, Password: password }),
        });
        if (!response.ok) {
          setError("Login failed. Please check your credentials.");
          return;
        }
        const { token } = await response.json();
        onLogin(token);
        localStorage.setItem("authToken", token);
        navigate("/tasks", { replace: true }); // Redirect after login
      } catch (err) {
        console.error("Login error:", err);
        setError("An error occurred during login.");
      }
    },
    [username, password, onLogin, navigate]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Render: Login form UI
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <label className="block mb-6">
          <span className="block text-sm font-medium mb-1">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200"
        >
          Login
        </button>

        {/* Link to navigate to Register page */}
        <p className="text-center mt-4">
          <Link to="/register" className="text-blue-500 underline">
            Don't have an account? Register here.
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
