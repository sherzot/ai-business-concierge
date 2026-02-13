import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "../router";
import { I18nProvider } from "./I18nProvider";
import { AuthProvider, useAuthContext } from "../../features/auth/context/AuthContext";
import { RealtimeAuthSync } from "./RealtimeAuthSync";

function AppWithRealtime() {
  const { session } = useAuthContext();
  return (
    <>
      <RealtimeAuthSync session={session} />
      <RouterProvider router={router} />
    </>
  );
}

export function AppProviders() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppWithRealtime />
      </AuthProvider>
    </I18nProvider>
  );
}
