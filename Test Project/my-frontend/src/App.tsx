import "./App.css";
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm"; // Import the loginForm component
import RegisterForm from "./RegisterForm"; // Import the RegistrationForm component

interface TaskItem {
  id: number;
  title: string;
  isCompleted: boolean;
}

function App() {
  // Retrieve token from localStorage if available
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );

  // Toggle for showing registration vs login form
  const [showRegister, setShowRegister] = useState(false);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  // Fetch tasks when token is available
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

  // NEW: Logout functionality
  // This function clears the auth token and resets the token state.
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove token from localStorage
    setToken(null); // Reset token state to null, which will trigger the login form to be shown
  };

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
      // Check if response has no content (204) or has updated task data
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

  const toggleCompletion = async (task: TaskItem) => {
    if (!token) return;
    // Create a new task object with the toggled isCompleted value
    const updatedTask = { title: task.title, isCompleted: !task.isCompleted };

    const response = await fetch(`http://localhost:5294/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
      // Update the task list locally
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
        )
      );
    } else {
      console.error("Failed to toggle task completion", response.status);
    }
  };

  // If no token, show the login form
  // If no token, conditionally render login or registration form
  if (!token) {
    return showRegister ? (
      <>
        <RegisterForm
          onRegister={(msg) => {
            // Optionally, display the message or automatically switch to login
            alert(msg);
            setShowRegister(false);
          }}
        />
        <div className="text-center mt-4">
          <button
            onClick={() => setShowRegister(false)}
            className="text-blue-500 underline"
          >
            Already have an account? Login here.
          </button>
        </div>
      </>
    ) : (
      <>
        <LoginForm onLogin={setToken} />
        <div className="text-center mt-4">
          <button
            onClick={() => setShowRegister(true)}
            className="text-blue-500 underline"
          >
            Don't have an account? Register here.
          </button>
        </div>
      </>
    );
  }

  // If authenticated, show the main task interface
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Logout button */}
      <div className="w-full flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
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
                {/* New: Toggle Completion Button */}
                <button
                  onClick={() => toggleCompletion(task)}
                  className="bg-blue-500 text-white px-2 py-1 mr-2 rounded"
                >
                  {task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
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
