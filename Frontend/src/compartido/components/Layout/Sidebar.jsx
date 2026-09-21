import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  BarChart3, 
  ClipboardList, 
  FileText, 
  UserPlus,
  LogOut,
  User as UserIcon,
  Pencil,
  X
} from "lucide-react";
import logoPronavid from "../../../images/Logopronavid.png";
import { servicioAutenticacion } from "../../../features/autenticacion/autenticacion.service";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    await servicioAutenticacion.logout();
    navigate("/login");
  };

  let idRol = null;
  let nombreUsuario = "Usuario";
  let correoUsuario = "";
  try {
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (user) {
        idRol = Number(user.id_rol);
        nombreUsuario = user.primer_nombre ? `${user.primer_nombre} ${user.primer_apellido || ''}` : "Usuario";
        correoUsuario = user.correo || (idRol === 1 ? "Administrador" : "Asesor");
    }
  } catch (e) { }

  const adminMenuItems = [
    { name: "Dashboard", path: "/DashboardAdmin", icon: LayoutDashboard },
    { name: "Catálogo", path: "/Catalogo", icon: ShoppingBag },
    { name: "Clientes", path: "/clientes", icon: Users },
    { name: "Crear Pedido", path: "/Pedidos", icon: Package },
    { name: "Pedidos", path: "/seguimiento-admin", icon: TrendingUp },
    { name: "Historial", path: "/Historial", icon: ClipboardList },
    { name: "Cotizaciones", path: "/cotizaciones", icon: FileText },
    { name: "Empleados", path: "/empleados", icon: UserPlus },
  ];

  const asesorMenuItems = [
    { name: "Dashboard", path: "/DashboardAsesor", icon: LayoutDashboard },
    { name: "Clientes", path: "/clientes", icon: Users },
    { name: "Crear Pedido", path: "/Pedidos", icon: Package },
    { name: "Pedidos", path: "/seguimiento", icon: TrendingUp },
    { name: "Cotizaciones", path: "/cotizaciones", icon: FileText },
  ];

  const menuItems = (idRol === 1 || idRol === 3) ? adminMenuItems : asesorMenuItems;

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col h-screen shadow-lg transition-transform duration-300 ease-in-out lg:static lg:z-20 lg:translate-x-0 ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    }`}>
      {/* Header Logo Area con botón de cierre para móvil */}
      <div className="h-20 flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100 lg:border-b-0">
        <div className="flex items-center justify-center w-full">
          <img src={logoPronavid} alt="Logo Pronavid" className="h-12 object-contain" />
        </div>
        {/* Botón cerrar para celulares */}
        <button 
          onClick={onClose} 
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Cerrar menú"
        >
          <X size={24} />
        </button>
      </div>

      {/* Profile Area */}
      <Link 
        to="/perfil" 
        onClick={onClose}
        className="group flex flex-col items-center justify-center pt-4 pb-4 border-b border-gray-100 hover:bg-red-50 transition-colors cursor-pointer relative"
        title="Editar Perfil"
      >
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mb-2 lg:mb-4 shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-300">
          <UserIcon size={36} />
        </div>
        <h2 className="text-[15px] lg:text-[16px] font-bold text-gray-800 tracking-wide uppercase text-center leading-tight px-2 group-hover:text-[var(--color-primary)] transition-colors">
          {nombreUsuario}
        </h2>
        <p className="text-[12px] lg:text-[13px] text-gray-500 mt-1">{correoUsuario}</p>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-primary)]">
          <Pencil size={16} />
        </div>
      </Link>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 lg:py-6 overflow-y-auto">
        <ul className="flex flex-col gap-4 lg:gap-7 px-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-4 px-4 py-3 lg:py-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white font-bold shadow-md shadow-red-500/30 scale-[1.02]"
                      : "text-gray-600 hover:text-[var(--color-primary)] hover:bg-red-50 hover:scale-[1.02] font-semibold"
                  }`}
                >
                  <div className={`flex items-center justify-center transition-colors ${
                    isActive ? "text-white" : "text-gray-500 group-hover:text-[var(--color-primary)]"
                  }`}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="tracking-wide text-[15px] lg:text-[16px]">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center justify-center gap-3 px-4 py-3 lg:py-4 rounded-xl transition-all duration-300 bg-red-50 text-red-600 hover:bg-[var(--color-primary)] hover:text-white hover:shadow-lg hover:shadow-red-500/30 font-bold border border-red-100 hover:border-transparent"
        >
          <div className="flex items-center justify-center transition-transform duration-300 group-hover:-translate-x-1">
            <LogOut size={22} strokeWidth={2.5} />
          </div>
          <span className="tracking-wide text-[15px] lg:text-[16px]">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
