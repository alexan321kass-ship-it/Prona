import { Package, Users, TrendingUp, FileText, Activity, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

                // Obtener los 3 pedidos más recientes
                setRecientes(pedidosArray.slice(0, 3));
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

    if (!usuario) return null;

    const STATS = [
        { label: "Clientes Activos", count: metricas.clientes, icon: <Users size={28} />, color: "#3b82f6", bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", shadow: "rgba(59,130,246,0.15)" },
        { label: "Pedidos Registrados", count: metricas.pedidos, icon: <Package size={28} />, color: "#10b981", bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", shadow: "rgba(16,185,129,0.15)" },
        { label: "Cotizaciones Creadas", count: metricas.cotizaciones, icon: <FileText size={28} />, color: "#f59e0b", bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", shadow: "rgba(245,158,11,0.15)" },
    ];

    return (
        <div className="fade-in pb-10 max-w-[1400px] mx-auto px-2 sm:px-6">
            
            {/* Banner de Bienvenida Premium */}
            <div className="p-5 sm:p-10 my-4 sm:my-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden relative">
                {/* Decoración sutil de fondo para profundidad */}
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
                    <span className="text-sm sm:text-base font-extrabold text-slate-800">
                        {new Date().toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {cargando ? (
                <div className="seg-loading" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loader"></div>
                    <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Sincronizando tu información...</p>
                </div>
            ) : (
                <>
                    {/* Tarjetas de Estadísticas Animadas */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                        {STATS.map(s => (
                            <div key={s.label} style={{ 
                                background: "white", 
                                padding: "2rem", 
                                borderRadius: "24px", 
                                border: "1px solid rgba(0,0,0,0.03)", 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "1.5rem", 
                                boxShadow: `0 10px 30px ${s.shadow}`,
                                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                cursor: "default",
                                position: "relative",
                                overflow: "hidden"
                            }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 20px 40px ${s.shadow}`; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 10px 30px ${s.shadow}`; }}
                            >
                                <div style={{ width: "70px", height: "70px", borderRadius: "20px", background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {s.icon}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: "2.5rem", fontWeight: 900, color: "#0f172a", lineHeight: 1, letterSpacing: "-0.03em" }}>{s.count}</p>
                                    <p style={{ margin: "0.4rem 0 0", fontSize: "1rem", fontWeight: 700, color: "#64748b" }}>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actividad Reciente */}
                    <div style={{ background: "white", borderRadius: "24px", padding: "2.5rem", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.03)", marginBottom: "3rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                <Activity size={24} color="var(--color-primary)" />
                                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>Actividad Reciente</h2>
                            </div>
                            <Link to="/seguimiento" style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.95rem" }}>
                                Ver todos los pedidos <ArrowRight size={16} />
                            </Link>
                        </div>
                        
                        {recientes.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "3rem", background: "#f8fafc", borderRadius: "16px", color: "#64748b" }}>
                                <Package size={40} style={{ opacity: 0.3, margin: "0 auto 1rem" }} />
                                <p style={{ margin: 0, fontWeight: 600 }}>Aún no hay pedidos registrados.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {recientes.map((pedido, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", background: "#f8fafc", borderRadius: "16px", transition: "all 0.2s ease" }}
                                         onMouseOver={e => e.currentTarget.style.background = "#f1f5f9"}
                                         onMouseOut={e => e.currentTarget.style.background = "#f8fafc"}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                            <div style={{ background: "white", padding: "0.75rem", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", color: "var(--color-primary)" }}>
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "1.05rem" }}>Pedido #{pedido.id_pedido}</p>
                                                <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>{pedido.nombre_cliente}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{ display: "inline-block", background: "white", padding: "0.4rem 1rem", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 700, color: "#475569", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", marginBottom: "0.3rem" }}>
                                                {pedido.estado_pedido}
                                            </span>
                                            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>{formatearFecha(pedido.fecha_pedido)}</p>
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
