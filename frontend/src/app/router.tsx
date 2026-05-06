import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedLayout } from "../features/auth/components/ProtectedLayout";
import { RequireAuth } from "../features/auth/components/RequireAuth";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SetupAccountPage } from "../features/auth/pages/SetupAccountPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { LandingPage } from "../features/landing/pages/LandingPage";
import { ContactPage } from "../features/landing/pages/ContactPage";
import { RegisterCompanyPage } from "../features/landing/pages/RegisterCompanyPage";
import { AdminContactsPage } from "../features/admin/pages/AdminContactsPage";
import { AdminHealthPage } from "../features/admin/pages/AdminHealthPage";

export const router = createBrowserRouter([
  { path: "/",               element: <LandingPage /> },
  { path: "/contact",        element: <ContactPage /> },
  { path: "/register",       element: <RegisterCompanyPage /> },
  { path: "/login",          element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password",  element: <ResetPasswordPage /> },
  { path: "/setup-account",  element: <SetupAccountPage /> },
  { path: "/app",           element: <ProtectedLayout /> },
  {
    path: "/admin/contacts",
    element: (
      <RequireAuth>
        <AdminContactsPage />
      </RequireAuth>
    ),
  },
  {
    path: "/admin/health",
    element: (
      <RequireAuth>
        <AdminHealthPage />
      </RequireAuth>
    ),
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
