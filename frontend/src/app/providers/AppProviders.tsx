import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "../router";
import { I18nProvider } from "./I18nProvider";

export function AppProviders() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  );
}
