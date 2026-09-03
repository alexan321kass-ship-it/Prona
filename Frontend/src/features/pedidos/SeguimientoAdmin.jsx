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
        <div className="seguimiento-page">
            {/* HEADER */}
            <header className="seg-header">
                <img src={logoPronavid} alt="Pronavid" className="seg-logo" />
            </header>

            {/* BOTÓN VOLVER */}
            <button onClick={volverDashboard} className="btn-volver" title="Volver">
                <ArrowLeft size={20} />
            </button>

            {/* CONTENIDO */}
            <div className="seg-container">
                <div className="seg-card">
                    <div className="seg-card-header">
                        <h2><BarChart3 size={24} className="inline-block mr-2 text-blue-600" /> Seguimiento de Pedidos (Admin)</h2>
                    </div>

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
                                            <td className="acciones-cell">
                                                <button
                                                    onClick={() => abrirDetalle(r)}
                                                    className="btn-action btn-view"
                                                    title="Ver detalle y productos"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => abrirActualizar(r)}
                                                    className="btn-action btn-edit"
                                                    title="Actualizar estado"
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
                        <div className="resultados-conteo resultados-conteo--detallado">
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3><Pencil size={20} className="inline-block mr-2 text-blue-600" /> Actualizar Estado</h3>

                        <div className="info-pedido">
                            <p className="info-pedido__detalle">
                                <strong>Pedido:</strong> #{modalActualizar.id_pedido}
                            </p>
                            <p className="info-pedido__detalle">
                                <strong>Cliente:</strong> {modalActualizar.nombre_cliente}
                            </p>
                            <p className="info-pedido__detalle">
                                <strong>Estado actual:</strong>{" "}
                                <span className={getEstadoClase(modalActualizar.estado_pedido)}>
                                    {modalActualizar.estado_pedido}
                                </span>
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Nuevo Estado</label>
                            <select
                                value={modalActualizar.nuevoEstado}
                                onChange={(e) => setModalActualizar({
                                    ...modalActualizar,
                                    nuevoEstado: e.target.value
                                })}
                                className="seg-input"
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En proceso">En proceso</option>
                                <option value="Entregado">Entregado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>

                        {/* Preview del cambio */}
                        {modalActualizar.nuevoEstado !== modalActualizar.estado_pedido && (
                            <div className="cambio-estado-preview">
                                <span className={getEstadoClase(modalActualizar.estado_pedido)}>
                                    {modalActualizar.estado_pedido}
                                </span>
                                <span className="cambio-estado-flecha">→</span>
                                <span className={getEstadoClase(modalActualizar.nuevoEstado)}>
                                    {modalActualizar.nuevoEstado}
                                </span>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button onClick={() => setModalActualizar(null)} className="btn-secondary">
                                Cancelar
                            </button>
                            <button
                                onClick={guardarActualizacion}
                                className="btn-primary"
                                disabled={actualizando || modalActualizar.nuevoEstado === modalActualizar.estado_pedido}
                            >
                                {actualizando ? "Guardando..." : <><Save size={18} className="inline-block mr-1" /> Guardar Cambio</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
