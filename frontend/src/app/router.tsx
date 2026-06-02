import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedLayout } from "../features/auth/components/ProtectedLayout";
import { RequireAuth } from "../features/auth/components/RequireAuth";
import { RequireRole } from "../features/auth/components/RequireRole";
import { AdminLayout } from "../features/admin/components/AdminLayout";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SetupAccountPage } from "../features/auth/pages/SetupAccountPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { LandingPage } from "../features/landing/pages/LandingPage";
import { ContactPage } from "../features/landing/pages/ContactPage";
import { RegisterCompanyPage } from "../features/landing/pages/RegisterCompanyPage";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { AdminContactsPage } from "../features/admin/pages/AdminContactsPage";
import { AdminCompaniesPage } from "../features/admin/pages/AdminCompaniesPage";
import { AdminHealthPage } from "../features/admin/pages/AdminHealthPage";
import { AdminAIChatPage } from "../features/admin/pages/AdminAIChatPage";
import { AdminKnowledgeBasePage } from "../features/admin/pages/AdminKnowledgeBasePage";
import { AdminAuditPage } from "../features/admin/pages/AdminAuditPage";
import { AdminRiskPage } from "../features/admin/pages/AdminRiskPage";

export const router = createBrowserRouter([
  { path: "/",                element: <LandingPage /> },
  { path: "/contact",         element: <ContactPage /> },
  { path: "/register",        element: <RegisterCompanyPage /> },
  { path: "/login",           element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password",  element: <ResetPasswordPage /> },
  { path: "/setup-account",   element: <SetupAccountPage /> },
  { path: "/app",             element: <ProtectedLayout /> },

  {
    path: "/admin",
    element: (
      <RequireAuth>
        <RequireRole roles={["super_admin", "sub_admin"]}>
          <AdminLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true,           element: <AdminDashboardPage /> },
      { path: "contacts",      element: <AdminContactsPage /> },
      { path: "companies",     element: <AdminCompaniesPage /> },
      { path: "health",        element: <AdminHealthPage /> },
      { path: "ai-chat",        element: <AdminAIChatPage /> },
      { path: "knowledge-base", element: <AdminKnowledgeBasePage /> },
      { path: "audit",          element: <AdminAuditPage /> },
      { path: "risk", element: <AdminRiskPage /> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
