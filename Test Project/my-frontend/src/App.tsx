import "./App.css";
import { useState, useEffect } from "react";

interface TaskItem {
  id: number;
  title: string;
  isCompleted: boolean;
}

// A simple login form component
function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
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
      if (response.ok) {
        const data = await response.json();
        onLogin(data.token);
        localStorage.setItem("authToken", data.token);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleLogin}
        className="p-4 max-w-md mx-auto border rounded shadow"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <label className="block mb-2">
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-1 w-full mt-1"
            placeholder="Enter your username"
          />
        </label>
        <label className="block mb-4">
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-1 w-full mt-1"
            placeholder="Enter your password"
          />
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5294/tasks", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setTasks(data))
        .catch((err) => console.error("Error fetching tasks:", err));
    }
  }, [token]);

  const addTask = async () => {
    if (!newTaskTitle.trim() || !token) return;
    const task = { title: newTaskTitle, isCompleted: false };

    const response = await fetch("http://localhost:5294/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setNewTaskTitle("");
    }
  };

  const deleteTask = async (id: number) => {
    if (!token) return;
    const response = await fetch(`http://localhost:5294/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  const startEditing = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  };

  const updateTask = async (id: number) => {
    if (!token) return;
    const updatedTask = { title: editingTaskTitle, isCompleted: false };
    const response = await fetch(`http://localhost:5294/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTask),
    });
    if (response.ok) {
      // If the response status is 204 No Content, update locally:
      if (response.status === 204) {
        setTasks(
          tasks.map((task) =>
            task.id === id ? { ...task, title: editingTaskTitle } : task
          )
        );
      } else {
        // If response contains content, parse the JSON
        const updatedTaskData = await response.json();
        setTasks(
          tasks.map((task) => (task.id === id ? updatedTaskData : task))
        );
      }
      setEditingTaskId(null);
      setEditingTaskTitle("");
    } else {
      console.error("Failed to update task", response.status);
    }
  };

  // If no token, show the login form
  if (!token) {
    return <LoginForm onLogin={setToken} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Tasks</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="mb-2 flex items-center">
            {editingTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTaskTitle}
                  onChange={(e) => setEditingTaskTitle(e.target.value)}
                  className="border p-1 mr-2"
                />
                <button
                  onClick={() => updateTask(task.id)}
                  className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditing}
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="mr-4">
                  {task.title} {task.isCompleted ? "(Completed)" : ""}
                </span>
                <button
                  onClick={() => startEditing(task)}
                  className="bg-yellow-500 text-white px-2 py-1 mr-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New Task"
          className="border p-2 mr-2"
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </div>
    </div>
  );
}

export default App;
