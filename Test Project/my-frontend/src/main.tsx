// ─────────────────────────────────────────────────────────────────────────────
// External Dependencies
// ─────────────────────────────────────────────────────────────────────────────
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

const queryClient = new QueryClient();

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="container mx-auto px-4">
          <App />
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
