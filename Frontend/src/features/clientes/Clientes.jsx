import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Users, Plus, Phone, Mail, ChevronLeft, Search, X, User, CreditCard, MapPin, ToggleLeft, ToggleRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { clientesService } from "./clientes.service";
import "../../compartido/styles/seguimiento-compartido.css";
import "./clientes.css";
import EntradaAutocompletado from "../../compartido/components/EntradaAutocompletado";
import logoPronavid from "../../images/Logopronavid.png";

const getInitials = (name) => {
    if (!name) return "CL";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export default function Clientes() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [modalForm, setModalForm] = useState(null);
    const [formData, setFormData] = useState({
        nombre_cliente: "",
        identificacion: "",
        telefono: "",
        direccion: "",
        correo: "",
        estado: true
    });
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

    // Sugerencias de busqueda
    const sugerencias = [
        ...new Set([
            ...clientes.map(c => c.nombre_cliente),
            ...clientes.map(c => c.identificacion)
        ])
    ];

    // Cargar clientes
    const cargarClientes = async () => {
        try {
            setCargando(true);
            // Cargar datos filtrados o completos
            const data = busqueda && busqueda.trim() !== "" 
                ? await clientesService.search(busqueda)
                : await clientesService.getAll();
                
            // Normalizar respuesta del servidor
            setClientes(data.clientes || data || []);
        } catch (error) {
            console.error("Error cargando clientes:", error);
            setMensaje({ texto: `Error al cargar clientes: ${error.message}`, tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    // Busqueda con retardo
    useEffect(() => {
        const timer = setTimeout(() => {
            if (busqueda !== undefined) {
                cargarClientes();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [busqueda]);

    const abrirFormulario = (cliente = null) => {
        if (cliente) {
            setFormData({
                nombre_cliente: cliente.nombre_cliente || "",
                identificacion: cliente.identificacion || "",
                telefono: cliente.telefono_cliente || "",
                direccion: cliente.direccion_cliente || "",
                correo: cliente.correo_cliente || "",
                estado: cliente.estado ?? (cliente.estado_cliente !== 'Inactivo')
            });
            setModalForm({ tipo: "editar", id: cliente.id_cliente });
        } else {
            setFormData({
                nombre_cliente: "",
                identificacion: "",
                telefono: "",
                direccion: "",
                correo: "",
                estado: true
            });
            setModalForm({ tipo: "crear" });
        }
    };

    const toggleEstadoCliente = async (cliente) => {
        try {
            const esActivo = cliente.estado !== false && cliente.estado_cliente !== 'Inactivo';
            const nuevoEstado = !esActivo;
            await clientesService.update(cliente.id_cliente, {
                nombre_cliente: cliente.nombre_cliente,
                identificacion: cliente.identificacion,
                telefono: cliente.telefono_cliente,
                direccion: cliente.direccion_cliente,
                correo: cliente.correo_cliente,
                estado: nuevoEstado
            });
            setMensaje({
                texto: `Cliente ${nuevoEstado ? 'activado' : 'inactivado'} exitosamente`,
                tipo: "success"
            });
            cargarClientes();
        } catch (error) {
            setMensaje({ texto: error.message || "Error al cambiar estado del cliente", tipo: "error" });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validarFormulario = () => {
        const nombre = formData.nombre_cliente.trim();
        const iden = formData.identificacion.trim();
        const tel = formData.telefono.trim();
        const mail = formData.correo.trim();

        if (!nombre) {
            setMensaje({ texto: "El nombre del cliente es requerido", tipo: "error" });
            return false;
        }
        if (/\d/.test(nombre)) {
            setMensaje({ texto: "El nombre del cliente no puede contener números", tipo: "error" });
            return false;
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
            setMensaje({ texto: "El nombre del cliente no permite caracteres especiales", tipo: "error" });
            return false;
        }
        if (!iden) {
            setMensaje({ texto: "La identificación es requerida", tipo: "error" });
            return false;
        }
        if (!/^[0-9-]+$/.test(iden)) {
            setMensaje({ texto: "La identificación solo puede contener números", tipo: "error" });
            return false;
        }
        if (tel && !/^\d{7,10}$/.test(tel)) {
            setMensaje({ texto: "El teléfono solo puede contener entre 7 y 10 números", tipo: "error" });
            return false;
        }
        if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
            setMensaje({ texto: "El correo electrónico no tiene un formato válido", tipo: "error" });
            return false;
        }
        return true;
    };

    const guardarCliente = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setGuardando(true);
        setMensaje({ texto: "", tipo: "" });

        try {
            if (modalForm.tipo === "editar") {
                await clientesService.update(modalForm.id, formData);
            } else {
                await clientesService.create(formData);
            }

            setMensaje({
                texto: modalForm.tipo === "editar" ? "Cliente actualizado exitosamente" : "Cliente creado exitosamente",
                tipo: "success"
            });
            setModalForm(null);
            cargarClientes();

        } catch (error) {
            setMensaje({ texto: error.message || "Error al guardar el cliente", tipo: "error" });
        } finally {
            setGuardando(false);
        }
    };

    const eliminarCliente = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este cliente?")) return;

        try {
            await clientesService.delete(id);

            setMensaje({ texto: "Cliente eliminado", tipo: "success" });
            cargarClientes();
        } catch (error) {
            setMensaje({ texto: "Error de conexión", tipo: "error" });
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
           

            {/* CONTENIDO CRM */}
            <div className="catalogo-contenido">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="catalogo-wrapper-premium"
                >
                    <div className="catalogo-header-premium">
                        <div className="catalogo-icono-titulo">
                            <div className="catalogo-icono-badge">
                                <Users size={24} />
                            </div>
                            <h2>Gestión de Clientes</h2>
                        </div>
                        <div className="catalogo-acciones-enterprise">
                            <button onClick={() => abrirFormulario()} className="btn-premium">
                                <Plus size={20} /> Nuevo Cliente
                            </button>
                        </div>
                    </div>

                    {/* Buscador */}
                    <div className="clientes-search-container">
                        <div className="catalogo-buscador">
                            <div className="catalogo-buscador__campo">
                                <Search size={20} className="catalogo-buscador__icono" />
                                <EntradaAutocompletado
                                    value={busqueda}
                                    onChange={setBusqueda}
                                    suggestions={sugerencias}
                                    placeholder="Buscar cliente por nombre o ID..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mensaje */}
                    {mensaje.texto && (
                        <div className={`seg-mensaje ${mensaje.tipo}`} style={{ marginBottom: '1.5rem' }}>
                            {mensaje.texto}
                        </div>
                    )}

                    {/* Grid CRM */}
                    {cargando ? (
                        <div className="seg-loading">
                            <div className="loader"></div>
                            <p>Cargando clientes...</p>
                        </div>
                    ) : clientes.length === 0 ? (
                        <div className="clientes-empty-state">
                            <Users size={48} />
                            <h3>No hay clientes registrados</h3>
                            <p>Comienza agregando tu primer cliente al sistema.</p>
                        </div>
                    ) : (
                        <div className="clientes-grid">
                            {clientes.map((cliente) => {
                                const esActivo = cliente.estado !== false && cliente.estado_cliente !== 'Inactivo';
                                return (
                                    <div key={cliente.id_cliente} className="cliente-card-enterprise" style={{ opacity: esActivo ? 1 : 0.75 }}>
                                        <div className="cliente-acciones-flotantes">
                                            <button 
                                                onClick={() => toggleEstadoCliente(cliente)} 
                                                className="btn-cliente-accion" 
                                                style={{
                                                    background: esActivo ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)",
                                                    color: esActivo ? "#16a34a" : "#dc2626"
                                                }}
                                                title={esActivo ? "Inactivar cliente" : "Activar cliente"}
                                            >
                                                {esActivo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                            </button>
                                            <button 
                                                onClick={() => abrirFormulario(cliente)} 
                                                className="btn-cliente-accion edit" 
                                                title="Editar"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                onClick={() => eliminarCliente(cliente.id_cliente)} 
                                                className="btn-cliente-accion delete" 
                                                title="Eliminar"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="cliente-card-header">
                                            <div className="cliente-avatar" style={{ background: esActivo ? undefined : '#9ca3af' }}>
                                                {getInitials(cliente.nombre_cliente)}
                                            </div>
                                            <div className="cliente-info-basica">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                    <h4 title={cliente.nombre_cliente} style={{ margin: 0 }}>{cliente.nombre_cliente}</h4>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                                                        background: esActivo ? "#dcfce7" : "#fee2e2",
                                                        color: esActivo ? "#166534" : "#991b1b",
                                                    }}>
                                                        {esActivo ? "Activo" : "Inactivo"}
                                                    </span>
                                                </div>
                                                <p className="cliente-identificacion">ID: {cliente.identificacion}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="cliente-datos-contacto">
                                            <div className="cliente-dato-item">
                                                <Phone size={16} className="cliente-dato-icono" />
                                                <span>{cliente.telefono_cliente || "Sin teléfono"}</span>
                                            </div>
                                            <div className="cliente-dato-item">
                                                <Mail size={16} className="cliente-dato-icono" />
                                                <span style={{ wordBreak: 'break-all' }}>{cliente.correo_cliente || "Sin correo"}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* MODAL FORMULARIO PREMIUM */}
            <AnimatePresence>
                {modalForm && (
                    <div className="modal-overlay" onClick={() => !guardando && setModalForm(null)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
                            className="modal-content" 
                            onClick={(e) => e.stopPropagation()}
                            style={{ position: 'relative' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>{modalForm.tipo === "editar" ? "Editar Cliente" : "Nuevo Cliente"}</h3>
                                <button 
                                    onClick={() => !guardando && setModalForm(null)} 
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div>
                                <form onSubmit={guardarCliente}>
                                    <div className="form-group-enterprise">
                                        <label>Nombre completo *</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="text"
                                                name="nombre_cliente"
                                                value={formData.nombre_cliente}
                                                onChange={handleChange}
                                                className="input-enterprise"
                                                placeholder="Nombre del cliente"
                                                pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"
                                                title="Solo se permiten letras en el nombre"
                                                required
                                            />
                                            <User size={18} className="input-icon" />
                                        </div>
                                        {formData.nombre_cliente && /\d/.test(formData.nombre_cliente) && (
                                            <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                                                ⚠️ El nombre no puede contener números
                                            </span>
                                        )}
                                        {formData.nombre_cliente && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre_cliente) && !/\d/.test(formData.nombre_cliente) && (
                                            <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                                                ⚠️ El nombre no permite caracteres especiales
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group-enterprise">
                                        <label>Identificación *</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="text"
                                                name="identificacion"
                                                value={formData.identificacion}
                                                onChange={handleChange}
                                                className="input-enterprise"
                                                placeholder="Número de documento (solo números)"
                                                pattern="^[0-9-]+$"
                                                title="Solo se permiten números"
                                                required
                                            />
                                            <CreditCard size={18} className="input-icon" />
                                        </div>
                                        {formData.identificacion && !/^[0-9-]+$/.test(formData.identificacion) && (
                                            <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                                                ⚠️ La identificación solo puede contener números
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group-enterprise">
                                            <label>Teléfono</label>
                                            <div className="input-with-icon">
                                                <input
                                                    type="tel"
                                                    name="telefono"
                                                    value={formData.telefono}
                                                    onChange={handleChange}
                                                    className="input-enterprise"
                                                    placeholder="7 a 10 dígitos numéricos"
                                                    pattern="^[0-9]{7,10}$"
                                                    title="Entre 7 y 10 números"
                                                />
                                                <Phone size={18} className="input-icon" />
                                            </div>
                                            {formData.telefono && !/^\d{7,10}$/.test(formData.telefono) && (
                                                <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                                                    ⚠️ Debe ser numérico (7-10 dígitos)
                                                </span>
                                            )}
                                        </div>

                                        <div className="form-group-enterprise">
                                            <label>Correo</label>
                                            <div className="input-with-icon">
                                                <input
                                                    type="email"
                                                    name="correo"
                                                    value={formData.correo}
                                                    onChange={handleChange}
                                                    className="input-enterprise"
                                                    placeholder="correo@ejemplo.com"
                                                />
                                                <Mail size={18} className="input-icon" />
                                            </div>
                                            {formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo) && (
                                                <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                                                    ⚠️ Correo electrónico inválido
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group-enterprise">
                                        <label>Dirección</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="text"
                                                name="direccion"
                                                value={formData.direccion}
                                                onChange={handleChange}
                                                className="input-enterprise"
                                                placeholder="Dirección completa"
                                            />
                                            <MapPin size={18} className="input-icon" />
                                        </div>
                                    </div>

                                    <div className="form-group-enterprise" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <label style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>Estado del Cliente</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(f => ({ ...f, estado: !f.estado }))}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: formData.estado ? '#16a34a' : '#6b7280' }}
                                        >
                                            {formData.estado ? <ToggleRight size={28} color="#16a34a" /> : <ToggleLeft size={28} color="#9ca3af" />}
                                            <span style={{ fontWeight: 600, fontSize: 13 }}>{formData.estado ? "Activo" : "Inactivo"}</span>
                                        </button>
                                    </div>

                                    <div className="modal-actions">
                                        <button
                                            type="button"
                                            onClick={() => setModalForm(null)}
                                            className="btn-outline-enterprise"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-premium"
                                            disabled={guardando}
                                        >
                                            {guardando ? "Guardando..." : "Guardar Cliente"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
