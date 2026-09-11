import React from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)] font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
