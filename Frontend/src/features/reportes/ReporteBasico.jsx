import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { reportesService } from "./reportes.service";
import { BarChart3, List, UserCheck, ArrowLeft, LineChart } from "lucide-react";
import "../../compartido/styles/seguimiento-compartido.css";
import "./reportes.css";

// Sub-componentes
import { TabButton } from "./components/Common";
import VisualMetrics from "./components/VisualMetrics";
import SalesHistory from "./components/SalesHistory";
import TopPerformers from "./components/TopPerformers";
import logoPronavid from "../../images/Logopronavid.png";

export default function ReporteBasico() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener pestaña activa desde la URL
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "graficos";
  
  const [seccion, setSeccion] = useState(initialTab);
  const [historial, setHistorial] = useState([]);
  const [masVendido, setMasVendido] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [resumen, setResumen] = useState({ totalVentas: 0, totalProductos: 0, totalIngresos: 0 });
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [metricasGrales, setMetricasGrales] = useState({});
  const [cargando, setCargando] = useState(true);

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

  // Sincronizar estado con la URL
  const cambiarTab = (nuevaTab) => {
    setSeccion(nuevaTab);
    navigate(`/ReporteBasico?tab=${nuevaTab}`, { replace: true });
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(valor || 0);
  };

  const volverDashboard = () => {
    const user = JSON.parse(localStorage.getItem("usuario"));
    navigate((user?.id_rol === 1 || user?.id_rol === 3) ? "/DashboardAdmin" : "/DashboardAsesor");
  };

  return (
    <div className="seguimiento-page">
      <header className="seg-header">
        <img src={logoPronavid} alt="Pronavid" className="seg-logo" />
      </header>

      <button onClick={volverDashboard} className="btn-volver" title="Volver">
        <ArrowLeft size={20} />
      </button>

      <div className="seg-container reporte-contenedor">
        <div className="reporte-encabezado">
          <h1 className="reporte-titulo">
            <LineChart size={28} className="inline-block mr-2 text-blue-600" />
            Dashboard de Métricas
          </h1>
          <p className="reporte-subtitulo">Análisis de rendimiento y ventas en tiempo real</p>
        </div>

        {/* TABS NAVEGACIÓN */}
        <div className="reporte-pestanas">
          <TabButton active={seccion === "graficos"} onClick={() => cambiarTab("graficos")} icon={<BarChart3 size={18} />} label="Vistas Visuales" />
          <TabButton active={seccion === "historial"} onClick={() => cambiarTab("historial")} icon={<List size={18} />} label="Historial de Ventas" />
          <TabButton active={seccion === "frecuente"} onClick={() => cambiarTab("frecuente")} icon={<UserCheck size={18} />} label="Fidelidad de Clientes" />
        </div>

        {cargando ? (
          <div className="seg-loading reporte-cargando">
            <div className="loader"></div>
            <p>Generando visualizaciones...</p>
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
