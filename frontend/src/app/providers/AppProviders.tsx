import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "../router";
import { I18nProvider } from "./I18nProvider";
import { AuthProvider } from "../../features/auth/context/AuthContext";

export function AppProviders() {
  return (
    <I18nProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nProvider>
  );
}
