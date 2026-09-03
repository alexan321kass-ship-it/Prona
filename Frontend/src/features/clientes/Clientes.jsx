import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { clientesService } from "./clientes.service";
import "../../compartido/styles/seguimiento-compartido.css";
import EntradaAutocompletado from "../../compartido/components/EntradaAutocompletado";
import logoPronavid from "../../images/Logopronavid.png";

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
        correo: ""
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
            setMensaje({ texto: "Error al cargar clientes", tipo: "error" });
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
                correo: cliente.correo_cliente || ""
            });
            setModalForm({ tipo: "editar", id: cliente.id_cliente });
        } else {
            setFormData({
                nombre_cliente: "",
                identificacion: "",
                telefono: "",
                direccion: "",
                correo: ""
            });
            setModalForm({ tipo: "crear" });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const guardarCliente = async (e) => {
        e.preventDefault();

        if (!formData.nombre_cliente.trim() || !formData.identificacion.trim()) {
            setMensaje({ texto: "Nombre e identificación son requeridos", tipo: "error" });
            return;
        }

        setGuardando(true);
        setMensaje({ texto: "", tipo: "" });

        try {
            if (modalForm.tipo === "editar") {
                await clientesService.update(modalForm.id, formData);
            } else {
                await clientesService.create(formData);
            }

            setMensaje({
                texto: modalForm.tipo === "editar" ? "Cliente actualizado" : "Cliente creado",
                tipo: "success"
            });
            setModalForm(null);
            cargarClientes();

        } catch (error) {
            setMensaje({ texto: "Error de conexión", tipo: "error" });
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
                        <h2>Gestión de Clientes</h2>
                        <button
                            onClick={() => abrirFormulario()}
                            className="btn-primary"
                        >
                            + Nuevo Cliente
                        </button>
                    </div>

                    {/* Buscador */}
                    <div className="seg-search-row">
                        <EntradaAutocompletado
                            value={busqueda}
                            onChange={setBusqueda}
                            suggestions={sugerencias}
                            placeholder="Buscar por nombre o identificación..."
                        />
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
                                <p>Cargando clientes...</p>
                            </div>
                        ) : clientes.length === 0 ? (
                            <div className="seg-empty">
                                <p>No se encontraron clientes</p>
                            </div>
                        ) : (
                            <table className="seg-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Identificación</th>
                                        <th>Teléfono</th>
                                        <th>Correo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.map((cliente) => (
                                        <tr key={cliente.id_cliente}>
                                            <td>{cliente.id_cliente}</td>
                                            <td>{cliente.nombre_cliente}</td>
                                            <td>{cliente.identificacion}</td>
                                            <td>{cliente.telefono_cliente || "-"}</td>
                                            <td>{cliente.correo_cliente || "-"}</td>
                                            <td className="acciones-cell">
                                                <button
                                                    onClick={() => abrirFormulario(cliente)}
                                                    className="btn-action btn-edit"
                                                    title="Editar"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => eliminarCliente(cliente.id_cliente)}
                                                    className="btn-action btn-delete"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL FORMULARIO */}
            {modalForm && (
                <div className="modal-overlay" onClick={() => setModalForm(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{modalForm.tipo === "editar" ? "Editar Cliente" : "Nuevo Cliente"}</h3>

                        <form onSubmit={guardarCliente}>
                            <div className="form-group">
                                <label>Nombre completo *</label>
                                <input
                                    type="text"
                                    name="nombre_cliente"
                                    value={formData.nombre_cliente}
                                    onChange={handleChange}
                                    className="seg-input"
                                    placeholder="Nombre del cliente"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Identificación *</label>
                                <input
                                    type="text"
                                    name="identificacion"
                                    value={formData.identificacion}
                                    onChange={handleChange}
                                    className="seg-input"
                                    placeholder="Número de documento"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="seg-input"
                                        placeholder="Teléfono"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Correo</label>
                                    <input
                                        type="email"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        className="seg-input"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Dirección</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    className="seg-input"
                                    placeholder="Dirección completa"
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setModalForm(null)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={guardando}
                                >
                                    {guardando ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
