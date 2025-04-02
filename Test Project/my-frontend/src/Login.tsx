import { useState } from "react";

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5294/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: username, Password: password }),
      });

      if (!response.ok) {
        setError("Login failed. Please check your credentials.");
        return;
      }

      const data = await response.json();
      const token = data.token;
      onLogin(token);
      // Optionally, store the token for persistence:
      localStorage.setItem("authToken", token);
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin}>
        <label className="block mb-2">
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-1 w-full"
            placeholder="Enter your username"
          />
        </label>
        <label className="block mb-2">
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-1 w-full"
            placeholder="Enter your password"
          />
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
