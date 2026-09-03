import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Trash2, ArrowLeft, RefreshCw } from "lucide-react";
import { api } from "../../config/api";
import CabeceraPanel from "../paneles/CabeceraPanel";
import "./cotizaciones.css";

const ESTADO_CONFIG = {
  Pendiente: { label: "Pendiente", icon: Clock, className: "estado--pendiente" },
  Aprobada:  { label: "Aprobada",  icon: CheckCircle, className: "estado--aprobada" },
  Rechazada: { label: "Rechazada", icon: XCircle, className: "estado--rechazada" },
};

function BadgeEstado({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.Pendiente;
  const Icono = cfg.icon;
  return (
    <span className={`badge-estado ${cfg.className}`}>
      <Icono size={13} />
      {cfg.label}
    </span>
  );
}

function FilaCotizacion({ cotizacion, onCambiarEstado, onEliminar }) {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);

  const formatearMoneda = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v || 0);

  const formatearFecha = (f) =>
    new Date(f).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const calcularTotal = () =>
    cotizacion.detalle_cotizacion?.reduce((acc, d) => acc + Number(d.precio_unitario) * d.cantidad, 0) || 0;

  const handleCambiarEstado = async (nuevoEstado) => {
    setCargando(true);
    await onCambiarEstado(cotizacion.id_cotizacion, nuevoEstado);
    setCargando(false);
  };

  return (
    <div className={`cot-fila ${abierto ? "cot-fila--abierta" : ""}`}>
      {/* Cabecera de la fila */}
      <div className="cot-fila__cabecera" onClick={() => setAbierto(!abierto)}>
        <div className="cot-fila__info">
          <span className="cot-fila__id">#{cotizacion.id_cotizacion}</span>
          <div>
            <p className="cot-fila__cliente">{cotizacion.cliente?.nombre_cliente || "—"}</p>
            <p className="cot-fila__meta">{cotizacion.cliente?.identificacion} · {formatearFecha(cotizacion.fecha_cotizacion)}</p>
          </div>
        </div>
        <div className="cot-fila__derecha">
          <p className="cot-fila__total">{formatearMoneda(calcularTotal())}</p>
          <BadgeEstado estado={cotizacion.estado} />
          <p className="cot-fila__items">{cotizacion.detalle_cotizacion?.length || 0} producto(s)</p>
          {abierto ? <ChevronUp size={18} className="cot-fila__chevron" /> : <ChevronDown size={18} className="cot-fila__chevron" />}
        </div>
      </div>

      {/* Detalle expandido */}
      {abierto && (
        <div className="cot-fila__detalle">
          <p className="cot-fila__asesor">
            Asesor: <strong>{cotizacion.usuario?.primer_nombre} {cotizacion.usuario?.primer_apellido}</strong>
          </p>
          <table className="cot-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th className="text-center">Cantidad</th>
                <th className="text-right">Precio Unit.</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cotizacion.detalle_cotizacion?.map((d) => (
                <tr key={d.id_detalle_cotizacion}>
                  <td>{d.producto?.nombre_producto || d.id_producto}</td>
                  <td className="text-muted">{d.producto?.codigo_interno || "—"}</td>
                  <td className="text-center">{d.cantidad}</td>
                  <td className="text-right">{formatearMoneda(d.precio_unitario)}</td>
                  <td className="text-right">{formatearMoneda(Number(d.precio_unitario) * d.cantidad)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right"><strong>Total</strong></td>
                <td className="text-right cot-total">{formatearMoneda(calcularTotal())}</td>
              </tr>
            </tfoot>
          </table>

          {/* Acciones de estado */}
          <div className="cot-fila__acciones">
            {cotizacion.estado === "Pendiente" && (
              <>
                <button
                  className="btn-accion btn-accion--aprobar"
                  disabled={cargando}
                  onClick={() => handleCambiarEstado("Aprobada")}
                >
                  <CheckCircle size={15} /> Aprobar
                </button>
                <button
                  className="btn-accion btn-accion--rechazar"
                  disabled={cargando}
                  onClick={() => handleCambiarEstado("Rechazada")}
                >
                  <XCircle size={15} /> Rechazar
                </button>
                <button
                  className="btn-accion btn-accion--eliminar"
                  disabled={cargando}
                  onClick={() => onEliminar(cotizacion.id_cotizacion)}
                >
                  <Trash2 size={15} /> Eliminar
                </button>
              </>
            )}
            {cotizacion.estado !== "Pendiente" && (
              <button
                className="btn-accion btn-accion--pendiente"
                disabled={cargando}
                onClick={() => handleCambiarEstado("Pendiente")}
              >
                <Clock size={15} /> Reabrir como Pendiente
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistorialCotizaciones() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mensaje, setMensaje] = useState(null);

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
    try {
      await api.put(`/cotizaciones/${id}/estado`, { estado: nuevoEstado });
      setCotizaciones(prev =>
        prev.map(c => c.id_cotizacion === id ? { ...c, estado: nuevoEstado } : c)
      );
      setMensaje({ texto: `Cotización #${id} marcada como ${nuevoEstado}`, tipo: "success" });
    } catch (e) {
      setMensaje({ texto: e.message || "Error al cambiar estado", tipo: "error" });
    }
    setTimeout(() => setMensaje(null), 3000);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm(`¿Eliminar la cotización #${id}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/cotizaciones/${id}`);
      setCotizaciones(prev => prev.filter(c => c.id_cotizacion !== id));
      setMensaje({ texto: `Cotización #${id} eliminada`, tipo: "success" });
    } catch (e) {
      setMensaje({ texto: e.message || "Error al eliminar", tipo: "error" });
    }
    setTimeout(() => setMensaje(null), 3000);
  };

  const cotizacionesFiltradas = filtroEstado === "Todos"
    ? cotizaciones
    : cotizaciones.filter(c => c.estado === filtroEstado);

  const contarEstado = (e) => cotizaciones.filter(c => c.estado === e).length;

  return (
    <>
      {/* Contenido principal */}

      <div className="cot-page">
        {/* Header */}
        <div className="cot-header">
          <button className="btn-volver" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Volver
          </button>
          <div className="cot-header__titulo">
            <FileText size={28} color="var(--color-primary)" />
            <div>
              <h1>Historial de Cotizaciones</h1>
              <p>{cotizaciones.length} cotización(es) en total</p>
            </div>
          </div>
          <button className="btn-refrescar" onClick={cargarCotizaciones} title="Recargar">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Resumen de estados */}
        <div className="cot-resumen">
          {[
            { label: "Todos", count: cotizaciones.length },
            { label: "Pendiente", count: contarEstado("Pendiente") },
            { label: "Aprobada",  count: contarEstado("Aprobada") },
            { label: "Rechazada", count: contarEstado("Rechazada") },
          ].map(({ label, count }) => (
            <button
              key={label}
              className={`cot-resumen__chip ${filtroEstado === label ? "active" : ""}`}
              onClick={() => setFiltroEstado(label)}
            >
              {label}
              <span className="cot-resumen__badge">{count}</span>
            </button>
          ))}
        </div>

        {/* Mensaje de feedback */}
        {mensaje && (
          <div className={`cot-mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Lista */}
        <div className="cot-lista">
          {cargando ? (
            [1, 2, 3].map(i => <div key={i} className="cot-skeleton" />)
          ) : cotizacionesFiltradas.length === 0 ? (
            <div className="cot-vacio">
              <FileText size={60} color="var(--color-text-light)" />
              <p>No hay cotizaciones {filtroEstado !== "Todos" ? `en estado "${filtroEstado}"` : "registradas"}</p>
            </div>
          ) : (
            cotizacionesFiltradas.map(c => (
              <FilaCotizacion
                key={c.id_cotizacion}
                cotizacion={c}
                onCambiarEstado={handleCambiarEstado}
                onEliminar={handleEliminar}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
