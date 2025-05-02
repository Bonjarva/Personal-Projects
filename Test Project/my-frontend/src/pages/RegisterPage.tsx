// ─────────────────────────────────────────────────────────────────────────────
// External Dependencies
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────
interface RegisterPageProps {
  onRegister: (message: string) => void;
}

interface ErrorResponse {
  errors?: string[];
  title?: string;
  detail?: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration Constants
// ─────────────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// RegisterPage Component
// ─────────────────────────────────────────────────────────────────────────────
const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  // ───────────────────────────────────────────────────────────────────────────
  // State: Form Fields & Error
  // ───────────────────────────────────────────────────────────────────────────
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ───────────────────────────────────────────────────────────────────────────
  // Navigation Hook
  // ───────────────────────────────────────────────────────────────────────────
  const navigate = useNavigate();

  // ───────────────────────────────────────────────────────────────────────────
  // Handler: Form Submission
  // ───────────────────────────────────────────────────────────────────────────
  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(""); // Reset previous error
      setSuccess("");
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Username: username,
            Email: email,
            Password: password,
          }),
        });

        if (!response.ok) {
          let errText = "";

          try {
            const payload = (await response.json()) as ErrorResponse;
            if (Array.isArray(payload.errors)) {
              errText = payload.errors.join("; ");
            } else {
              errText =
                payload.detail ??
                payload.title ??
                JSON.stringify(payload, null, 2);
            }
          } catch {
            // fallback to plain text (or HTML)
            try {
              errText = await response.text();
            } catch {
              errText = "Unknown error";
            }
          }

          console.error("Register error response:", errText);
          setError(
            errText || "Registration failed. Please check your details."
          );
          return;
        }

        const message = await response.text();

        setSuccess(message || "Registration successful!");
        onRegister(message || "");

        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } catch (err) {
        console.error("Registration error:", err);
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [username, email, password, onRegister, navigate]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Render: Registration Form UI
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}

        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <label className="block mb-4">
          <span className="block text-sm font-medium mb-1">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
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
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200"
        >
          {isLoading ? "Registering…" : "Register"}
        </button>

        {/* Link to navigate to login page */}
        <p className="text-center mt-4">
          <Link to="/login" className="text-blue-500 underline">
            Already have an account? Login here.
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
