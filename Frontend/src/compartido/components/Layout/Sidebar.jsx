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
  User as UserIcon
} from "lucide-react";
import logoPronavid from "../../../images/Logopronavid.png";
import { servicioAutenticacion } from "../../../features/autenticacion/autenticacion.service";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await servicioAutenticacion.logout();
    navigate("/login");
  };

  let idRol = null;
  let nombreUsuario = "Usuario";
  let correoUsuario = "";
  try {
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (user) {
        nombreUsuario = user.primer_nombre ? `${user.primer_nombre} ${user.primer_apellido || ''}` : "Usuario";
        correoUsuario = user.correo || (user.id_rol === 1 ? "Administrador" : "Asesor");
        idRol = user.id_rol;
    }
  } catch (e) { }

  const adminMenuItems = [
    { name: "Dashboard", path: "/DashboardAdmin", icon: LayoutDashboard },
    { name: "Catálogo", path: "/Catalogo", icon: ShoppingBag },
    { name: "Clientes", path: "/clientes", icon: Users },
    { name: "Crear Pedido", path: "/Pedidos", icon: Package },
    { name: "Pedidos", path: "/seguimiento-admin", icon: TrendingUp },
    { name: "Métricas", path: "/DashboardAdmin?tab=graficos", icon: BarChart3 },
    { name: "Historial", path: "/DashboardAdmin?tab=historial", icon: ClipboardList },
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
    <aside className="w-64 flex-shrink-0 bg-[var(--color-card)] border-r border-[var(--color-border)] flex flex-col h-screen shadow-sm z-20">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center px-4 pt-4">
        <div className="flex items-center justify-center w-full">
          <img src={logoPronavid} alt="Logo" className="h-10 object-contain" />
        </div>
      </div>

      {/* Profile Area (Adaptado de la referencia) */}
      <div className="flex flex-col items-center justify-center pt-8 pb-6 border-b border-[var(--color-border)]">
        <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
          <UserIcon size={40} />
        </div>
        <h2 className="text-lg font-bold text-[var(--color-text-main)] tracking-wide uppercase">{nombreUsuario}</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{correoUsuario}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="flex flex-col gap-5 px-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-5 mx-1 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white font-semibold shadow-md shadow-red-500/30 scale-[1.02]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-glass)] hover:scale-[1.02]"
                  }`}
                >
                  <div className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-red-50"
                  }`}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="tracking-wide text-[15px]">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <div className="p-2 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-red-100 transition-colors">
            <LogOut size={20} strokeWidth={2} />
          </div>
          <span className="tracking-wide font-medium text-[15px]">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
