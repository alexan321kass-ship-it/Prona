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

                setMasVendido(Array.isArray(dataMas?.totales) ? dataMas.totales : (Array.isArray(dataMas) ? dataMas : []));
                setClientes(Array.isArray(dataClientes?.clientes) ? dataClientes.clientes : (Array.isArray(dataClientes) ? dataClientes : []));
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
            <div className="fade-in max-w-[1400px] mx-auto pb-10">
                {/* Banner de Bienvenida Premium */}
                <div style={{
                    padding: "2.5rem 3rem",
                    marginBottom: "3rem",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.5) 100%)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "2rem"
                }}>
                    {/* Decoración sutil de fondo para profundidad */}
                    <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(192, 57, 43, 0.03) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }}></div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", position: "relative", zIndex: 1 }}>
                        <div style={{ 
                            background: "linear-gradient(135deg, rgba(192, 57, 43, 0.1) 0%, rgba(192, 57, 43, 0.02) 100%)", 
                            padding: "1.2rem", 
                            borderRadius: "20px",
                            border: "1px solid rgba(192, 57, 43, 0.1)",
                            boxShadow: "0 10px 20px rgba(192, 57, 43, 0.05)"
                        }}>
                            <LineChart size={36} color="#C0392B" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#C0392B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                Hola, {usuario.primer_nombre}
                            </p>
                            <h1 style={{ margin: "0.2rem 0 0", fontSize: "2.8rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                                Dashboard de Métricas
                            </h1>
                            <p style={{ margin: "0.8rem 0 0", fontSize: "1.1rem", color: "#64748b", maxWidth: "600px", fontWeight: 500 }}>
                                Aquí tienes el análisis de rendimiento y ventas en tiempo real de Pronavid.
                            </p>
                        </div>
                    </div>

                    {/* Widget de Fecha Elegante */}
                    <div style={{ 
                        background: "rgba(255, 255, 255, 0.8)", 
                        padding: "1rem 1.5rem", 
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.03)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        position: "relative",
                        zIndex: 1
                    }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Hoy es</span>
                        <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e293b" }}>
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
