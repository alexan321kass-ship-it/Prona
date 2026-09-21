import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import logoPronavid from "../../../images/Logopronavid.png";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)] font-sans relative">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden w-full min-w-0">
        {/* Mobile Header / Topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-xs z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-700 hover:text-[var(--color-primary)] hover:bg-red-50 transition-colors focus:outline-none"
            aria-label="Abrir menú"
          >
            <Menu size={26} />
          </button>
          <img src={logoPronavid} alt="PRONAVID" className="h-9 object-contain" />
          <div className="w-8" /> {/* Spacer for visual balance */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
