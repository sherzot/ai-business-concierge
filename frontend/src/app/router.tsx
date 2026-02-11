import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedLayout } from "../features/auth/components/ProtectedLayout";
import { LoginPage } from "../features/auth/pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
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
