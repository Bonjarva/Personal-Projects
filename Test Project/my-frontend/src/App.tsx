// ─────────────────────────────────────────────────────────────────────────────
// External dependencies
// ─────────────────────────────────────────────────────────────────────────────
import { ReactNode, useCallback, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
import "./App.css";

// ─────────────────────────────────────────────────────────────────────────────
// Components / Pages
// ─────────────────────────────────────────────────────────────────────────────
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import TasksPage from "./TasksPage";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Config
// ─────────────────────────────────────────────────────────────────────────────
// Centralize your API URL in one constant, makes it easier to manage
const API_URL = import.meta.env.VITE_API_URL ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// App Component
// ─────────────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  // ───────────────────────────────────────────────────────────────────────────
  // State: Authentication
  // ───────────────────────────────────────────────────────────────────────────
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Handlers: Authentication Events
  // ───────────────────────────────────────────────────────────────────────────
  const handleLogin = useCallback((newToken: string) => {
    setToken(newToken);
    localStorage.setItem("authToken", newToken);
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("authToken");
  }, []);

  const handleRegister = useCallback((message: string) => {
    alert(message);
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Guard: Protect routes that require authentication
  // ───────────────────────────────────────────────────────────────────────────
  const RequireAuth = ({ children }: { children: ReactNode }) =>
    token ? <>{children}</> : <Navigate to="/login" replace />;

  // ───────────────────────────────────────────────────────────────────────────
  // Routes Definition
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
      <Route
        path="/register"
        element={<RegisterForm onRegister={handleRegister} />}
      />

      {/* Protected route: tasks */}
      <Route
        path="/tasks"
        element={
          <RequireAuth>
            <TasksPage
              token={token!}
              apiUrl={API_URL}
              onLogout={handleLogout}
            />
          </RequireAuth>
        }
      />

      {/* Fallback: send to tasks if logged in, otherwise login */}
      <Route
        path="*"
        element={<Navigate to={token ? "/tasks" : "/login"} replace />}
      />
    </Routes>
  );
};

export default App;
