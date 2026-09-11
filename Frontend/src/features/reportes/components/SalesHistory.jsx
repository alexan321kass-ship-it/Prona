import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Search, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "./Common";
import EntradaAutocompletado from "../../../compartido/components/EntradaAutocompletado";
import { ventasService } from "../../ventas/ventas.service";
import "../reportes.css";

const REGISTROS_POR_PAGINA = 50;

export default function SalesHistory({ historial, formatearMoneda }) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalDevolucion, setModalDevolucion] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [descargando, setDescargando] = useState(false);

  // Obtener usuario activo
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  if (!usuario || !usuario.id_usuario) {
      return (
          <div className="bloqueo-sesion">
              <h2>Acceso Denegado</h2>
              <p>Debe iniciar sesión de forma obligatoria.</p>
          </div>
      );
  }

  // Generar sugerencias únicas de clientes y productos
  const sugerencias = [
    ...new Set([
      ...historial.map(v => v.cliente),
      ...historial.map(v => v.producto)
    ])
  ];

  const historialOrdenado = [...historial].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const historialFiltrado = historialOrdenado.filter(v => 
    v.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    (v.identificacion && v.identificacion.includes(busqueda))
  );

  // Reiniciar a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(historialFiltrado.length / REGISTROS_POR_PAGINA));
  const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
  const fin = inicio + REGISTROS_POR_PAGINA;
  const registrosPagina = historialFiltrado.slice(inicio, fin);

  // Generar números de página visibles (máximo 5 alrededor de la actual)
  const generarNumerosPagina = () => {
    const paginas = [];
    let desde = Math.max(1, paginaActual - 2);
    let hasta = Math.min(totalPaginas, paginaActual + 2);

    // Ajustar para siempre mostrar 5 si hay suficientes páginas
    if (hasta - desde < 4) {
      if (desde === 1) hasta = Math.min(totalPaginas, desde + 4);
      else desde = Math.max(1, hasta - 4);
    }

    for (let i = desde; i <= hasta; i++) paginas.push(i);
    return paginas;
  };

  const exportarExcel = async (datos, periodo = "todo") => {
    if (!datos || datos.length === 0) return;
    const historialParaExportar = datos;

    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = "PRONAVID";
    wb.created = new Date();

    const ws = wb.addWorksheet("Historial de Ventas", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // ── Ancho de columnas ──────────────────────────────────────────
    ws.columns = [
      { key: "fecha",    width: 14 },
      { key: "cliente",  width: 30 },
      { key: "id",       width: 20 },
      { key: "producto", width: 35 },
      { key: "cantidad", width: 12 },
      { key: "total",    width: 20 },
      { key: "estado",   width: 16 },
    ];

    // ── Fila 1: Título empresa ─────────────────────────────────────
    const rowTitulo = ws.addRow(["PRONAVID — Historial de Ventas"]);
    ws.mergeCells("A1:G1");
    const celdaTitulo = ws.getCell("A1");
    celdaTitulo.font      = { bold: true, size: 16, color: { argb: "FFFFFFFF" }, name: "Calibri" };
    celdaTitulo.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC0392B" } };
    celdaTitulo.alignment = { horizontal: "center", vertical: "middle" };
    rowTitulo.height = 32;

    // ── Fila 2: Fecha generación ───────────────────────────────────
    const fechaStr = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
    const rowFecha = ws.addRow([`Generado el: ${fechaStr}`]);
    ws.mergeCells("A2:G2");
    const celdaFecha = ws.getCell("A2");
    celdaFecha.font      = { italic: true, size: 10, color: { argb: "FFFFFFFF" }, name: "Calibri" };
    celdaFecha.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE74C3C" } };
    celdaFecha.alignment = { horizontal: "center", vertical: "middle" };
    rowFecha.height = 20;

    // ── Fila 3: Espacio ────────────────────────────────────────────
    ws.addRow([]);

    // ── Fila 4: Encabezados ────────────────────────────────────────
    const encabezados = ["Fecha", "Cliente", "Identificación", "Producto", "Cantidad", "Total (COP)", "Estado"];
    const rowEnc = ws.addRow(encabezados);
    rowEnc.height = 22;
    rowEnc.eachCell((cell) => {
      cell.font      = { bold: true, size: 11, color: { argb: "FFFFFFFF" }, name: "Calibri" };
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2C3E50" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border    = { bottom: { style: "medium", color: { argb: "FFC0392B" } } };
    });

    // ── Filas de datos con filas alternas ─────────────────────────
    const colorPar   = "FFF8F9FA"; // gris muy claro
    const colorImpar = "FFFFFFFF"; // blanco

    historialParaExportar.forEach((v, idx) => {
      const esCancelada = v.estado_venta === "Cancelada";
      const row = ws.addRow([
        new Date(v.fecha).toLocaleDateString("es-CO"),
        v.cliente || "",
        v.identificacion || "-",
        v.producto || "",
        v.cantidad,
        Number(v.total) || 0,
        v.estado_venta || "Activa",
      ]);
      row.height = 18;
      const bgColor = idx % 2 === 0 ? colorImpar : colorPar;

      row.eachCell((cell, colNum) => {
        cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.font      = { size: 10, name: "Calibri", color: { argb: esCancelada ? "FFE74C3C" : "FF2C3E50" } };
        cell.alignment = { vertical: "middle", horizontal: colNum >= 5 ? "right" : "left" };
        cell.border    = {
          bottom: { style: "hair", color: { argb: "FFE0E0E0" } },
        };
      });

      // Formato moneda en columna Total
      row.getCell(6).numFmt = '"$"#,##0';

      // Badge de estado con color
      const celdaEstado = row.getCell(7);
      if (v.estado_venta === "Cancelada") {
        celdaEstado.font = { bold: true, size: 10, color: { argb: "FFE74C3C" }, name: "Calibri" };
      } else if (v.estado_venta === "Activa") {
        celdaEstado.font = { bold: true, size: 10, color: { argb: "FF27AE60" }, name: "Calibri" };
      }
    });

    // ── Fila espacio ──────────────────────────────────────────────
    ws.addRow([]);

    // ── Fila TOTAL GENERAL ────────────────────────────────────────
    const totalGeneral = historialParaExportar.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
    const rowTotal = ws.addRow(["", "", "", "TOTAL GENERAL", "", totalGeneral, ""]);
    rowTotal.height = 22;
    ["D", "E", "F", "G"].forEach(col => {
      const cell = rowTotal.getCell(col);
      cell.font   = { bold: true, size: 12, color: { argb: "FFFFFFFF" }, name: "Calibri" };
      cell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC0392B" } };
      cell.alignment = { horizontal: col === "F" ? "right" : "center", vertical: "middle" };
    });
    rowTotal.getCell("F").numFmt = '"$"#,##0';

    // ── Descargar ─────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url    = URL.createObjectURL(blob);
    const link   = document.createElement("a");
    link.href     = url;
    link.download = `historial_ventas_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtrar historial por período para la exportación
  const filtrarPorPeriodo = (periodo) => {
    const ahora = new Date();
    return historialFiltrado.filter(v => {
      const fecha = new Date(v.fecha);
      if (periodo === "hoy") {
        return fecha.toDateString() === ahora.toDateString();
      } else if (periodo === "semana") {
        const hace7 = new Date(ahora); hace7.setDate(ahora.getDate() - 7);
        return fecha >= hace7;
      } else if (periodo === "mes") {
        const hace30 = new Date(ahora); hace30.setDate(ahora.getDate() - 30);
        return fecha >= hace30;
      }
      return true; // "todo"
    });
  };

  const seleccionarPeriodo = (periodo) => {
    setPeriodoSeleccionado(periodo);
    setShowExportMenu(false);
  };

  const triggerDescarga = async () => {
    if (!periodoSeleccionado) return;
    const datos = filtrarPorPeriodo(periodoSeleccionado);
    if (datos.length === 0) {
      alert("No hay datos en ese período para exportar.");
      setPeriodoSeleccionado(null);
      return;
    }
    setDescargando(true);
    await exportarExcel(datos, periodoSeleccionado);
    setDescargando(false);
    setPeriodoSeleccionado(null);
  };

  const PERIODOS = [
    { label: "📅 Hoy",        value: "hoy"    },
    { label: "📆 Esta semana", value: "semana" },
    { label: "🗓️ Este mes",   value: "mes"    },
    { label: "📋 Todo",        value: "todo"   },
  ];

  const periodoLabel = PERIODOS.find(p => p.value === periodoSeleccionado)?.label;

  return (
    <Card title="Historial Completo de Ventas" className="fade-in">
      {/* Botones de Filtro Rápido por Período */}
      <div className="reportes-periodo-pills">
        <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "0.4rem" }}>
          Filtro Rápido:
        </span>
        {PERIODOS.map(p => (
          <button
            key={p.value}
            type="button"
            className={`reportes-periodo-pill ${periodoSeleccionado === p.value ? 'active' : ''}`}
            onClick={() => setPeriodoSeleccionado(prev => prev === p.value ? null : p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="historial-cabecera">
        <div className="historial-busqueda">
          <EntradaAutocompletado
            value={busqueda}
            onChange={setBusqueda}
            suggestions={sugerencias}
            placeholder="Buscar por cliente o producto..."
          />
        </div>
        {/* EXPORT AREA: two-step animated flow */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end" }}>

          {/* Step 1: Botón para abrir selector */}
          <div style={{ position: "relative" }}>
            <button
              className="historial-boton-exportar"
              onClick={() => { setShowExportMenu(prev => !prev); setPeriodoSeleccionado(null); }}
              disabled={historialFiltrado.length === 0}
              style={{
                background: periodoSeleccionado
                  ? "linear-gradient(135deg, #27ae60, #2ecc71)"
                  : undefined,
                transition: "background 0.4s ease, transform 0.2s ease",
              }}
            >
              <Download size={16} />
              {periodoSeleccionado ? periodoLabel : "Exportar Excel"}
            </button>

            {showExportMenu && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.14)",
                padding: "0.5rem",
                zIndex: 9999,
                minWidth: "210px",
                animation: "modalSlide 0.25s cubic-bezier(0.175,0.885,0.32,1.275)",
              }}>
                <p style={{ margin: "0.5rem 0.75rem 0.4rem", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Selecciona el período</p>
                {PERIODOS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => seleccionarPeriodo(value)}
                    style={{
                      display: "flex", alignItems: "center",
                      width: "100%", padding: "0.65rem 0.9rem",
                      background: periodoSeleccionado === value ? "#f0fdf4" : "transparent",
                      border: "none", borderRadius: "10px", cursor: "pointer",
                      fontSize: "0.9rem", fontWeight: 600,
                      color: periodoSeleccionado === value ? "#16a34a" : "#334155",
                      transition: "all 0.15s", textAlign: "left",
                    }}
                    onMouseOver={e => e.currentTarget.style.background = periodoSeleccionado === value ? "#dcfce7" : "#f1f5f9"}
                    onMouseOut={e => e.currentTarget.style.background = periodoSeleccionado === value ? "#f0fdf4" : "transparent"}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Bотón de descarga animado (aparece tras seleccionar período) */}
          {periodoSeleccionado && (
            <button
              onClick={triggerDescarga}
              disabled={descargando}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.6rem 1.4rem",
                background: descargando
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #C0392B, #E74C3C)",
                color: descargando ? "#94a3b8" : "white",
                border: "none", borderRadius: "100px",
                fontWeight: 700, fontSize: "0.9rem", cursor: descargando ? "not-allowed" : "pointer",
                boxShadow: descargando ? "none" : "0 6px 20px rgba(192,57,43,0.35)",
                animation: "pulseIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
                transition: "all 0.3s ease",
              }}
            >
              {descargando
                ? <><span style={{ fontSize: "1rem" }}>⏳</span> Generando...</>
                : <><Download size={15} /> Descargar</>}
            </button>
          )}
        </div>
      </div>


      <div className="seg-table-container">
        <table className="seg-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th className="celda-centrada">Cant.</th>
              <th className="celda-derecha">Total</th>
              <th className="celda-centrada">Acción</th>
            </tr>
          </thead>
          <tbody>
            {registrosPagina.length > 0 ? (
              registrosPagina.map((v, i) => (
                <tr key={inicio + i}>
                  <td>{new Date(v.fecha).toLocaleDateString()}</td>
                  <td className="celda-negrita">
                    {v.cliente}
                    {v.identificacion && <span style={{display: 'block', fontSize: '0.85em', color: '#666', fontWeight: 'normal'}}>ID: {v.identificacion}</span>}
                  </td>
                  <td>{v.producto}</td>
                  <td className="celda-centrada">{v.cantidad}</td>
                  <td className="celda-total">
                    {formatearMoneda(v.total)}
                    {v.estado_venta === 'Cancelada' && (
                      <span style={{color: 'red', display: 'block', fontSize: '0.8rem'}}>Cancelada</span>
                    )}
                  </td>
                  <td className="celda-centrada">
                    {/* Control de Acceso: Asesor (id_rol === 2) no ve el botón */}
                    {usuario?.id_rol !== 2 && v.estado_venta !== 'Cancelada' && v.id_venta ? (() => {
                      const horasTranscurridas = (Date.now() - new Date(v.fecha).getTime()) / (1000 * 60 * 60);
                      const expirado = horasTranscurridas > 24;

                      return (
                        <button 
                          style={{
                            backgroundColor: expirado ? '#bdc3c7' : '#e74c3c', 
                            color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                            cursor: expirado ? 'not-allowed' : 'pointer'
                          }}
                          disabled={expirado}
                          title={expirado ? "El tiempo límite para anular ha expirado (24h)" : "Anular Venta"}
                          onClick={() => {
                            if (expirado) {
                              alert("El tiempo límite para anular ha expirado (24h)");
                              return;
                            }
                            setModalDevolucion(v);
                            setMotivo("");
                            setErrorModal("");
                          }}
                        >
                          Devolver
                        </button>
                      );
                    })() : (
                      <span style={{color: '#95a5a6', fontSize: '12px'}}>
                        {v.estado_venta === 'Cancelada' ? 'Anulada' : '-'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="celda-vacia">
                  No se encontraron resultados para tu búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación + Conteo */}
      {historialFiltrado.length > 0 && (
        <div className="historial-pie">
          <div className="historial-conteo">
            Mostrando {inicio + 1}–{Math.min(fin, historialFiltrado.length)} de {historialFiltrado.length} registros
          </div>

          {totalPaginas > 1 && (
            <div className="paginacion">
              <button
                className="paginacion__boton"
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {generarNumerosPagina().map(num => (
                <button
                  key={num}
                  className={`paginacion__numero ${num === paginaActual ? "paginacion__numero--activo" : ""}`}
                  onClick={() => setPaginaActual(num)}
                >
                  {num}
                </button>
              ))}

              <button
                className="paginacion__boton"
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Premium para Anulación — renderizado en document.body con Portal */}
      {modalDevolucion && ReactDOM.createPortal(
        <div
          onClick={() => setModalDevolucion(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "440px",
              overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.3)",
              animation: "modalSlide 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
          >
            {/* HEADER ROJO DE ALERTA */}
            <div style={{
              background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
              padding: "2rem",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-25px", right: "-25px", width: "110px", height: "110px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
              <div style={{ position: "absolute", bottom: "-15px", left: "60px", width: "60px", height: "60px", background: "rgba(255,255,255,0.07)", borderRadius: "50%" }}></div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative", zIndex: 2 }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "12px", padding: "10px", fontSize: "1.5rem" }}>
                  🔄
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.78rem", opacity: 0.8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Anulación de Venta</p>
                  <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900 }}>Venta #{modalDevolucion.id_venta}</h2>
                </div>
                <button
                  onClick={() => setModalDevolucion(null)}
                  style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* CUERPO */}
            <div style={{ padding: "1.75rem 2rem" }}>

              {/* Info del producto/cliente */}
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#991b1b", fontWeight: 600, marginBottom: "0.3rem" }}>⚠️ Esta acción es irreversible</p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#7f1d1d", lineHeight: 1.5 }}>
                  Se anulará la venta de <strong>{modalDevolucion.producto}</strong> del cliente <strong>{modalDevolucion.cliente}</strong>.
                  Los productos volverán automáticamente al inventario.
                </p>
              </div>

              {/* Error */}
              {errorModal && (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.88rem", fontWeight: 600, border: "1px solid #fca5a5" }}>
                  {errorModal}
                </div>
              )}

              {/* Textarea del motivo */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "#374151", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Motivo de Anulación <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => {
                    setMotivo(e.target.value);
                    if (e.target.value.trim() !== "") setErrorModal("");
                  }}
                  rows={3}
                  placeholder="Describe el motivo de la anulación de esta venta..."
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    borderRadius: "12px",
                    border: errorModal ? "2px solid #ef4444" : "2px solid #e5e7eb",
                    fontSize: "0.95rem",
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                    color: "#111827",
                    lineHeight: 1.5,
                    transition: "border 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.border = "2px solid #ef4444"}
                  onBlur={(e) => e.target.style.border = errorModal ? "2px solid #ef4444" : "2px solid #e5e7eb"}
                />
              </div>

              {/* Botones */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setModalDevolucion(null)}
                  style={{ flex: 1, padding: "0.9rem", borderRadius: "100px", border: "none", background: "#f1f5f9", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", transition: "all 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#e2e8f0"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#f1f5f9"}
                >
                  Cancelar
                </button>
                <button
                  disabled={procesando}
                  onClick={async () => {
                    if (motivo.trim() === "") {
                      setErrorModal("El motivo de anulación es obligatorio (FE-02)");
                      return;
                    }
                    setProcesando(true);
                    try {
                      await ventasService.crearDevolucion(modalDevolucion.id_venta, motivo);
                      setModalDevolucion(null);
                      window.location.reload();
                    } catch (e) {
                      setErrorModal("Error: " + (e.response?.data?.message || e.message));
                    } finally {
                      setProcesando(false);
                    }
                  }}
                  style={{
                    flex: 2,
                    padding: "0.9rem",
                    borderRadius: "100px",
                    border: "none",
                    background: procesando ? "#e2e8f0" : "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                    color: procesando ? "#94a3b8" : "white",
                    fontWeight: 700,
                    cursor: procesando ? "not-allowed" : "pointer",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  {procesando ? "Procesando..." : "✓ Confirmar Anulación"}
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </Card>
  );
}
