import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./placeholder").then((m) => ({ default: m.Home })));

function Fallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-bg-page text-text-muted">
      Memuat…
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Fallback />}>
        <Home />
      </Suspense>
    ),
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
