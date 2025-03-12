
import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";
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

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const isAuthenticated = user !== null;

  // If still loading after 5 seconds, show the content anyway
  // This prevents getting stuck in an infinite loading state
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
        console.log("Auth loading timed out - showing content anyway");
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !loadingTimeout) {
    return <Loading />;
  }

  // Skip authentication check if we timed out
  if (!isAuthenticated && !loadingTimeout) {
    return <Navigate to="/auth" />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/productions",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Productions />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/equipment",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Equipment />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/clients",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Clients />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/team",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Team />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Reports />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Profile />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/edits",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loading />}>
          <Edits />
        </Suspense>
      </ProtectedRoute>
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
