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
        <div className="pedidos-pagina">
            <div className="pedidos-contenido">
                
                {/* PREMIUM HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'var(--color-primary-glass)', padding: '0.8rem', borderRadius: '14px', color: 'var(--color-primary)' }}>
                            <Package size={28} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
                                Seguimiento de Pedidos
                            </h2>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem', fontWeight: 500 }}>
                                Consulta el estado y detalle de los pedidos de los clientes
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
                                                    style={{ padding: '0.4rem 1rem', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: '#F3F4F6', color: '#111827', fontWeight: 600, transition: 'all 0.2s' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#E5E7EB'; e.currentTarget.style.transform = 'scale(1.05)' }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.transform = 'scale(1)' }}
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
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: '#ffffff',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '580px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.18)',
                        animation: 'modalSlide 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}>

                        {/* HEADER DEL MODAL */}
                        <div style={{
                            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)`,
                            padding: '2rem',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* Decorative circles */}
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                            <div style={{ position: 'absolute', bottom: '-20px', right: '80px', width: '70px', height: '70px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }}></div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '10px' }}>
                                        <Package size={26} />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pedido</p>
                                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>#{modalDetalle.id_pedido}</h2>
                                    </div>
                                </div>
                                <span style={{
                                    background: 'rgba(255,255,255,0.25)',
                                    color: 'white',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '100px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    backdropFilter: 'blur(8px)',
                                }}>
                                    {modalDetalle.estado_pedido}
                                </span>
                            </div>

                            {/* Info del cliente dentro del header */}
                            <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 2 }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                                    {modalDetalle.nombre_cliente?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{modalDetalle.nombre_cliente}</p>
                                    <p style={{ margin: 0, opacity: 0.75, fontSize: '0.85rem' }}>Fecha: {formatearFecha(modalDetalle.fecha_pedido)}</p>
                                </div>
                            </div>
                        </div>

                        {/* CUERPO DEL MODAL */}
                        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flexGrow: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShoppingCart size={16} /> Productos del Pedido
                            </p>

                            {cargandoDetalle ? (
                                <div className="seg-loading">
                                    <div className="loader"></div>
                                    <p>Cargando productos...</p>
                                </div>
                            ) : modalDetalle.productos?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {modalDetalle.productos.map((p, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: '#f8fafc',
                                            borderRadius: '14px',
                                            padding: '1rem 1.25rem',
                                            border: '1px solid #f1f5f9',
                                            transition: 'all 0.2s ease',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {/* Badge de cantidad */}
                                                <div style={{
                                                    background: 'var(--color-primary-glass)',
                                                    color: 'var(--color-primary)',
                                                    borderRadius: '10px',
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 900,
                                                    fontSize: '1rem',
                                                    flexShrink: 0,
                                                }}>
                                                    {p.cantidad}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{p.nombre_producto}</p>
                                                    {p.codigo_interno && <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>{p.codigo_interno}</p>}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <p style={{ margin: 0, fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>{formatearPrecio(p.subtotal)}</p>
                                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.78rem' }}>{formatearPrecio(p.precio_unitario)} c/u</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="aviso-vacio">
                                    <p className="aviso-vacio__texto">⚠️ No hay productos registrados para este pedido</p>
                                    <p className="aviso-vacio__subtexto">Los productos se registran al crear la cotización o venta</p>
                                </div>
                            )}
                        </div>

                        {/* FOOTER DEL MODAL */}
                        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
                            {modalDetalle.total > 0 && (
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total del Pedido</p>
                                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{formatearPrecio(modalDetalle.total)}</p>
                                </div>
                            )}
                            <button
                                onClick={() => setModalDetalle(null)}
                                style={{
                                    padding: '0.7rem 2rem',
                                    borderRadius: '100px',
                                    border: 'none',
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    marginLeft: 'auto',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
