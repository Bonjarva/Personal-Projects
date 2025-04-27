// ─────────────────────────────────────────────────────────────────────────────
// External dependencies
// ─────────────────────────────────────────────────────────────────────────────
import { ReactNode, useCallback, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Components / Pages
// ─────────────────────────────────────────────────────────────────────────────
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/TasksPage";
import AboutPage from "./pages/AboutPage";
import DocsPage from "./pages/DocsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ContactPage from "./pages/ContactPage";

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
    <div className="flex flex-col min-h-screen">
      <NavBar token={token} onLogout={handleLogout} />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route
            path="/register"
            element={<RegisterPage onRegister={handleRegister} />}
          />
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
          <Route
            path="*"
            element={<Navigate to={token ? "/tasks" : "/"} replace />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
