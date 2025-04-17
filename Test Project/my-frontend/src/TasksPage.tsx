import { useState, useEffect } from "react";

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

export default function TasksPage({ token, apiUrl, onLogout }: TasksPageProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  // Fetch tasks
  useEffect(() => {
    fetch(`${apiUrl}/tasks`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then(setTasks)
      .catch(console.error);
  }, [token, apiUrl]);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    const response = await fetch(`${apiUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTaskTitle, isCompleted: false }),
    });
    if (response.ok) {
      const created = await response.json();
      setTasks((t) => [...t, created]);
      setNewTaskTitle("");
    }
  };

  const deleteTask = async (id: number) => {
    if (!token) return;
    const response = await fetch(`${apiUrl}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  const updateTask = async (id: number) => {
    if (!token) return;
    const updatedTask = { title: editingTaskTitle, isCompleted: false };
    const response = await fetch(`${apiUrl}/tasks/${id}`, {
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

  const startEditing = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  };

  const toggleCompletion = async (task: TaskItem) => {
    if (!token) return;
    // Create a new task object with the toggled isCompleted value
    const updatedTask = { title: task.title, isCompleted: !task.isCompleted };

    const response = await fetch(`${apiUrl}/tasks/${task.id}`, {
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

        {/* List */}
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md"
            >
              {/* Task buttons */}
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

        {/* New task form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
          className="mt-6 flex space-x-2"
        >
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New Task"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}
