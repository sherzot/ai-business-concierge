import React from "react";

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-6 text-rose-600">
      {message ?? "Xatolik yuz berdi."}
    </div>
  );
}
