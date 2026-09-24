import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, Users, TrendingUp, FileText, Activity, Clock, ArrowRight } from "lucide-react";
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

    if (!usuario) return null;

    return (
        <div className="fade-in max-w-[1400px] mx-auto pb-10">
            {/* Banner de Bienvenida Premium (Idéntico a DashboardAdmin) */}
            <div className="p-5 sm:p-10 mb-6 sm:mb-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden relative">
                <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(192, 57, 43, 0.03) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }}></div>
                
                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    <div className="bg-red-500/10 p-3 sm:p-5 rounded-2xl border border-red-500/10 shadow-xs flex-shrink-0">
                        <TrendingUp size={32} color="#C0392B" />
                    </div>
                    <div>
                        <p className="m-0 text-sm sm:text-base font-bold text-[var(--color-primary)] uppercase tracking-wider">
                            {getSaludo()}
                        </p>
                        <h1 className="m-0 text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            {usuario.primer_nombre} {usuario.primer_apellido}
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl font-medium">
                            Bienvenido a tu espacio de trabajo. Aquí tienes un análisis en tiempo real de tu gestión comercial.
                        </p>
                    </div>
                </div>

                {/* Widget de Fecha Elegante */}
                <div className="bg-white/80 px-4 py-2 sm:px-6 sm:py-3 rounded-xl border border-white/90 shadow-xs flex flex-col items-start md:items-end relative z-10 w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hoy es</span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-800 capitalize">
                        {new Date().toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {/* Contenedor Principal con Estilo Glassmorphism de Reportes */}
            <div className="reporte-contenedor mx-auto">
                {cargando ? (
                    <div className="seg-loading reporte-cargando flex flex-col items-center justify-center">
                        <div className="loader border-[var(--color-primary)] border-t-transparent"></div>
                        <p className="mt-4 text-[var(--color-text-muted)] font-semibold">Cargando métricas de tu gestión...</p>
                    </div>
                ) : (
                    <>
                        {/* KPI CARDS (Mismo estilo que VisualMetrics de DashboardAdmin) */}
                        <div className="metricas-grid-kpi mb-8">
                            <div className="kpi-premium-card" style={{ '--kpi-color': '#3B82F6', '--kpi-bg': 'rgba(59, 130, 246, 0.15)', '--kpi-shadow': 'rgba(59, 130, 246, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>Clientes Activos</p>
                                        <h3 style={{ margin: '0.3rem 0', color: '#0F172A', fontWeight: 800, fontSize: '2.2rem' }}>{metricas.clientes}</h3>
                                    </div>
                                    <div style={{ background: '#EFF6FF', padding: '0.8rem', borderRadius: '14px', color: '#3B82F6' }}>
                                        <Users size={26} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#DBEAFE', color: '#2563EB', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Base activa</span>
                                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>Clientes registrados</p>
                                </div>
                            </div>

                            <div className="kpi-premium-card" style={{ '--kpi-color': '#10B981', '--kpi-bg': 'rgba(16, 185, 129, 0.15)', '--kpi-shadow': 'rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>Pedidos Registrados</p>
                                        <h3 style={{ margin: '0.3rem 0', color: '#0F172A', fontWeight: 800, fontSize: '2.2rem' }}>{metricas.pedidos}</h3>
                                    </div>
                                    <div style={{ background: '#ECFDF5', padding: '0.8rem', borderRadius: '14px', color: '#10B981' }}>
                                        <Package size={26} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#DCFCE7', color: '#16A34A', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Ventas</span>
                                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>Órdenes emitidas</p>
                                </div>
                            </div>

                            <div className="kpi-premium-card" style={{ '--kpi-color': '#F59E0B', '--kpi-bg': 'rgba(245, 158, 11, 0.15)', '--kpi-shadow': 'rgba(245, 158, 11, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ margin: 0, color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>Cotizaciones Creadas</p>
                                        <h3 style={{ margin: '0.3rem 0', color: '#0F172A', fontWeight: 800, fontSize: '2.2rem' }}>{metricas.cotizaciones}</h3>
                                    </div>
                                    <div style={{ background: '#FFFBEB', padding: '0.8rem', borderRadius: '14px', color: '#F59E0B' }}>
                                        <FileText size={26} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#FEF3C7', color: '#D97706', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Propuestas</span>
                                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>Historial de cotizaciones</p>
                                </div>
                            </div>
                        </div>

                        {/* ACTIVIDAD RECIENTE */}
                        <div className="grafico-premium-card">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                    <Activity size={24} color="var(--color-primary)" />
                                    <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#0F172A" }}>Actividad Reciente</h2>
                                </div>
                                <Link to="/seguimiento" style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.95rem" }}>
                                    Ver todos los pedidos <ArrowRight size={16} />
                                </Link>
                            </div>
                            
                            {recientes.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "3rem", background: "#F8FAFC", borderRadius: "16px", color: "#64748B" }}>
                                    <Package size={40} style={{ opacity: 0.3, margin: "0 auto 1rem" }} />
                                    <p style={{ margin: 0, fontWeight: 600 }}>Aún no hay pedidos registrados.</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                                    {recientes.map((pedido, i) => (
                                        <div key={pedido.id_pedido || i} 
                                             style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.4rem", background: "#F8FAFC", borderRadius: "16px", transition: "all 0.2s ease", border: "1px solid #F1F5F9" }}
                                             onMouseOver={e => e.currentTarget.style.background = "#F1F5F9"}
                                             onMouseOut={e => e.currentTarget.style.background = "#F8FAFC"}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                                <div style={{ background: "white", padding: "0.75rem", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.04)", color: "var(--color-primary)" }}>
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 700, color: "#0F172A", fontSize: "1.05rem" }}>Pedido #{pedido.id_pedido}</p>
                                                    <p style={{ margin: "0.2rem 0 0", color: "#64748B", fontSize: "0.88rem", fontWeight: 500 }}>{pedido.nombre_cliente}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <span style={{ display: "inline-block", padding: "0.35rem 0.85rem", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem", ...getBadgeStyle(pedido.estado_pedido) }}>
                                                    {pedido.estado_pedido}
                                                </span>
                                                <p style={{ margin: 0, color: "#94A3B8", fontSize: "0.85rem", fontWeight: 500 }}>{formatearFecha(pedido.fecha_pedido)}</p>
                                            </div>
                                        </div>
                                    ))}
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


