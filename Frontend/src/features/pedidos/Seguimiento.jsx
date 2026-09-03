import { useState, useEffect } from "react";
import { ArrowLeft, Package, Eye, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config/api";
import "../../compartido/styles/seguimiento-compartido.css";
import "./pedidos.css";
import EntradaAutocompletado from "../../compartido/components/EntradaAutocompletado";
import logoPronavid from "../../images/Logopronavid.png";

export default function Seguimiento() {
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [sugerencias, setSugerencias] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
    const [modalDetalle, setModalDetalle] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const navigate = useNavigate();

    const cargarTodos = async () => {
        try {
            setCargando(true);
            setMensaje({ texto: "", tipo: "" });
            const { api } = await import("../../config/api");
            const res = await api.get("/pedidos?limite=100");
            if (res && res.pedidos) {
                setResultados(res.pedidos);
            }
        } catch (error) {
            console.error("Error cargando todos:", error);
        } finally {
            setCargando(false);
        }
    };

    // Inicialización de vista y validación de seguridad
    useEffect(() => {
        const initSeguimiento = async () => {
            try {
                const userRaw = localStorage.getItem("usuario");
                const user = userRaw ? JSON.parse(userRaw) : null;
                if (!user || ![1, 2, 3].includes(user.id_rol)) {
                    navigate("/login", { replace: true, state: { error: "Acceso no autorizado" } });
                    return;
                }

                // Obtener sugerencias para el buscador
                const { api } = await import("../../config/api");
                const data = await api.get("/seguimiento/sugerencias");
                if (data && Array.isArray(data)) {
                    setSugerencias(data);
                }

                // Carga inicial del listado
                await cargarTodos();
            } catch (err) {
                console.error("Error init seguimiento:", err);
            }
        };
        initSeguimiento();
    }, [navigate]);

    const buscar = async () => {
        if (!busqueda.trim()) {
            setMensaje({ texto: "El ID del pedido es obligatorio", tipo: "error" });
            setResultados([]);
            return;
        }

        setCargando(true);
        setMensaje({ texto: "", tipo: "" });

        try {
            const { api } = await import("../../config/api");
            const data = await api.get(`/seguimiento/buscar?query=${encodeURIComponent(busqueda)}`);
            setResultados(data || []);

            if (data.length === 0) {
                setMensaje({ texto: "El pedido no fue encontrado", tipo: "error" });
            }
        } catch (error) {
            console.error("Error consultando:", error);
            setMensaje({ texto: "Error de conexión", tipo: "error" });
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

    const abrirDetalle = async (pedido) => {
        setCargandoDetalle(true);
        setModalDetalle({ ...pedido, productos: [], total: 0 });

        try {
            const { api } = await import("../../config/api");
            const data = await api.get(`/seguimiento/detalle/${pedido.id_pedido}`);

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

    const volverDashboard = () => {
        try {
            const user = JSON.parse(localStorage.getItem("usuario"));
            if (user?.id_rol === 1 || user?.id_rol === 3) {
                navigate("/DashboardAdmin");
            } else {
                navigate("/DashboardAsesor");
            }
        } catch {
            navigate(-1);
        }
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
                        <h2><Package size={24} className="inline-block mr-2 text-blue-600" /> Seguimiento de Pedidos</h2>
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
                            {cargando ? "Buscando..." : "🔍 Buscar"}
                        </button>
                    </div>

                    {/* Mensaje */}
                    {mensaje.texto && (
                        <div className={`seg-mensaje ${mensaje.tipo}`}>
                            {mensaje.texto}
                        </div>
                    )}

                    {/* Tabla */}
                    <div className="seg-table-container">
                        {cargando ? (
                            <div className="seg-loading">
                                <div className="loader"></div>
                                <p>Buscando pedidos...</p>
                            </div>
                        ) : resultados.length === 0 ? (
                            <div className="seg-empty">
                                <p>Ingresa el nombre del cliente, identificación o número de pedido</p>
                            </div>
                        ) : (
                            <table className="seg-table">
                                <thead>
                                    <tr>
                                        <th>Pedido</th>
                                        <th>Cliente</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Detalle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultados.map((r) => (
                                        <tr key={r.id_pedido}>
                                            <td className="celda-negrita">#{r.id_pedido}</td>
                                            <td>{r.nombre_cliente}</td>
                                            <td>{formatearFecha(r.fecha_pedido)}</td>
                                            <td>
                                                <span className={getEstadoClase(r.estado_pedido)}>
                                                    {r.estado_pedido}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => abrirDetalle(r)}
                                                    className="btn-action btn-view"
                                                    title="Ver productos"
                                                >
                                                    <Eye size={16} /> Ver
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
                                    ⚠️ No hay productos registrados para este pedido
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
