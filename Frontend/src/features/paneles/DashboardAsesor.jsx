import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, Users, TrendingUp, FileText, Activity, Clock, ArrowRight, Calendar, ChevronRight } from "lucide-react";
import { api } from "../../config/api";
import "./panel.css";
import "../reportes/reportes.css";
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

    const getBadgeStyle = (estado) => {
        const lower = (estado || "").toLowerCase();
        if (lower.includes("entregado") || lower.includes("completado")) {
            return { background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0" };
        }
        if (lower.includes("proceso") || lower.includes("transito") || lower.includes("tránsito")) {
            return { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" };
        }
        if (lower.includes("recibido") || lower.includes("registrado")) {
            return { background: "#FAF5FF", color: "#6D28D9", border: "1px solid #E9D5FF" };
        }
        if (lower.includes("cancelado")) {
            return { background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" };
        }
        return { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" };
    };

    const getIniciales = (nombre) => {
        if (!nombre) return "CL";
        const partes = nombre.trim().split(" ");
        if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
        return nombre.substring(0, 2).toUpperCase();
    };

    if (!usuario) return null;

    return (
        <div className="fade-in max-w-[1400px] mx-auto pb-10 px-3 sm:px-6 lg:px-8 w-full">
            {/* Banner Hero Moderno */}
            <div className="p-5 sm:p-8 lg:p-10 mb-6 sm:mb-8 bg-gradient-to-r from-white via-slate-50/50 to-white backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/70 shadow-sm relative overflow-hidden">
                <div style={{ position: "absolute", top: "-40%", right: "-5%", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(192, 57, 43, 0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-6 relative z-10">
                    <div className="flex items-start gap-3.5 sm:gap-6 min-w-0 w-full md:w-auto">
                        <div className="bg-red-500/10 p-3 sm:p-4 rounded-2xl border border-red-500/20 text-[var(--color-primary)] shadow-xs flex-shrink-0 mt-1">
                            <TrendingUp className="w-7 h-7 sm:w-9 sm:h-9" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="m-0 text-xs sm:text-sm font-extrabold text-[var(--color-primary)] uppercase tracking-wider mb-1">
                                ¡{getSaludo()}!
                            </p>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight m-0 break-words">
                                {usuario.primer_nombre} {usuario.primer_apellido}
                            </h1>
                            <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-500 max-w-xl font-medium leading-relaxed m-0">
                                Bienvenido a tu espacio de trabajo. Aquí tienes un análisis en tiempo real de tu gestión comercial.
                            </p>
                        </div>
                    </div>

                    {/* Badge de Fecha Flotante Elegante */}
                    <div className="bg-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 w-full md:w-auto justify-center md:justify-start flex-shrink-0">
                        <div className="bg-slate-100 p-2 sm:p-2.5 rounded-xl text-slate-600">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hoy es</span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-700 capitalize">
                                {new Date().toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenedor Principal con Estilo Glassmorphism de Reportes */}
            <div className="reporte-contenedor mx-auto">
                {cargando ? (
                    <div className="seg-loading reporte-cargando flex flex-col items-center justify-center">
                        <div className="loader border-[var(--color-primary)] border-t-transparent"></div>
                        <p className="mt-4 text-[var(--color-text-muted)] font-semibold text-sm sm:text-base">Cargando métricas de tu gestión...</p>
                    </div>
                ) : (
                    <>
                        {/* KPI CARDS */}
                        <div className="metricas-grid-kpi mb-6 sm:mb-8">
                            <div className="kpi-premium-card" style={{ '--kpi-color': '#3B82F6', '--kpi-bg': 'rgba(59, 130, 246, 0.15)', '--kpi-shadow': 'rgba(59, 130, 246, 0.2)' }}>
                                <div className="flex justify-between items-start mb-3 gap-2">
                                    <div className="min-w-0">
                                        <p className="m-0 text-slate-500 font-semibold text-xs sm:text-sm">Clientes Activos</p>
                                        <h3 className="my-1 text-slate-900 font-extrabold text-2xl sm:text-3xl lg:text-4xl">{metricas.clientes}</h3>
                                    </div>
                                    <div className="bg-blue-50 p-2.5 sm:p-3 rounded-xl text-blue-500 shrink-0">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-auto pt-1">
                                    <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">Base activa</span>
                                    <p className="m-0 text-slate-400 text-xs font-medium truncate">Clientes registrados</p>
                                </div>
                            </div>

                            <div className="kpi-premium-card" style={{ '--kpi-color': '#10B981', '--kpi-bg': 'rgba(16, 185, 129, 0.15)', '--kpi-shadow': 'rgba(16, 185, 129, 0.2)' }}>
                                <div className="flex justify-between items-start mb-3 gap-2">
                                    <div className="min-w-0">
                                        <p className="m-0 text-slate-500 font-semibold text-xs sm:text-sm">Pedidos Registrados</p>
                                        <h3 className="my-1 text-slate-900 font-extrabold text-2xl sm:text-3xl lg:text-4xl">{metricas.pedidos}</h3>
                                    </div>
                                    <div className="bg-emerald-50 p-2.5 sm:p-3 rounded-xl text-emerald-500 shrink-0">
                                        <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-auto pt-1">
                                    <span className="inline-flex items-center bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">Ventas</span>
                                    <p className="m-0 text-slate-400 text-xs font-medium truncate">Órdenes emitidas</p>
                                </div>
                            </div>

                            <div className="kpi-premium-card" style={{ '--kpi-color': '#F59E0B', '--kpi-bg': 'rgba(245, 158, 11, 0.15)', '--kpi-shadow': 'rgba(245, 158, 11, 0.2)' }}>
                                <div className="flex justify-between items-start mb-3 gap-2">
                                    <div className="min-w-0">
                                        <p className="m-0 text-slate-500 font-semibold text-xs sm:text-sm">Cotizaciones Creadas</p>
                                        <h3 className="my-1 text-slate-900 font-extrabold text-2xl sm:text-3xl lg:text-4xl">{metricas.cotizaciones}</h3>
                                    </div>
                                    <div className="bg-amber-50 p-2.5 sm:p-3 rounded-xl text-amber-500 shrink-0">
                                        <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-auto pt-1">
                                    <span className="inline-flex items-center bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">Propuestas</span>
                                    <p className="m-0 text-slate-400 text-xs font-medium truncate">Historial de cotizaciones</p>
                                </div>
                            </div>
                        </div>

                        {/* ACTIVIDAD RECIENTE - DESIGN ULTRA-MODERNO 2026 */}
                        <div className="bg-gradient-to-b from-white/90 via-slate-50/40 to-white/90 backdrop-blur-2xl rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7 relative z-10">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="m-0 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Actividad Reciente</h2>
                                            <span className="bg-red-100/80 text-[var(--color-primary)] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-red-200/60">En Vivo</span>
                                        </div>
                                        <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">Monitoreo en tiempo real de tus últimos pedidos comercializados</p>
                                    </div>
                                </div>

                                <Link to="/seguimiento" className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-900 hover:text-white px-5 py-2.5 rounded-2xl transition-all duration-300 border border-slate-200 shadow-xs no-underline self-stretch sm:self-auto justify-center">
                                    <span>Explorar Historial</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            
                            {recientes.length === 0 ? (
                                <div className="text-center py-14 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                                    <Package size={48} className="opacity-20 mx-auto mb-3 text-slate-400" />
                                    <p className="m-0 font-extrabold text-base text-slate-700">Sin pedidos recientes</p>
                                    <p className="mt-1 text-xs text-slate-400">Las nuevas órdenes registradas aparecerán automáticamente aquí.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                    {recientes.map((pedido, i) => {
                                        const badge = getBadgeStyle(pedido.estado_pedido);
                                        return (
                                            <div 
                                                key={pedido.id_pedido || i}
                                                className="group relative bg-white/90 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 hover:border-red-500/30 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                                            >
                                                <div className="flex items-center justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0 group-hover:scale-105 group-hover:bg-[var(--color-primary)] transition-all">
                                                            {getIniciales(pedido.nombre_cliente)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="m-0 font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-[var(--color-primary)] transition-colors truncate">
                                                                {pedido.nombre_cliente || "Cliente Particular"}
                                                            </p>
                                                            <p className="m-0 text-slate-400 text-xs font-semibold">
                                                                Pedido #{pedido.id_pedido}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <span 
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs"
                                                            style={badge}
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                                            {pedido.estado_pedido}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-slate-400" />
                                                        <span>{formatearFecha(pedido.fecha_pedido)}</span>
                                                    </div>
                                                    <Link 
                                                        to="/seguimiento" 
                                                        className="inline-flex items-center gap-1 font-bold text-slate-600 group-hover:text-[var(--color-primary)] transition-colors no-underline"
                                                    >
                                                        <span>Detalles</span>
                                                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <PiePanel />
        </div>
    );
}


