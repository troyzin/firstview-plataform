import React from "react";
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import Loading from "./components/Loading";

// Import the Dashboard component directly to avoid lazy loading problems
import Dashboard from "./pages/Index";

// Lazy load other components
const Productions = lazy(() => import("./pages/Productions"));
const Equipment = lazy(() => import("./pages/Equipment"));
const Clients = lazy(() => import("./pages/Clients"));
const Team = lazy(() => import("./pages/Team"));
const Reports = lazy(() => import("./pages/Reports"));
const Profile = lazy(() => import("./pages/Profile"));
const Edits = lazy(() => import("./pages/Edits"));

const router = createHashRouter([
  {
    path: "/",
    element: <Dashboard />,
    errorElement: <NotFound />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/productions",
    element: (
      <Suspense fallback={<Loading />}>
        <Productions />
      </Suspense>
    ),
  },
  {
    path: "/equipment",
    element: (
      <Suspense fallback={<Loading />}>
        <Equipment />
      </Suspense>
    ),
  },
  {
    path: "/clients",
    element: (
      <Suspense fallback={<Loading />}>
        <Clients />
      </Suspense>
    ),
  },
  {
    path: "/team",
    element: (
      <Suspense fallback={<Loading />}>
        <Team />
      </Suspense>
    ),
  },
  {
    path: "/reports",
    element: (
      <Suspense fallback={<Loading />}>
        <Reports />
      </Suspense>
    ),
  },
  {
    path: "/profile",
    element: (
      <Suspense fallback={<Loading />}>
        <Profile />
      </Suspense>
    ),
  },
  {
    path: "/edits",
    element: (
      <Suspense fallback={<Loading />}>
        <Edits />
      </Suspense>
    ),
  },
]);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;