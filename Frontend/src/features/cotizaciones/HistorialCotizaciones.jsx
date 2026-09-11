import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Trash2, ArrowLeft, RefreshCw, Eye } from "lucide-react";
import { api } from "../../config/api";
import "../../compartido/styles/seguimiento-compartido.css";
import "./cotizaciones.css";

export default function HistorialCotizaciones() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mensaje, setMensaje] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  const cargarCotizaciones = useCallback(async () => {
    setCargando(true);
    try {
      const data = await api.get("/cotizaciones");
      setCotizaciones(data.cotizaciones || []);
    } catch (e) {
      setMensaje({ texto: "Error cargando cotizaciones", tipo: "error" });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarCotizaciones(); }, [cargarCotizaciones]);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    setCargandoAccion(true);
    try {
      await api.put(`/cotizaciones/${id}/estado`, { estado: nuevoEstado });
      setCotizaciones(prev => prev.map(c => c.id_cotizacion === id ? { ...c, estado: nuevoEstado } : c));
      if (modalDetalle?.id_cotizacion === id) {
        setModalDetalle(prev => ({ ...prev, estado: nuevoEstado }));
      }
      setMensaje({ texto: `Cotización #${id} marcada como ${nuevoEstado}`, tipo: "success" });
    } catch (e) {
      setMensaje({ texto: e.message || "Error al cambiar estado", tipo: "error" });
    } finally {
      setCargandoAccion(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm(`¿Eliminar la cotización #${id}? Esta acción no se puede deshacer.`)) return;
    setCargandoAccion(true);
    try {
      await api.delete(`/cotizaciones/${id}`);
      setCotizaciones(prev => prev.filter(c => c.id_cotizacion !== id));
      setModalDetalle(null);
      setMensaje({ texto: `Cotización #${id} eliminada`, tipo: "success" });
    } catch (e) {
      setMensaje({ texto: e.message || "Error al eliminar", tipo: "error" });
    } finally {
      setCargandoAccion(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const formatearMoneda = (v) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v || 0);
  const formatearFecha = (f) => new Date(f).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
  const calcularTotal = (cotizacion) => cotizacion?.detalle_cotizacion?.reduce((acc, d) => acc + Number(d.precio_unitario) * d.cantidad, 0) || 0;

  const cotizacionesFiltradas = filtroEstado === "Todos" ? cotizaciones : cotizaciones.filter(c => c.estado === filtroEstado);
  const contarEstado = (e) => cotizaciones.filter(c => c.estado === e).length;

  const getEstadoClase = (estado) => {
    switch (estado) {
      case "Aprobada": return "estado-badge estado-entregado";
      case "Rechazada": return "estado-badge estado-cancelado";
      case "Pendiente": return "estado-badge estado-pendiente";
      default: return "estado-badge";
    }
  };

  const FILTROS = [
    { label: "Todos",     count: cotizaciones.length,         icon: "📋" },
    { label: "Pendiente", count: contarEstado("Pendiente"),   icon: "🕒" },
    { label: "Aprobada",  count: contarEstado("Aprobada"),    icon: "✅" },
    { label: "Rechazada", count: contarEstado("Rechazada"),   icon: "❌" },
  ];

  return (
    <div className="pedidos-pagina">
      <div className="pedidos-contenido fade-in">
        
        {/* Cabecera Premium */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1e293b", margin: "0 0 0.5rem 0", letterSpacing: "-0.03em" }}>Historial de Cotizaciones</h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "1.05rem" }}>Consulta y gestiona las cotizaciones de tus clientes</p>
          </div>
          <button 
            className="btn-ver-detalle" 
            onClick={cargarCotizaciones} 
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem" }}
          >
            <RefreshCw size={18} /> Actualizar Datos
          </button>
        </div>

        {/* Chips de filtro */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {FILTROS.map(f => (
            <button
              key={f.label}
              onClick={() => setFiltroEstado(f.label)}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.75rem 1.25rem", borderRadius: "100px", border: "none", cursor: "pointer",
                background: filtroEstado === f.label ? "var(--color-primary)" : "#ffffff",
                color: filtroEstado === f.label ? "white" : "#475569",
                fontWeight: 700, fontSize: "0.95rem",
                boxShadow: filtroEstado === f.label ? "0 8px 20px rgba(192,57,43,0.25)" : "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.25s ease",
              }}
            >
              <span>{f.icon}</span>
              {f.label}
              <span style={{ 
                background: filtroEstado === f.label ? "rgba(255,255,255,0.2)" : "#f1f5f9", 
                padding: "0.15rem 0.6rem", borderRadius: "100px", fontSize: "0.8rem" 
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Mensaje de feedback */}
        {mensaje && (
          <div style={{
            padding: "1rem 1.5rem", borderRadius: "16px", fontWeight: 600, fontSize: "0.95rem",
            marginBottom: "2rem", animation: "modalSlide 0.3s ease",
            background: mensaje.tipo === "success" ? "#dcfce7" : "#fee2e2",
            color: mensaje.tipo === "success" ? "#16a34a" : "#dc2626",
            border: `1px solid ${mensaje.tipo === "success" ? "#bbf7d0" : "#fecaca"}`,
            display: "flex", alignItems: "center", gap: "0.75rem"
          }}>
            {mensaje.tipo === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />} 
            {mensaje.texto}
          </div>
        )}

        {/* Tabla Floating Pill */}
        <div className="seg-table-container">
          <table className="seg-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th className="celda-centrada">Productos</th>
                <th className="celda-derecha">Total (COP)</th>
                <th className="celda-centrada">Estado</th>
                <th className="celda-centrada">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="7" className="celda-centrada" style={{ padding: "3rem" }}>Cargando cotizaciones...</td></tr>
              ) : cotizacionesFiltradas.length === 0 ? (
                <tr><td colSpan="7" className="celda-centrada" style={{ padding: "3rem", color: "#94a3b8" }}>No hay cotizaciones registradas para este filtro.</td></tr>
              ) : (
                cotizacionesFiltradas.map((c) => (
                  <tr key={c.id_cotizacion}>
                    <td style={{ fontWeight: "800", color: "var(--color-primary)" }}>#{c.id_cotizacion}</td>
                    <td style={{ fontWeight: "600", color: "#64748b" }}>{formatearFecha(c.fecha_cotizacion)}</td>
                    <td style={{ fontWeight: "700", color: "#1e293b" }}>{c.cliente?.nombre_cliente || "—"}</td>
                    <td className="celda-centrada" style={{ fontWeight: "600", color: "#64748b" }}>{c.detalle_cotizacion?.length || 0}</td>
                    <td className="celda-derecha" style={{ fontWeight: "800", color: "#0f172a" }}>{formatearMoneda(calcularTotal(c))}</td>
                    <td className="celda-centrada">
                      <span className={getEstadoClase(c.estado)}>{c.estado}</span>
                    </td>
                    <td className="celda-centrada">
                      <button className="btn-ver-detalle" onClick={() => setModalDetalle(c)}>
                        <Eye size={18} /> Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Detalle (Premium) */}
        {modalDetalle && (
          <div className="modal-overlay" onClick={() => setModalDetalle(null)}>
            <div className="modal-content modal-detalle" onClick={e => e.stopPropagation()}>
              <div className="modal-header-gradient">
                <div className="modal-header-icon"><FileText size={28} /></div>
                <div>
                  <p className="modal-header-subtitle">Detalle de Cotización</p>
                  <h2 className="modal-header-title">Cotización #{modalDetalle.id_cotizacion}</h2>
                </div>
                <button className="modal-close-btn" onClick={() => setModalDetalle(null)}>×</button>
              </div>

              <div className="modal-body">
                {/* Info Cliente */}
                <div className="detalle-cliente-card">
                  <div className="detalle-cliente-avatar">
                    {modalDetalle.cliente?.nombre_cliente?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div className="detalle-cliente-info">
                    <h3>{modalDetalle.cliente?.nombre_cliente || "Sin Nombre"}</h3>
                    <p>ID: {modalDetalle.cliente?.identificacion || "—"}</p>
                    <p>Asesor: {modalDetalle.usuario?.primer_nombre} {modalDetalle.usuario?.primer_apellido}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                     <span className={getEstadoClase(modalDetalle.estado)} style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>{modalDetalle.estado}</span>
                  </div>
                </div>

                {/* Lista de Productos */}
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: "1.5rem 0 1rem" }}>Productos Cotizados</h3>
                <div className="detalle-productos-lista">
                  {modalDetalle.detalle_cotizacion?.map((prod, idx) => (
                    <div key={idx} className="detalle-producto-item">
                      <div className="detalle-producto-cantidad">{prod.cantidad}</div>
                      <div className="detalle-producto-nombre">
                        <p>{prod.producto?.nombre_producto || `Producto #${prod.id_producto}`}</p>
                        <span>{formatearMoneda(prod.precio_unitario)} c/u</span>
                      </div>
                      <div className="detalle-producto-subtotal">
                        {formatearMoneda(prod.precio_unitario * prod.cantidad)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="detalle-total-banner" style={{ marginTop: "1.5rem" }}>
                  <span>Total Cotizado</span>
                  <span className="detalle-total-monto">{formatearMoneda(calcularTotal(modalDetalle))}</span>
                </div>

                {/* Controles de Estado */}
                <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0" }}>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Acciones sobre la Cotización</h3>
                  
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    {modalDetalle.estado === "Pendiente" && (
                      <>
                        <button disabled={cargandoAccion} onClick={() => handleCambiarEstado(modalDetalle.id_cotizacion, "Aprobada")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "100px", border: "none", background: "#dcfce7", color: "#16a34a", fontWeight: 700, fontSize: "0.95rem", cursor: cargandoAccion ? "wait" : "pointer" }}>
                          <CheckCircle size={18} /> Aprobar
                        </button>
                        <button disabled={cargandoAccion} onClick={() => handleCambiarEstado(modalDetalle.id_cotizacion, "Rechazada")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "100px", border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: "0.95rem", cursor: cargandoAccion ? "wait" : "pointer" }}>
                          <XCircle size={18} /> Rechazar
                        </button>
                        <button disabled={cargandoAccion} onClick={() => handleEliminar(modalDetalle.id_cotizacion)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "100px", border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: "0.95rem", cursor: cargandoAccion ? "wait" : "pointer", marginLeft: "auto" }}>
                          <Trash2 size={18} /> Eliminar
                        </button>
                      </>
                    )}
                    
                    {modalDetalle.estado !== "Pendiente" && (
                      <button disabled={cargandoAccion} onClick={() => handleCambiarEstado(modalDetalle.id_cotizacion, "Pendiente")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "100px", border: "none", background: "#fef3c7", color: "#d97706", fontWeight: 700, fontSize: "0.95rem", cursor: cargandoAccion ? "wait" : "pointer" }}>
                        <Clock size={18} /> Reabrir como Pendiente
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

