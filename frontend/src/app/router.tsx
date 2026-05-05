import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedLayout } from "../features/auth/components/ProtectedLayout";
import { RequireAuth } from "../features/auth/components/RequireAuth";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SetupAccountPage } from "../features/auth/pages/SetupAccountPage";
import { LandingPage } from "../features/landing/pages/LandingPage";
import { ContactPage } from "../features/landing/pages/ContactPage";
import { AdminContactsPage } from "../features/admin/pages/AdminContactsPage";

export const router = createBrowserRouter([
  { path: "/",              element: <LandingPage /> },
  { path: "/contact",       element: <ContactPage /> },
  { path: "/login",         element: <LoginPage /> },
  { path: "/setup-account", element: <SetupAccountPage /> },
  { path: "/app",           element: <ProtectedLayout /> },
  {
    path: "/admin/contacts",
    element: (
      <RequireAuth>
        <AdminContactsPage />
      </RequireAuth>
    ),
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
