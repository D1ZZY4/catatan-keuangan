import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

// Boot theme before first paint to avoid FOUC.
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") document.documentElement.classList.add("dark");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
