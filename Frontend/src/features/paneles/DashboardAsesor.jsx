import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
    Package, 
    Users, 
    TrendingUp, 
    FileText, 
    Activity, 
    Clock, 
    ArrowRight, 
    PlusCircle, 
    ShoppingCart, 
    FileSpreadsheet, 
    Zap, 
    ChevronRight, 
    Calendar, 
    BadgeCheck,
    Briefcase
} from "lucide-react";
import { api } from "../../config/api";
import "./panel.css";
import PiePanel from "./PiePanel";

export default function DashboardAsesor() {
    const [usuario, setUsuario] = useState(null);
    const [metricas, setMetricas] = useState({ clientes: 0, pedidos: 0, cotizaciones: 0 });
    const [recientes, setRecientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userRaw = localStorage.getItem("usuario");
        if (!userRaw) {
            navigate("/login");
            return;
        }

        try {
            const user = JSON.parse(userRaw);
            if (Number(user.id_rol) !== 2) {
                navigate("/DashboardAdmin");
                return;
            }
            setUsuario(user);
        } catch (e) {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const cargarMetricas = async () => {
            if (!usuario) return;
            try {
                setCargando(true);
                const [resClientes, resPedidos, resCotizaciones] = await Promise.all([
                    api.get("/clientes").catch(() => []),
                    api.get("/pedidos?limite=100").catch(() => ({ pedidos: [] })),
                    api.get("/cotizaciones").catch(() => ({ cotizaciones: [] }))
                ]);
                
                const clientesArray = Array.isArray(resClientes) ? resClientes : (resClientes?.clientes || []);
                const pedidosArray = Array.isArray(resPedidos) ? resPedidos : (resPedidos?.pedidos || []);
                const cotizacionesArray = Array.isArray(resCotizaciones) ? resCotizaciones : (resCotizaciones?.cotizaciones || []);

                setMetricas({
                    clientes: clientesArray.length,
                    pedidos: resPedidos?.total ?? pedidosArray.length,
                    cotizaciones: resCotizaciones?.total ?? cotizacionesArray.length
                });

                setRecientes(pedidosArray.slice(0, 5));
            } catch (err) {
                console.error("Error cargando métricas:", err);
            } finally {
                setCargando(false);
            }
        };
        cargarMetricas();
    }, [usuario]);

    const getSaludo = () => {
        const hora = new Date().getHours();
        if (hora < 12) return "Buenos días";
        if (hora < 18) return "Buenas tardes";
        return "Buenas noches";
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    };

    const getEstadoClass = (estado) => {
        const lower = (estado || "").toLowerCase();
        if (lower.includes("entregado") || lower.includes("completado")) return "badge-estado-pedido entregado";
        if (lower.includes("proceso") || lower.includes("transito") || lower.includes("tránsito")) return "badge-estado-pedido en-proceso";
        if (lower.includes("recibido") || lower.includes("registrado")) return "badge-estado-pedido recibido";
        if (lower.includes("cancelado")) return "badge-estado-pedido cancelado";
        return "badge-estado-pedido pendiente";
    };

    if (!usuario) return null;

    const STATS = [
        { 
            label: "Clientes Registrados", 
            count: metricas.clientes, 
            sub: "Base de datos activa",
            icon: <Users size={24} />, 
            color: "#3B82F6",
            bgColor: "rgba(59, 130, 246, 0.1)",
            badge: "+ Activos",
            badgeClass: "bg-blue-50 text-blue-700 border-blue-200"
        },
        { 
            label: "Pedidos Realizados", 
            count: metricas.pedidos, 
            sub: "Ventas y órdenes emitidas",
            icon: <Package size={24} />, 
            color: "#10B981",
            bgColor: "rgba(16, 185, 129, 0.1)",
            badge: "Comercial",
            badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
        },
        { 
            label: "Cotizaciones Emitidas", 
            count: metricas.cotizaciones, 
            sub: "Propuestas enviadas",
            icon: <FileText size={24} />, 
            color: "#F59E0B",
            bgColor: "rgba(245, 158, 11, 0.1)",
            badge: "En gestión",
            badgeClass: "bg-amber-50 text-amber-700 border-amber-200"
        },
        { 
            label: "Efectividad Comercial", 
            count: `${metricas.pedidos > 0 ? Math.round((metricas.pedidos / (metricas.pedidos + metricas.cotizaciones || 1)) * 100) : 100}%`, 
            sub: "Ratio de conversión",
            icon: <TrendingUp size={24} />, 
            color: "#C0392B",
            bgColor: "rgba(192, 57, 43, 0.1)",
            badge: "Rendimiento",
            badgeClass: "bg-red-50 text-red-700 border-red-200"
        },
    ];

    const ACCIONES_COMPLEMENTARIAS = [
        {
            title: "Directorio de Clientes",
            desc: "Gestionar y registrar información de clientes",
            path: "/clientes",
            icon: <Users size={22} className="text-blue-600" />,
            bgColor: "bg-blue-50/80"
        },
        {
            title: "Seguimiento de Pedidos",
            desc: "Consultar estado de despachos y entregas",
            path: "/seguimiento",
            icon: <TrendingUp size={22} className="text-emerald-600" />,
            bgColor: "bg-emerald-50/80"
        },
        {
            title: "Historial de Cotizaciones",
            desc: "Revisar y emitir nuevas cotizaciones",
            path: "/cotizaciones",
            icon: <FileSpreadsheet size={22} className="text-amber-600" />,
            bgColor: "bg-amber-50/80"
        },
        {
            title: "Catálogo de Productos",
            desc: "Ver precios, stock e imágenes de productos",
            path: "/Catalogo",
            icon: <Package size={22} className="text-purple-600" />,
            bgColor: "bg-purple-50/80"
        }
    ];

    return (
        <div className="fade-in pb-10 max-w-[1400px] mx-auto px-3 sm:px-6">
            
            {/* Encabezado Principal PRONAVID */}
            <div className="p-6 sm:p-8 my-4 sm:my-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#C0392B] to-[#E74C3C] text-white flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0">
                        <Briefcase size={30} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#C0392B] uppercase tracking-wider bg-red-50 px-3 py-0.5 rounded-full border border-red-100">
                                {getSaludo()}
                            </span>
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                <BadgeCheck size={14} className="text-blue-500" /> Asesor Comercial
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            {usuario.primer_nombre} {usuario.primer_apellido}
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-500 font-medium">
                            Bienvenido al portal comercial PRONAVID. Aquí puedes gestionar clientes, pedidos y cotizaciones.
                        </p>
                    </div>
                </div>

                {/* Date Widget */}
                <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200/80 flex items-center gap-3.5 relative z-10 w-full md:w-auto">
                    <div className="p-2.5 bg-white rounded-xl text-[#C0392B] shadow-xs border border-slate-100">
                        <Calendar size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hoy es</span>
                        <span className="text-sm font-extrabold text-slate-800 capitalize">
                            {new Date().toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                </div>
            </div>

            {cargando ? (
                <div className="seg-loading my-12 flex flex-col items-center justify-center min-h-[260px]">
                    <div className="loader border-[var(--color-primary)] border-t-transparent"></div>
                    <p className="mt-4 text-slate-500 font-semibold text-sm">Sincronizando información comercial...</p>
                </div>
            ) : (
                <>
                    {/* Tarjetas de Métricas KPI en 4 columnas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {STATS.map(s => (
                            <div 
                                key={s.label} 
                                className="kpi-advisor-card flex flex-col justify-between group"
                                style={{ '--kpi-bg': s.bgColor, '--kpi-border': s.color }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div 
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                        style={{ background: s.bgColor, color: s.color }}
                                    >
                                        {s.icon}
                                    </div>
                                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${s.badgeClass}`}>
                                        {s.badge}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{s.count}</h3>
                                    <p className="text-sm font-bold text-slate-700">{s.label}</p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">{s.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Centro de Acciones Rápidas */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-xl bg-red-50 text-[#C0392B] border border-red-100">
                                <Zap size={20} />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Centro de Operaciones</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* Card Destacada - Crear Nuevo Pedido */}
                            <div className="lg:col-span-5 hero-action-card flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                                
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white mb-5 border border-white/20">
                                        <ShoppingCart size={28} />
                                    </div>
                                    <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full border border-white/20">
                                        Acción Principal
                                    </span>
                                    <h3 className="text-2xl font-black text-white mt-3 mb-2 tracking-tight">
                                        Crear Nuevo Pedido
                                    </h3>
                                    <p className="text-sm text-red-100 leading-relaxed font-medium">
                                        Registra una nueva venta directamente para tus clientes de forma rápida y sencilla.
                                    </p>
                                </div>

                                <Link 
                                    to="/Pedidos"
                                    className="mt-6 inline-flex items-center justify-center gap-2 bg-white text-[#C0392B] font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:bg-red-50 transition-all duration-200 group"
                                >
                                    <PlusCircle size={18} /> Iniciar Pedido Ahora
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {/* 4 Accesos Rápidos Secundarios */}
                            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ACCIONES_COMPLEMENTARIAS.map((acc, i) => (
                                    <Link 
                                        key={i} 
                                        to={acc.path}
                                        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl border border-slate-100 ${acc.bgColor}`}>
                                                {acc.icon}
                                            </div>
                                            <ChevronRight size={18} className="text-slate-300 group-hover:text-[#C0392B] group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-800 group-hover:text-[#C0392B] transition-colors">
                                                {acc.title}
                                            </h4>
                                            <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                                                {acc.desc}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actividad Reciente */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-red-50 text-[#C0392B] border border-red-100">
                                    <Activity size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pedidos Recientes</h2>
                                    <p className="text-xs text-slate-400 font-medium">Últimas transacciones registradas en el sistema</p>
                                </div>
                            </div>
                            <Link 
                                to="/seguimiento" 
                                className="text-sm font-bold text-[#C0392B] hover:text-red-700 flex items-center gap-1.5 transition-colors group"
                            >
                                Ver todos los pedidos 
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        
                        {recientes.length === 0 ? (
                            <div className="text-center py-12 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                                <Package size={44} className="text-slate-300 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-slate-700">Aún no hay pedidos registrados</h3>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">Comienza registrando un nuevo pedido para tus clientes.</p>
                                <Link 
                                    to="/Pedidos" 
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C0392B] text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-colors"
                                >
                                    <PlusCircle size={16} /> Crear primer pedido
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recientes.map((pedido, i) => (
                                    <div 
                                        key={pedido.id_pedido || i} 
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60 hover:bg-slate-100/80 hover:border-slate-300/80 transition-all duration-200 gap-3"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[#C0392B] shadow-2xs flex-shrink-0">
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-slate-900 text-base">Pedido #{pedido.id_pedido}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    Cliente: <span className="text-slate-700 font-semibold">{pedido.nombre_cliente || "Cliente s/n"}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                                            <span className={getEstadoClass(pedido.estado_pedido)}>
                                                {pedido.estado_pedido || "Sin estado"}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-xs text-slate-400 font-medium block">
                                                    {formatearFecha(pedido.fecha_pedido)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <PiePanel />
        </div>
    );
}

