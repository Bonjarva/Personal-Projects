// ─────────────────────────────────────────────────────────────────────────────
// External Dependencies
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────
interface TaskItem {
  id: number;
  title: string;
  isCompleted: boolean;
}

interface TasksPageProps {
  token: string;
  apiUrl: string;
  onLogout: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// TasksPage Component
// ─────────────────────────────────────────────────────────────────────────────
export default function TasksPage({ token, apiUrl, onLogout }: TasksPageProps) {
  // ───────────────────────────────────────────────────────────────────────────
  // Router & Navigation Hook
  // ───────────────────────────────────────────────────────────────────────────
  const navigate = useNavigate();

  // ───────────────────────────────────────────────────────────────────────────
  // State: Task Data & Editing
  // ───────────────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // Effect: Load Tasks and Handle Auth
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // If no token at all, immediately kick back to login
    if (!token) {
      onLogout(); // clear auth
      navigate("/login", { replace: true });
      return;
    }

    const loadTasks = async () => {
      try {
        const res = await fetch(`${apiUrl}/tasks`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // If token expired/invalid, log out and redirect
        if (res.status === 401) {
          onLogout();
          navigate("/login", { replace: true });
          return;
        }

        const data: TaskItem[] = await res.json();
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    loadTasks();
  }, [token, apiUrl, onLogout, navigate]);

  // ───────────────────────────────────────────────────────────────────────────
  // Handlers: CRUD Operations
  // ───────────────────────────────────────────────────────────────────────────

  const addTask = useCallback(async () => {
    setError(null);
    if (!newTaskTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    const res = await fetch(`${apiUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTaskTitle, isCompleted: false }),
    });
    if (res.ok) {
      const created: TaskItem = await res.json();
      setTasks((prev) => [...prev, created]);
      setNewTaskTitle("");
    } else {
      try {
        const err = await res.json();
        setError(err.detail ?? err.title ?? "Failed to add task.");
      } catch {
        setError(`Server error ${res.status}`);
      }
    }
  }, [newTaskTitle, apiUrl, token]);

  const deleteTask = useCallback(
    async (id: number) => {
      setError(null);

      const res = await fetch(`${apiUrl}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        try {
          const err = await res.json();
          setError(
            err.detail ?? err.title ?? `Failed to delete task (${res.status})`
          );
        } catch {
          setError(`Server error ${res.status}`);
        }
      }
    },
    [apiUrl, token]
  );

  const startEditing = useCallback((task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  }, []);

  const updateTask = useCallback(
    async (id: number) => {
      setError(null);

      if (!editingTaskTitle.trim()) {
        setError("Task title cannot be empty.");
        return;
      }

      const updated = { title: editingTaskTitle, isCompleted: false };
      const res = await fetch(`${apiUrl}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        // Check if response has no content (204) or has updated task data
        if (res.status === 204) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, title: editingTaskTitle } : t
            )
          );
        } else {
          // If response contains content, parse the JSON
          const data: TaskItem = await res.json();
          setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
        }
        cancelEditing();
      } else {
        try {
          const err = await res.json();
          setError(
            err.detail ?? err.title ?? `Failed to update task (${res.status})`
          );
        } catch {
          setError(`Server error ${res.status}`);
        }
      }
    },
    [editingTaskTitle, apiUrl, token, cancelEditing]
  );

  const toggleCompletion = useCallback(
    async (task: TaskItem) => {
      setError(null);

      const updated = { title: task.title, isCompleted: !task.isCompleted };
      const res = await fetch(`${apiUrl}/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
          )
        );
      } else {
        try {
          const err = await res.json();
          setError(
            err.detail ?? err.title ?? `Failed to toggle task (${res.status})`
          );
        } catch {
          setError(`Server error ${res.status}`);
        }
      }
    },
    [apiUrl, token]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Render: UI
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-blue-600">Tasks</h1>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md"
            >
              {editingTaskId === task.id ? (
                // Edit Mode
                <>
                  <input
                    type="text"
                    value={editingTaskTitle}
                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md mr-2"
                  />
                  <button
                    onClick={() => updateTask(task.id)}
                    className="bg-green-500 text-white px-3 py-1 mr-2 rounded-md"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-500 text-white px-3 py-1 rounded-md"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                // View Mode
                <>
                  <span className="flex-1 mr-4 break-all">
                    {task.title} {task.isCompleted && "(Completed)"}
                  </span>
                  <button
                    onClick={() => startEditing(task)}
                    className="bg-yellow-500 text-white px-3 py-1 mr-2 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleCompletion(task)}
                    className="bg-blue-500 text-white px-3 py-1 mr-2 rounded-md"
                  >
                    {task.isCompleted ? "Undo" : "Complete"}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md"
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* New Task Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
          className="mt-6"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New Task"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
            >
              Add Task
            </button>
          </div>
          {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
}
