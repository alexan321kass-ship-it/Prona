import { useState, useEffect } from "react";
import { reportesService } from "./reportes.service";
import { ClipboardList } from "lucide-react";
import "./reportes.css";
import "../../compartido/styles/seguimiento-compartido.css";

// Sub-componente que ya existe
import SalesHistory from "./components/SalesHistory";
import "../../features/pedidos/pedidos.css";

export default function Historial() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        const dataHist = await reportesService.getHistorial();
        setHistorial(dataHist.ventas || []);
      } catch (err) {
        console.error("Error al cargar historial:", err);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor || 0);

  return (
    <div className="pedidos-pagina">
      <div className="pedidos-contenido">

        {/* PREMIUM HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
          <div style={{ background: "var(--color-primary-glass)", padding: "0.8rem", borderRadius: "14px", color: "var(--color-primary)" }}>
            <ClipboardList size={28} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>
              Historial de Ventas
            </h2>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "0.95rem", fontWeight: 500 }}>
              Registro completo de todas las ventas realizadas
            </p>
          </div>
        </div>

        {/* CONTENIDO */}
        {cargando ? (
          <div style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: "20px",
            padding: "4rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
          }}>
            <div className="loader"></div>
            <p style={{ color: "#6b7280", fontWeight: 500 }}>Cargando historial...</p>
          </div>
        ) : (
          <div style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
          }}>
            <SalesHistory historial={historial} formatearMoneda={formatearMoneda} />
          </div>
        )}
      </div>
    </div>
  );
}
