// ─────────────────────────────────────────────────────────────────────────────
// External Dependencies
// ─────────────────────────────────────────────────────────────────────────────
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Internal Modules & Styles
// ─────────────────────────────────────────────────────────────────────────────
import App from "./App";
import "./index.css";

// ─────────────────────────────────────────────────────────────────────────────
// Initialize and Render Application
// ─────────────────────────────────────────────────────────────────────────────
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element ("#root") not found in HTML');
}

createRoot(rootElement).render(
  <StrictMode>
    {/* BrowserRouter provides routing context for the entire app */}
    <BrowserRouter>
      <div className="container mx-auto px-4">
        <App />
      </div>
    </BrowserRouter>
  </StrictMode>
);
