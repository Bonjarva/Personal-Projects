// src/components/NavBar.tsx
import { Link } from "react-router-dom";

interface NavBarProps {
  token: string | null;
  onLogout: () => void;
}

export default function NavBar({ token, onLogout }: NavBarProps) {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-extrabold text-blue-600">
          My Tasks
        </Link>

        {/* Links */}
        <div className="space-x-4">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded-md transition"
          >
            Home
          </Link>

          {token ? (
            <>
              <Link
                to="/tasks"
                className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded-md transition"
              >
                Tasks
              </Link>
              <button
                onClick={onLogout}
                className="text-red-500 hover:text-red-700 px-3 py-1 rounded-md transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded-md transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-blue-600 px-3 py-1 rounded-md transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
