import { useState, useEffect } from "react";
import { ArrowLeft, BarChart3, Search, Eye, Pencil, Package, ShoppingCart, AlertCircle, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ordenesService } from "./ordenes.service";
import "../../compartido/styles/seguimiento-compartido.css";
import "./pedidos.css";
import EntradaAutocompletado from "../../compartido/components/EntradaAutocompletado";
import { reportesService } from "../reportes/reportes.service";
import logoPronavid from "../../images/Logopronavid.png";

export default function SeguimientoAdmin() {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [sugerencias, setSugerencias] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
    const [modalDetalle, setModalDetalle] = useState(null);
    const [modalActualizar, setModalActualizar] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [actualizando, setActualizando] = useState(false);

    // Validación de privilegios administrativos e inicialización de sugerencias
    useEffect(() => {
        const initAdmin = async () => {
            try {
                const userRaw = localStorage.getItem("usuario");
                const user = userRaw ? JSON.parse(userRaw) : null;
                if (!user || (user.id_rol !== 1 && user.id_rol !== 3)) {
                    navigate("/DashboardAsesor", { replace: true });
                    return;
                }

                // Generar sugerencias de búsqueda desde el historial
                const history = await reportesService.getHistorial();
                if (history?.ventas) {
                    // Solo mostrar nombres de clientes únicos y válidos
                    const clientesUnicos = [
                        ...new Set(
                            history.ventas
                                .map(v => v.cliente)
                                .filter(c => c && c.trim() !== "")
                        )
                    ];
                    setSugerencias(clientesUnicos);
                }
            } catch (err) {
                console.error("Error init admin seguimiento:", err);
            }
        };
        initAdmin();
    }, [navigate]);

    const buscar = async () => {
        if (!busqueda.trim()) {
            setMensaje({ texto: "Ingresa un valor para buscar", tipo: "error" });
            return;
        }

        setCargando(true);
        setMensaje({ texto: "", tipo: "" });

        try {
            const data = await ordenesService.buscar(busqueda);
            setResultados(data || []);

            if (data.length === 0) {
                setMensaje({ texto: "No se encontraron resultados", tipo: "error" });
            }
        } catch (error) {
            console.error("Error consultando:", error);
            setMensaje({ texto: "Error de conexión con el servidor", tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    const getEstadoClase = (estado) => {
        switch (estado) {
            case "Entregado": return "estado-badge estado-entregado";
            case "En proceso": return "estado-badge estado-proceso";
            case "Pendiente": return "estado-badge estado-pendiente";
            case "Cancelado": return "estado-badge estado-cancelado";
            default: return "estado-badge";
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(precio || 0);
    };

    // Cargar detalle extendido del pedido
    const abrirDetalle = async (pedido) => {
        setCargandoDetalle(true);
        setModalDetalle({ ...pedido, productos: [], total: 0 });

        try {
            const data = await ordenesService.getDetalle(pedido.id_pedido);
            setModalDetalle({
                ...pedido,
                ...data.pedido,
                productos: data.productos || [],
                total: data.total || 0
            });
        } catch (error) {
            console.error("Error cargando detalle:", error);
        } finally {
            setCargandoDetalle(false);
        }
    };

    const abrirActualizar = (pedido) => {
        setModalActualizar({
            ...pedido,
            nuevoEstado: pedido.estado_pedido
        });
    };

    const guardarActualizacion = async () => {
        if (!modalActualizar?.nuevoEstado) {
            setMensaje({ texto: "Selecciona un estado válido", tipo: "error" });
            return;
        }

        setActualizando(true);

        try {
            await ordenesService.updateEstado(modalActualizar.id_pedido, modalActualizar.nuevoEstado);

            // Sincronizar estado en la vista local
            setResultados(resultados.map(r =>
                r.id_pedido === modalActualizar.id_pedido
                    ? { ...r, estado_pedido: modalActualizar.nuevoEstado }
                    : r
            ));

            setModalActualizar(null);
            setMensaje({ texto: `Pedido #${modalActualizar.id_pedido} actualizado a "${modalActualizar.nuevoEstado}"`, tipo: "success" });
        } catch (error) {
            console.error("Error guardando:", error);
            setMensaje({ texto: "No se pudo actualizar el estado", tipo: "error" });
        } finally {
            setActualizando(false);
        }
    };

    const volverDashboard = () => {
        navigate("/DashboardAdmin");
    };

    return (
        <div className="pedidos-pagina">
            <div className="pedidos-contenido">
                
                {/* PREMIUM HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'var(--color-primary-glass)', padding: '0.8rem', borderRadius: '14px', color: 'var(--color-primary)' }}>
                            <BarChart3 size={28} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
                                Seguimiento de Pedidos (Admin)
                            </h2>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem', fontWeight: 500 }}>
                                Administra el estado y los detalles de los pedidos
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    
                    {/* Buscador */}
                    <div className="seg-search-row">
                        <EntradaAutocompletado
                            value={busqueda}
                            onChange={setBusqueda}
                            suggestions={sugerencias}
                            onSelect={() => buscar()}
                            placeholder="Buscar por cliente o # de pedido..."
                        />
                        <button onClick={buscar} className="btn-primary seguimiento-boton-buscar" disabled={cargando}>
                            {cargando ? "Buscando..." : <><Search size={16} className="inline-block mr-1" /> Buscar</>}
                        </button>
                    </div>

                    {/* Mensaje */}
                    {mensaje.texto && (
                        <div className={`seg-mensaje ${mensaje.tipo}`}>
                            {mensaje.texto}
                        </div>
                    )}

                    {/* Tabla de resultados */}
                    <div className="seg-table-container">
                        {cargando ? (
                            <div className="seg-loading">
                                <div className="loader"></div>
                                <p>Buscando pedidos...</p>
                            </div>
                        ) : resultados.length === 0 ? (
                            <div className="seg-empty">
                                <p>Realiza una búsqueda para administrar pedidos</p>
                            </div>
                        ) : (
                            <table className="seg-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente</th>
                                        <th>Identificación</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultados.map((r) => (
                                        <tr key={r.id_pedido}>
                                            <td className="celda-negrita">#{r.id_pedido}</td>
                                            <td>{r.nombre_cliente}</td>
                                            <td>{r.identificacion || "-"}</td>
                                            <td>{formatearFecha(r.fecha_pedido)}</td>
                                            <td>
                                                <span className={getEstadoClase(r.estado_pedido)}>
                                                    {r.estado_pedido}
                                                </span>
                                            </td>
                                            <td className="acciones-cell" style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => abrirDetalle(r)}
                                                    className="btn-action btn-view"
                                                    title="Ver detalle y productos"
                                                    style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: 'none', background: '#F3F4F6', color: '#111827', cursor: 'pointer' }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => abrirActualizar(r)}
                                                    className="btn-action btn-edit"
                                                    title="Actualizar estado"
                                                    style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary-glass)', color: 'var(--color-primary)', cursor: 'pointer' }}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {resultados.length > 0 && (
                        <div className="resultados-conteo">
                            <strong>{resultados.length}</strong> pedido(s) encontrado(s)
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: VER DETALLE CON PRODUCTOS */}
            {modalDetalle && (
                <div className="modal-overlay" onClick={() => setModalDetalle(null)}>
                    <div className="modal-content modal-ancho-medio" onClick={(e) => e.stopPropagation()}>
                        <h3><Package size={20} className="inline-block mr-2 text-blue-600" /> Pedido #{modalDetalle.id_pedido}</h3>

                        {/* Info del cliente */}
                        <div className="info-pedido">
                            <div className="info-pedido__cabecera">
                                <strong>{modalDetalle.nombre_cliente}</strong>
                                <span className={getEstadoClase(modalDetalle.estado_pedido)}>
                                    {modalDetalle.estado_pedido}
                                </span>
                            </div>
                            <p className="info-pedido__detalle">
                                ID: {modalDetalle.identificacion || "-"} |
                                Tel: {modalDetalle.telefono_cliente || "-"} |
                                Fecha: {formatearFecha(modalDetalle.fecha_pedido)}
                            </p>
                        </div>

                        {/* Lista de productos */}
                        <h4 className="info-pedido__titulo-productos">
                            <ShoppingCart size={18} className="inline-block mr-2" /> Productos del Pedido
                        </h4>

                        {cargandoDetalle ? (
                            <div className="seg-loading">
                                <div className="loader"></div>
                                <p>Cargando productos...</p>
                            </div>
                        ) : modalDetalle.productos?.length > 0 ? (
                            <>
                                <table className="seg-table tabla-con-margen">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th className="celda-centrada">Cant.</th>
                                            <th className="celda-derecha">Precio</th>
                                            <th className="celda-derecha">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modalDetalle.productos.map((p, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <span className="codigo-producto">
                                                        {p.codigo_interno}
                                                    </span>
                                                    <br />
                                                    {p.nombre_producto}
                                                </td>
                                                <td className="celda-centrada celda-negrita">
                                                    {p.cantidad}
                                                </td>
                                                <td className="celda-derecha">
                                                    {formatearPrecio(p.precio_unitario)}
                                                </td>
                                                <td className="celda-derecha celda-negrita celda-total">
                                                    {formatearPrecio(p.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="total-pedido">
                                    <span className="total-pedido__monto">
                                        Total: <strong>{formatearPrecio(modalDetalle.total)}</strong>
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="aviso-vacio">
                                <p className="aviso-vacio__texto">
                                    <AlertCircle size={18} className="inline-block mr-1 text-yellow-500" /> No hay productos registrados para este pedido
                                </p>
                                <p className="aviso-vacio__subtexto">
                                    Los productos se registran al crear la cotización o venta
                                </p>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button onClick={() => setModalDetalle(null)} className="btn-secondary">
                                Cerrar
                            </button>
                            <button
                                onClick={() => {
                                    setModalDetalle(null);
                                    abrirActualizar(modalDetalle);
                                }}
                                className="btn-primary"
                            >
                                <Pencil size={18} className="inline-block mr-1" /> Cambiar Estado
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ACTUALIZAR ESTADO */}
            {modalActualizar && (
                <div className="modal-overlay" onClick={() => setModalActualizar(null)}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: '#ffffff',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '480px',
                        overflow: 'hidden',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.18)',
                        animation: 'modalSlide 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}>

                        {/* HEADER */}
                        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 2 }}>
                                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px' }}>
                                    <Pencil size={22} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cambio de Estado</p>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Pedido #{modalActualizar.id_pedido}</h2>
                                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.9rem', marginTop: '0.2rem' }}>{modalActualizar.nombre_cliente}</p>
                                </div>
                            </div>
                        </div>

                        {/* CUERPO */}
                        <div style={{ padding: '2rem' }}>

                            {/* Estado actual */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', background: '#f8fafc', borderRadius: '14px', padding: '1rem 1.25rem' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Estado actual:</p>
                                <span className={getEstadoClase(modalActualizar.estado_pedido)}>{modalActualizar.estado_pedido}</span>
                            </div>

                            {/* Selector visual de estados (pills) */}
                            <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Selecciona el nuevo estado:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {[
                                    { valor: 'Pendiente',   emoji: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)'  },
                                    { valor: 'En proceso',  emoji: '🔄', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)'  },
                                    { valor: 'Entregado',   emoji: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)'   },
                                    { valor: 'Cancelado',   emoji: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.3)'   },
                                ].map(({ valor, emoji, color, bg, border }) => {
                                    const isSelected = modalActualizar.nuevoEstado === valor;
                                    return (
                                        <button
                                            key={valor}
                                            onClick={() => setModalActualizar({ ...modalActualizar, nuevoEstado: valor })}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '16px',
                                                border: `2px solid ${isSelected ? color : 'transparent'}`,
                                                background: isSelected ? bg : '#f8fafc',
                                                cursor: 'pointer',
                                                transition: 'all 0.25s ease',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                                                boxShadow: isSelected ? `0 8px 20px ${border}` : 'none',
                                            }}
                                        >
                                            <span style={{ fontSize: '1.8rem' }}>{emoji}</span>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? color : '#475569' }}>{valor}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Preview de la transición */}
                            {modalActualizar.nuevoEstado !== modalActualizar.estado_pedido && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '14px' }}>
                                    <span className={getEstadoClase(modalActualizar.estado_pedido)}>{modalActualizar.estado_pedido}</span>
                                    <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 700 }}>→</span>
                                    <span className={getEstadoClase(modalActualizar.nuevoEstado)}>{modalActualizar.nuevoEstado}</span>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setModalActualizar(null)}
                                    style={{ flex: 1, padding: '0.9rem', borderRadius: '100px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarActualizacion}
                                    disabled={actualizando || modalActualizar.nuevoEstado === modalActualizar.estado_pedido}
                                    style={{
                                        flex: 2,
                                        padding: '0.9rem',
                                        borderRadius: '100px',
                                        border: 'none',
                                        background: (actualizando || modalActualizar.nuevoEstado === modalActualizar.estado_pedido) ? '#e2e8f0' : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                                        color: (actualizando || modalActualizar.nuevoEstado === modalActualizar.estado_pedido) ? '#94a3b8' : 'white',
                                        fontWeight: 700,
                                        cursor: (actualizando || modalActualizar.nuevoEstado === modalActualizar.estado_pedido) ? 'not-allowed' : 'pointer',
                                        fontSize: '0.95rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {actualizando ? "Guardando..." : <><Save size={16} /> Guardar Cambio</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
