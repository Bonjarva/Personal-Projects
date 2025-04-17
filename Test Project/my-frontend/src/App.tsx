import "./App.css";
import { useState, useEffect, JSX } from "react";
import LoginForm from "./LoginForm"; // Import the loginForm component
import RegisterForm from "./RegisterForm"; // Import the RegistrationForm component
import TasksPage from "./TasksPage";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  // Retrieve token from localStorage if available
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );

  const API = import.meta.env.VITE_API_URL;

  // Fetch tasks when token is available
  useEffect(() => {
    if (token) {
      fetch(`${API}/tasks`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .catch((err) => console.error("Error fetching tasks:", err));
    }
  }, [token, API]);

  const RequireAuth = ({ children }: { children: JSX.Element }) =>
    token ? children : <Navigate to="/login" replace />;

  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/login"
        element={
          <LoginForm
            onLogin={(t) => {
              setToken(t);
              localStorage.setItem("authToken", t);
            }}
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterForm
            onRegister={(msg) => {
              alert(msg);
              // optionally navigate to /login after registration
            }}
          />
        }
      />

      {/* Protected tasks page */}

      <Route
        path="/tasks"
        element={
          <RequireAuth>
            <TasksPage
              token={token!}
              apiUrl={import.meta.env.VITE_API_URL}
              onLogout={() => {
                localStorage.removeItem("authToken");
                setToken(null);
              }}
            />
          </RequireAuth>
        }
      />

      {/* Fallback: redirect to /tasks if logged in, otherwise to /login */}
      <Route
        path="*"
        element={<Navigate to={token ? "/tasks" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
