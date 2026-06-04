import React from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { router } from "../router";
import { I18nProvider } from "./I18nProvider";
import { AuthProvider, useAuthContext } from "../../features/auth/context/AuthContext";
import { RealtimeAuthSync } from "./RealtimeAuthSync";
import { TourProvider } from "../../shared/components/OnboardingTour";

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
    <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
      <I18nProvider>
        <AuthProvider>
          <TourProvider>
            <AppWithRealtime />
          </TourProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
