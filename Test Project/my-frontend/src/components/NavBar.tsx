// src/components/NavBar.tsx
import { useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";

interface NavBarProps {
  token: string | null;
  onLogout: () => void;
}

export default function NavBar({ token, onLogout }: NavBarProps) {
  const linkClasses = (isActive: boolean) =>
    `px-4 py-2 rounded transition-colors ${
      isActive
        ? "bg-blue-700 text-white"
        : "bg-transparent text-gray-900 hover:bg-gray-100"
    }`;

  const qc = useQueryClient();

  const handleLogout = () => {
    onLogout(); // clears your authToken
    qc.clear(); // wipes all cached queries
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <NavLink to="/" className="text-2xl font-extrabold text-blue-600">
          My Tasks
        </NavLink>

        {/* Links */}
        <div className="space-x-2">
          <NavLink to="/" className={({ isActive }) => linkClasses(isActive)}>
            Home
          </NavLink>

          {token ? (
            <>
              <NavLink
                to="/tasks"
                className={({ isActive }) => linkClasses(isActive)}
              >
                Tasks
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => linkClasses(isActive)}
              >
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded transition-colors bg-transparent text-red-500 hover:bg-red-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => linkClasses(isActive)}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => linkClasses(isActive)}
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
