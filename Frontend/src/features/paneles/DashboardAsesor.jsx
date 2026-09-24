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

    if (!usuario) return null;

    const STATS = [
        { label: "Clientes Activos", count: metricas.clientes, icon: <Users size={28} />, color: "#3b82f6", bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", shadow: "rgba(59,130,246,0.12)" },
        { label: "Pedidos Registrados", count: metricas.pedidos, icon: <Package size={28} />, color: "#10b981", bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", shadow: "rgba(16,185,129,0.12)" },
        { label: "Cotizaciones Creadas", count: metricas.cotizaciones, icon: <FileText size={28} />, color: "#f59e0b", bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", shadow: "rgba(245,158,11,0.12)" },
    ];

    return (
        <div className="fade-in pb-8 max-w-[1200px] mx-auto px-4 sm:px-6">
            
            {/* Banner de Bienvenida */}
            <div className="p-6 sm:p-8 my-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex-shrink-0">
                        <TrendingUp size={32} color="#C0392B" />
                    </div>
                    <div>
                        <p className="m-0 text-sm font-bold text-[#C0392B] uppercase tracking-wider mb-1">
                            {getSaludo()}
                        </p>
                        <h1 className="m-0 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            {usuario.primer_nombre} {usuario.primer_apellido}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 max-w-xl font-medium">
                            Bienvenido a tu espacio de trabajo. Aquí tienes el resumen en tiempo real de tu gestión comercial.
                        </p>
                    </div>
                </div>

                {/* Widget de Fecha */}
                <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 flex flex-col items-start md:items-end relative z-10 w-full md:w-auto">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Hoy es</span>
                    <span className="text-sm font-extrabold text-slate-800 capitalize">
                        {new Date().toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {cargando ? (
                <div className="seg-loading my-12 flex flex-col items-center justify-center min-h-[250px]">
                    <div className="loader"></div>
                    <p className="mt-4 text-slate-500 font-semibold text-sm">Sincronizando información...</p>
                </div>
            ) : (
                <>
                    {/* Tarjetas de Estadísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        {STATS.map(s => (
                            <div 
                                key={s.label} 
                                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                                    {s.icon}
                                </div>
                                <div>
                                    <p className="m-0 text-3xl font-black text-slate-900 leading-none">{s.count}</p>
                                    <p className="m-0 mt-1 text-sm font-bold text-slate-600">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actividad Reciente */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <Activity size={24} color="#C0392B" />
                                <h2 className="m-0 text-xl font-extrabold text-slate-900">Actividad Reciente</h2>
                            </div>
                            <Link to="/seguimiento" className="text-sm font-bold text-[#C0392B] hover:underline flex items-center gap-1">
                                Ver todos los pedidos <ArrowRight size={16} />
                            </Link>
                        </div>
                        
                        {recientes.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl text-slate-500">
                                <Package size={40} className="opacity-30 mx-auto mb-2" />
                                <p className="m-0 font-semibold text-sm">Aún no hay pedidos registrados.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {recientes.map((pedido, i) => (
                                    <div 
                                        key={pedido.id_pedido || i} 
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-[#C0392B]">
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <p className="m-0 font-bold text-slate-900 text-base">Pedido #{pedido.id_pedido}</p>
                                                <p className="m-0 text-xs text-slate-500 font-medium">{pedido.nombre_cliente}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-2xs border border-slate-200/60 mb-1">
                                                {pedido.estado_pedido}
                                            </span>
                                            <p className="m-0 text-xs text-slate-400 font-medium">{formatearFecha(pedido.fecha_pedido)}</p>
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

