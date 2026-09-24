import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, Users, TrendingUp, FileText, Activity, Clock, ArrowRight, Calendar, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
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

                setRecientes(pedidosArray.slice(0, 6));
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
            return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
        }
        if (lower.includes("proceso") || lower.includes("transito") || lower.includes("tránsito")) {
            return { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" };
        }
        if (lower.includes("recibido") || lower.includes("registrado")) {
            return { bg: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" };
        }
        if (lower.includes("cancelado")) {
            return { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" };
        }
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
    };

    const getIniciales = (nombre) => {
        if (!nombre) return "CL";
        const partes = nombre.trim().split(" ");
        if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
        return nombre.substring(0, 2).toUpperCase();
    };

    if (!usuario) return null;

    return (
        <div className="fade-in max-w-[1400px] mx-auto pb-12 px-3 sm:px-6 lg:px-8 w-full">
            {/* Banner Hero Ejecutivo Premium */}
            <div className="p-6 sm:p-10 mb-8 bg-slate-900 text-white rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
                {/* Iluminación sutil de fondo */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0 ring-4 ring-white/10">
                            {getIniciales(`${usuario.primer_nombre} ${usuario.primer_apellido}`)}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-widest bg-red-950/60 px-3 py-0.5 rounded-full border border-red-800/40">
                                    <Sparkles size={13} className="text-red-400" />
                                    ¡{getSaludo()}!
                                </span>
                                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                                    <ShieldCheck size={12} className="text-emerald-400" /> Asesor Comercial
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight m-0 break-words">
                                {usuario.primer_nombre} {usuario.primer_apellido}
                            </h1>
                            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed m-0 opacity-90">
                                Bienvenido a tu espacio ejecutivo de trabajo. Revisa en tiempo real las ventas y clientes de tu gestión.
                            </p>
                        </div>
                    </div>

                    {/* Widget de Fecha Flotante Elegante */}
                    <div className="bg-slate-800/90 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-slate-700/70 shadow-lg flex items-center gap-3.5 w-full lg:w-auto justify-center lg:justify-start shrink-0">
                        <div className="bg-slate-700/60 p-2.5 rounded-xl text-red-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha del sistema</span>
                            <span className="text-xs sm:text-sm font-extrabold text-white capitalize">
                                {new Date().toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenedor Principal */}
            <div className="space-y-8">
                {cargando ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-16 flex flex-col items-center justify-center shadow-sm">
                        <div className="loader border-[var(--color-primary)] border-t-transparent w-10 h-10 border-3"></div>
                        <p className="mt-4 text-slate-500 font-semibold text-sm">Cargando métricas de tu gestión comercial...</p>
                    </div>
                ) : (
                    <>
                        {/* TARJETAS KPI EXECUTIVE */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                            {/* Clientes */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div>
                                        <p className="m-0 text-slate-500 font-semibold text-xs uppercase tracking-wider">Clientes Activos</p>
                                        <h3 className="mt-1 mb-0 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{metricas.clientes}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                                        <Users size={24} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Base activa
                                    </span>
                                    <span className="text-slate-400 text-xs font-medium truncate">Directorio de clientes</span>
                                </div>
                            </div>

                            {/* Pedidos */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div>
                                        <p className="m-0 text-slate-500 font-semibold text-xs uppercase tracking-wider">Pedidos Emitidos</p>
                                        <h3 className="mt-1 mb-0 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{metricas.pedidos}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                                        <Package size={24} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ventas
                                    </span>
                                    <span className="text-slate-400 text-xs font-medium truncate">Órdenes registradas</span>
                                </div>
                            </div>

                            {/* Cotizaciones */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div>
                                        <p className="m-0 text-slate-500 font-semibold text-xs uppercase tracking-wider">Cotizaciones Creadas</p>
                                        <h3 className="mt-1 mb-0 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{metricas.cotizaciones}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
                                        <FileText size={24} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Propuestas
                                    </span>
                                    <span className="text-slate-400 text-xs font-medium truncate">Historial emitido</span>
                                </div>
                            </div>
                        </div>

                        {/* ACTIVIDAD RECIENTE - TARJETAS MODERNAS EXECUTIVE */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                                        <Activity size={22} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="m-0 text-xl font-black text-slate-900 tracking-tight">Actividad Comercial Reciente</h2>
                                            <span className="bg-red-50 text-red-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-red-100">
                                                En Vivo
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium m-0">Monitoreo continuo de pedidos comercializados</p>
                                    </div>
                                </div>

                                <Link to="/seguimiento" className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-900 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-300 no-underline self-stretch sm:self-auto justify-center">
                                    <span>Ver Seguimiento Completo</span>
                                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            
                            {recientes.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                                    <Package size={44} className="opacity-25 mx-auto mb-3" />
                                    <p className="m-0 font-bold text-slate-700 text-base">Aún no hay pedidos registrados</p>
                                    <p className="mt-1 text-xs text-slate-400">Las ventas recién procesadas aparecerán aquí inmediatamente.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recientes.map((pedido, i) => {
                                        const badgeStyle = getBadgeStyle(pedido.estado_pedido);
                                        return (
                                            <div 
                                                key={pedido.id_pedido || i}
                                                className="group bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-red-500/30 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:bg-red-600 transition-colors">
                                                            {getIniciales(pedido.nombre_cliente)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="m-0 font-extrabold text-slate-900 text-sm truncate group-hover:text-red-600 transition-colors">
                                                                {pedido.nombre_cliente || "Cliente Particular"}
                                                            </p>
                                                            <p className="m-0 text-slate-400 text-xs font-semibold">
                                                                Pedido #{pedido.id_pedido}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot} animate-pulse`}></span>
                                                        {pedido.estado_pedido}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                                        <Clock size={13} />
                                                        <span>{formatearFecha(pedido.fecha_pedido)}</span>
                                                    </div>
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
