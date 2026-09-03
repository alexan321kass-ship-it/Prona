import React from "react";
import Sidebar from "./Sidebar";
import logoPronavid from "../../../images/Logopronavid.png";
import { useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  
  // Lista de rutas donde no se debe mostrar el banner rojo
  const hiddenBannerPaths = ['/catalogo', '/clientes', '/pedidos'];
  const showBanner = !hiddenBannerPaths.includes(path);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)] font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Banner Rojo Central (Oculto en ciertas vistas) */}
        {showBanner && (
          <div className="w-full bg-gradient-to-r from-[#C0392B] to-[#E74C3C] h-16 flex items-center justify-center shadow-[0_4px_20px_rgba(192,57,43,0.3)] shrink-0 z-10">
              <img src={logoPronavid} alt="Logo Pronavid" className="h-8 brightness-0 invert transition-transform hover:scale-105 duration-300" />
          </div>
        )}
        
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
