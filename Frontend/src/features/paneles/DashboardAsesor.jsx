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
    Sparkles, 
    BadgeCheck
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

                // Obtener los 5 pedidos más recientes
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
            label: "Clientes Activos", 
            count: metricas.clientes, 
            sub: "Registrados en sistema",
            icon: <Users size={26} />, 
            iconBg: "bg-blue-50 text-blue-600 border border-blue-100"
        },
        { 
            label: "Pedidos Registrados", 
            count: metricas.pedidos, 
            sub: "Total de ventas emitidas",
            icon: <Package size={26} />, 
            iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100"
        },
        { 
            label: "Cotizaciones Creadas", 
            count: metricas.cotizaciones, 
            sub: "Cotizaciones en proceso",
            icon: <FileText size={26} />, 
            iconBg: "bg-amber-50 text-amber-600 border border-amber-100"
        },
    ];

    const ACCIONES_RAPIDAS = [
        {
            title: "Crear Nuevo Pedido",
            desc: "Registrar venta para un cliente",
            path: "/Pedidos",
            icon: <PlusCircle size={24} />,
            color: "text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white"
        },
        {
            title: "Mis Clientes",
            desc: "Directorio y registro",
            path: "/clientes",
            icon: <Users size={24} />,
            color: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white"
        },
        {
            title: "Seguimiento Pedidos",
            desc: "Estado de despachos",
            path: "/seguimiento",
            icon: <TrendingUp size={24} />,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white"
        },
        {
            title: "Cotizaciones",
            desc: "Historial de ofertas",
            path: "/cotizaciones",
            icon: <FileSpreadsheet size={24} />,
            color: "text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-600 hover:text-white"
        },
        {
            title: "Catálogo",
            desc: "Consulta de productos",
            path: "/Catalogo",
            icon: <ShoppingCart size={24} />,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-600 hover:text-white"
        }
    ];

    return (
        <div className="fade-in pb-8 max-w-[1400px] mx-auto px-2 sm:px-6">
            
            {/* Banner de Bienvenida Asesor */}
            <div className="p-6 sm:p-8 my-4 sm:my-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-500/5 to-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0">
                        <Sparkles size={30} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                                {getSaludo()}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <BadgeCheck size={14} className="text-blue-500" /> Asesor Comercial
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {usuario.primer_nombre} {usuario.primer_apellido}
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-slate-500 font-medium">
                            Bienvenido a tu panel de control. Gestiona tus operaciones diarias con facilidad.
                        </p>
                    </div>
                </div>

                {/* Date Widget */}
                <div className="bg-slate-50/80 px-4 py-3 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-3 relative z-10 w-full md:w-auto">
                    <div className="p-2 bg-white rounded-xl text-slate-600 shadow-xs">
                        <Calendar size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hoy es</span>
                        <span className="text-sm font-bold text-slate-800 capitalize">
                            {new Date().toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                </div>
            </div>

            {cargando ? (
                <div className="seg-loading my-12" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loader"></div>
                    <p className="mt-4 text-slate-500 font-semibold text-sm">Cargando métricas de tu gestión...</p>
                </div>
            ) : (
                <>
                    {/* Tarjetas de Estadísticas Principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {STATS.map(s => (
                            <div 
                                key={s.label} 
                                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${s.iconBg}`}>
                                        {s.icon}
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{s.count}</p>
                                        <p className="text-sm font-bold text-slate-700">{s.label}</p>
                                        <p className="text-xs text-slate-400 font-medium">{s.sub}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                                <Zap size={20} className="fill-amber-500/20" />
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Acciones Rápidas</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {ACCIONES_RAPIDAS.map((acc, i) => (
                                <Link 
                                    key={i} 
                                    to={acc.path}
                                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all duration-300 flex flex-col justify-between group"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${acc.color}`}>
                                        {acc.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-[var(--color-primary)] transition-colors flex items-center justify-between">
                                            {acc.title}
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">{acc.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Actividad Reciente */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-red-50 text-[var(--color-primary)] border border-red-100">
                                    <Activity size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pedidos Recientes</h2>
                                    <p className="text-xs text-slate-400 font-medium">Últimas transacciones registradas en la plataforma</p>
                                </div>
                            </div>
                            <Link 
                                to="/seguimiento" 
                                className="text-sm font-bold text-[var(--color-primary)] hover:text-red-700 flex items-center gap-1.5 transition-colors group"
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
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-colors"
                                >
                                    <PlusCircle size={16} /> Crear primer pedido
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recientes.map((pedido, i) => (
                                    <div 
                                        key={pedido.id_pedido || i} 
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-100/80 hover:border-slate-300/80 transition-all duration-200 gap-3"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[var(--color-primary)] shadow-2xs flex-shrink-0">
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

