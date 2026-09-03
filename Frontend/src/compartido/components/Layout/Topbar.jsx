import React from "react";
import { Menu } from "lucide-react";
export default function Topbar() {
  return (
    <header className="h-16 w-full bg-[var(--color-card)] shadow-sm flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700 transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Right side (empty) */}
      <div className="flex items-center gap-6">
      </div>
    </header>
  );
}
