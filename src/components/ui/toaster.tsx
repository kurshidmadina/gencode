"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      toastOptions={{
        style: {
          border: "1px solid rgba(148, 163, 184, 0.22)",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.96))",
          color: "#f8fafc",
          boxShadow: "0 18px 70px rgba(0,0,0,0.42), 0 0 34px rgba(96,243,255,0.12)"
        }
      }}
    />
  );
}
