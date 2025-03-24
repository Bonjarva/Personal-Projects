import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch data from your backend
    fetch("http://localhost:5000/")
      .then((response) => response.text())
      .then((data) => {
        setMessage(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Frontend App</h1>
      <p className="text-lg text-gray-700">
        {message || "Loading message from backend..."}
      </p>
    </div>
  );
}

export default App;
