import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { reportesService } from "../reportes/reportes.service";
import { BarChart3, List, UserCheck, LineChart } from "lucide-react";

// Estilos originales
import "../../compartido/styles/seguimiento-compartido.css";
import "../reportes/reportes.css";

// Sub-componentes originales del reporte
import { TabButton } from "../reportes/components/Common";
import VisualMetrics from "../reportes/components/VisualMetrics";
import TopPerformers from "../reportes/components/TopPerformers";

export default function DashboardAdmin() {
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener pestaña activa desde la URL
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get("tab") || "graficos";
    
    const [usuario, setUsuario] = useState(null);
    const [seccion, setSeccion] = useState(initialTab);
    const [masVendido, setMasVendido] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [resumen, setResumen] = useState({ totalVentas: 0, totalProductos: 0, totalIngresos: 0 });
    const [ventasMensuales, setVentasMensuales] = useState([]);
    const [metricasGrales, setMetricasGrales] = useState({});
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const userRaw = localStorage.getItem("usuario");
        if (!userRaw) {
            navigate("/login");
            return;
        }

        try {
            const user = JSON.parse(userRaw);
            const rol = Number(user.id_rol);
            if (rol !== 1 && rol !== 3) {
                navigate("/DashboardAsesor");
                return;
            }
            setUsuario(user);
        } catch (e) {
            navigate("/login");
        }
    }, [navigate]);

    // Update state when URL changes via sidebar
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const currentTab = queryParams.get("tab");
        if (currentTab && currentTab !== seccion) {
            setSeccion(currentTab);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setCargando(true);
                const [
                    dataMas,
                    dataClientes,
                    dataResumen,
                    dataMensual,
                    dataGrales
                ] = await Promise.all([
                    reportesService.getMasVendidos(),
                    reportesService.getClientesFrecuentes(),
                    reportesService.getResumen(),
                    reportesService.getVentasMensuales(),
                    reportesService.getMetricasGrales()
                ]);

                const masArr = Array.isArray(dataMas?.totales) ? dataMas.totales : (Array.isArray(dataMas) ? dataMas : []);
                const cliArr = Array.isArray(dataClientes) ? dataClientes : (Array.isArray(dataClientes?.clientes) ? dataClientes.clientes : (Array.isArray(dataClientes?.clientes?.clientes) ? dataClientes.clientes.clientes : []));
                
                setMasVendido(masArr);
                setClientes(cliArr);
                setResumen(dataResumen || { totalVentas: 0, totalProductos: 0, totalIngresos: 0 });
                setVentasMensuales(Array.isArray(dataMensual) ? dataMensual : []);
                setMetricasGrales(dataGrales || { total_clientes: 0, productos_activos: 0, ingresos_historicos: 0, pedidos_pendientes: 0 });

            } catch (err) {
                console.error("Error fetch reportes:", err);
            } finally {
                setCargando(false);
            }
        };
        fetchData();
    }, []);

    const cambiarTab = (nuevaTab) => {
        setSeccion(nuevaTab);
        navigate(`/DashboardAdmin?tab=${nuevaTab}`, { replace: true });
    };

    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(valor || 0);
    };

    if (!usuario) return null;

    return (
            <div className="fade-in max-w-[1400px] mx-auto pb-10">                {/* Banner de Bienvenida Premium */}
                <div className="p-5 sm:p-10 mb-6 sm:mb-12 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden relative">
                    {/* Decoración sutil de fondo para profundidad */}
                    <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(192, 57, 43, 0.03) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }}></div>
                    
                    <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                        <div className="bg-red-500/10 p-3 sm:p-5 rounded-2xl border border-red-500/10 shadow-xs flex-shrink-0">
                            <LineChart size={32} color="#C0392B" />
                        </div>
                        <div>
                            <p className="m-0 text-sm sm:text-base font-bold text-[var(--color-primary)] uppercase tracking-wider">
                                Hola, {usuario.primer_nombre}
                            </p>
                            <h1 className="m-0 text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                Dashboard de Métricas
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl font-medium">
                                Aquí tienes el análisis de rendimiento y ventas en tiempo real de Pronavid.
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

                {/* Contenedor de Reportes con Estilo Premium */}
                <div className="reporte-contenedor mx-auto">
                    {/* TABS NAVEGACIÓN */}
                    <div className="reporte-pestanas mb-8">
                        <button className={seccion === "graficos" ? "active" : ""} onClick={() => cambiarTab("graficos")}>
                            <BarChart3 size={18} /> Vistas Visuales
                        </button>
                        <button className={seccion === "frecuente" ? "active" : ""} onClick={() => cambiarTab("frecuente")}>
                            <UserCheck size={18} /> Fidelidad de Clientes
                        </button>
                    </div>

                    {cargando ? (
                        <div className="seg-loading reporte-cargando flex flex-col items-center justify-center">
                            <div className="loader border-[var(--color-primary)] border-t-transparent"></div>
                            <p className="mt-4 text-[var(--color-text-muted)] font-semibold">Generando visualizaciones premium...</p>
                        </div>
                    ) : (
                        <div className="fade-in">
                            {seccion === "graficos" && (
                                <VisualMetrics 
                                    resumen={resumen} 
                                    metricasGrales={metricasGrales} 
                                    ventasMensuales={ventasMensuales} 
                                    masVendido={masVendido}
                                    formatearMoneda={formatearMoneda}
                                />
                            )}

                            {seccion === "frecuente" && (
                                <TopPerformers 
                                    clientes={clientes} 
                                    masVendido={masVendido} 
                                    metricasGrales={metricasGrales}
                                    formatearMoneda={formatearMoneda}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
    );
}
