import { useState, useEffect } from "react";
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

  return (
    <Card title="Historial Completo de Ventas" className="fade-in">
      <div className="historial-cabecera">
        <div className="historial-busqueda">
          <EntradaAutocompletado 
            value={busqueda}
            onChange={setBusqueda}
            suggestions={sugerencias}
            placeholder="Buscar por cliente o producto..."
          />
        </div>
        <button className="historial-boton-exportar">
          <Download size={16} /> Exportar CSV
        </button>
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

      {/* Modal Premium para Anulación */}
      {modalDevolucion && (
        <div className="modal-overlay" onClick={() => setModalDevolucion(null)}>
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Anular Venta #{modalDevolucion.id_venta}</h3>
              <button onClick={() => setModalDevolucion(null)} className="close-btn"><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ marginBottom: '15px', color: '#4b5563', fontSize: '14px' }}>
                Estás a punto de anular la venta de <strong>{modalDevolucion.producto}</strong> al cliente <strong>{modalDevolucion.cliente}</strong>. 
                Los productos se reingresarán automáticamente al inventario.
              </p>
              
              {errorModal && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>
                  {errorModal}
                </div>
              )}

              <div className="input-group full">
                <label>Motivo de Anulación <span style={{ color: 'red' }}>*</span></label>
                <textarea 
                  value={motivo}
                  onChange={e => {
                    setMotivo(e.target.value);
                    if (e.target.value.trim() !== '') setErrorModal("");
                  }}
                  rows={3}
                  placeholder="Justifique el motivo de la anulación..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: errorModal ? '2px solid #ef4444' : '1px solid #d1d5db' }}
                />
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setModalDevolucion(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button 
                disabled={procesando}
                onClick={async () => {
                  if (motivo.trim() === '') {
                    setErrorModal("El motivo de anulación es obligatorio (FE-02)");
                    return;
                  }
                  
                  setProcesando(true);
                  try {
                    await ventasService.crearDevolucion(modalDevolucion.id_venta, motivo);
                    setModalDevolucion(null);
                    window.location.reload(); // Recarga para actualizar historial
                  } catch (e) {
                    setErrorModal("Error: " + (e.response?.data?.message || e.message));
                  } finally {
                    setProcesando(false);
                  }
                }} 
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#e74c3c', color: 'white', cursor: procesando ? 'not-allowed' : 'pointer' }}
              >
                {procesando ? 'Procesando...' : 'Confirmar Anulación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
