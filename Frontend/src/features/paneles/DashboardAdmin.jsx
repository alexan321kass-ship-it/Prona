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
import SalesHistory from "../reportes/components/SalesHistory";
import TopPerformers from "../reportes/components/TopPerformers";

export default function DashboardAdmin() {
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener pestaña activa desde la URL
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get("tab") || "graficos";
    
    const [usuario, setUsuario] = useState(null);
    const [seccion, setSeccion] = useState(initialTab);
    const [historial, setHistorial] = useState([]);
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
            if (user.id_rol !== 1 && user.id_rol !== 3) {
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
                    dataHist,
                    dataMas,
                    dataClientes,
                    dataResumen,
                    dataMensual,
                    dataGrales
                ] = await Promise.all([
                    reportesService.getHistorial(),
                    reportesService.getMasVendidos(),
                    reportesService.getClientesFrecuentes(),
                    reportesService.getResumen(),
                    reportesService.getVentasMensuales(),
                    reportesService.getMetricasGrales()
                ]);

                setHistorial(dataHist.ventas || []);
                setMasVendido(dataMas.totales || []);
                setClientes(dataClientes.clientes || []);
                setResumen(dataResumen || { totalVentas: 0, totalProductos: 0, totalIngresos: 0 });
                setVentasMensuales(dataMensual || []);
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
                {/* Cabecera / Bienvenida */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-main)] flex items-center">
                        <LineChart size={28} className="mr-3 text-[var(--color-primary)]" />
                        Dashboard de Métricas
                    </h1>
                    <span className="text-md text-[var(--color-text-muted)] mt-2 block">
                        Hola, {usuario.primer_nombre} {usuario.primer_apellido}. Aquí tienes el análisis de rendimiento y ventas en tiempo real.
                    </span>
                  </div>
                </div>

                {/* Contenedor de Reportes con Estilo Original */}
                <div className="reporte-contenedor !shadow-sm !rounded-xl !border !border-[var(--color-border)] bg-[var(--color-card)] p-6">
                    {/* TABS NAVEGACIÓN */}
                    <div className="reporte-pestanas mb-8">
                        <TabButton active={seccion === "graficos"} onClick={() => cambiarTab("graficos")} icon={<BarChart3 size={18} />} label="Vistas Visuales" />
                        <TabButton active={seccion === "historial"} onClick={() => cambiarTab("historial")} icon={<List size={18} />} label="Historial de Ventas" />
                        <TabButton active={seccion === "frecuente"} onClick={() => cambiarTab("frecuente")} icon={<UserCheck size={18} />} label="Fidelidad de Clientes" />
                    </div>

                    {cargando ? (
                        <div className="seg-loading reporte-cargando min-h-[400px] flex flex-col items-center justify-center">
                            <div className="loader border-[var(--color-primary)] border-t-transparent"></div>
                            <p className="mt-4 text-[var(--color-text-muted)]">Generando visualizaciones...</p>
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

                            {seccion === "historial" && (
                                <SalesHistory 
                                    historial={historial} 
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
