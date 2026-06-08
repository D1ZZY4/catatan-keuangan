import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { AuthProvider } from "./app/AuthContext";
import { AppDataProvider } from "./app/AppDataContext";
import { ToastProvider } from "./shared/hooks/useToast";
import { CalculatorProvider } from "./app/CalculatorContext";
import "./styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") document.documentElement.classList.add("dark");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ToastProvider>
      <CalculatorProvider>
        <AuthProvider>
          <AppDataProvider>
            <RouterProvider router={router} />
          </AppDataProvider>
        </AuthProvider>
      </CalculatorProvider>
    </ToastProvider>
  </React.StrictMode>,
);
