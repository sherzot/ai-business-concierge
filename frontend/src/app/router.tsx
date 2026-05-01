import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedLayout } from "../features/auth/components/ProtectedLayout";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SetupAccountPage } from "../features/auth/pages/SetupAccountPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    // Email invite link bu yerga keltiradi — yangi xodim parol + telefon + DOB kiritadi
    path: "/setup-account",
    element: <SetupAccountPage />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
