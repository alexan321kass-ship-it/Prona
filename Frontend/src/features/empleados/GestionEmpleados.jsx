import { useState, useEffect } from "react";
import { UserPlus, UserX, UserCheck, KeyRound, Pencil, X, Users, ShieldAlert, CheckCircle } from "lucide-react";
import { servicioEmpleados } from "./empleados.service";
import Registro from "../autenticacion/Registro";
import EditarEmpleado from "./EditarEmpleado";
import "../../compartido/styles/seguimiento-compartido.css";
import "./empleados.css";

export default function GestionEmpleados() {
    const [empleados, setEmpleados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [empleadoEditando, setEmpleadoEditando] = useState(null);
    const [mensajeFlash, setMensajeFlash] = useState(null);

    const cargarEmpleados = async () => {
        try {
            setCargando(true);
            const data = await servicioEmpleados.obtenerTodos();
            const dataOrdenada = data.sort((a, b) => {
                if (a.estado === b.estado) return 0;
                return a.estado ? -1 : 1;
            });
            setEmpleados(dataOrdenada);
        } catch (err) {
            setError("Error al cargar empleados");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarEmpleados();
    }, []);

    const handleToggleEstado = async (id, estadoActual) => {
        try {
            await servicioEmpleados.cambiarEstado(id, !estadoActual);
            setMensajeFlash({ tipo: "success", texto: "Estado actualizado correctamente" });
            cargarEmpleados();
        } catch (err) {
            setMensajeFlash({ tipo: "error", texto: "Error al actualizar estado" });
        }
        setTimeout(() => setMensajeFlash(null), 3000);
    };

    const handleResetPassword = async (id) => {
        if (!window.confirm("¿Estás seguro de restablecer la contraseña de este empleado? Se le generará una clave temporal.")) return;
        
        try {
            const res = await servicioEmpleados.resetPassword(id);
            alert(`Contraseña temporal generada: ${res.tempPassword}\n\nPor favor cópiala y entrégala al empleado.`);
            cargarEmpleados();
        } catch (err) {
            console.error(err);
            setMensajeFlash({ tipo: "error", texto: `Error: ${err.message}` });
            setTimeout(() => setMensajeFlash(null), 3000);
        }
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setEmpleadoEditando(null);
    };

    const onRegistroExitoso = () => {
        cerrarModal();
        setMensajeFlash({ tipo: "success", texto: "Usuario guardado exitosamente" });
        cargarEmpleados();
        setTimeout(() => setMensajeFlash(null), 3000);
    };

    const handleEditar = (emp) => {
        setEmpleadoEditando(emp);
        setMostrarModal(true);
    };

    const totalEmpleados = empleados.length;
    const activos = empleados.filter(e => e.estado).length;
    const inactivos = totalEmpleados - activos;
    const admins = empleados.filter(e => e.rol?.nombre_rol?.toLowerCase() === 'administrador').length;

    const STATS = [
        { label: "Total Empleados", count: totalEmpleados, icon: <Users size={24} />, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
        { label: "Activos",         count: activos,        icon: <CheckCircle size={24} />, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
        { label: "Inactivos",       count: inactivos,      icon: <X size={24} />, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
        { label: "Administradores", count: admins,         icon: <ShieldAlert size={24} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    ];

    return (
        <div className="pedidos-pagina">
            <div className="pedidos-contenido fade-in">
                
                {/* Cabecera Premium */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ background: "var(--color-primary-glass)", padding: "0.8rem", borderRadius: "14px", color: "var(--color-primary)" }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1e293b", margin: "0 0 0.2rem 0", letterSpacing: "-0.03em" }}>Gestión de Empleados</h1>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "1.05rem" }}>Administra los accesos y credenciales de tu equipo</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setMostrarModal(true)} 
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.4rem", borderRadius: "100px", border: "none", background: "var(--color-primary)", color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(192,57,43,0.3)", transition: "all 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.transform = "scale(1.03)"}
                        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                        <UserPlus size={20} /> Añadir Empleado
                    </button>
                </div>

                {/* Tarjetas de Estadísticas */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                    {STATS.map(s => (
                        <div key={s.label} style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                            <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {s.icon}
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{s.count}</p>
                                <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mensaje Flash */}
                {mensajeFlash && (
                    <div style={{
                        padding: "1rem 1.5rem", borderRadius: "16px", fontWeight: 600, fontSize: "0.95rem",
                        marginBottom: "2rem", animation: "modalSlide 0.3s ease",
                        background: mensajeFlash.tipo === "success" ? "#dcfce7" : "#fee2e2",
                        color: mensajeFlash.tipo === "success" ? "#16a34a" : "#dc2626",
                        border: `1px solid ${mensajeFlash.tipo === "success" ? "#bbf7d0" : "#fecaca"}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            {mensajeFlash.tipo === "success" ? <CheckCircle size={20} /> : <X size={20} />} 
                            {mensajeFlash.texto}
                        </div>
                        <button onClick={() => setMensajeFlash(null)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", opacity: 0.7 }}>
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Tabla de Empleados */}
                <div className="seg-table-container">
                    <table className="seg-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Documento</th>
                                <th>Correo</th>
                                <th className="celda-centrada">Rol</th>
                                <th className="celda-centrada">Estado</th>
                                <th className="celda-centrada">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando ? (
                                <tr><td colSpan="6" className="celda-centrada" style={{ padding: "3rem", color: "#64748b" }}>Cargando empleados...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="celda-centrada" style={{ padding: "3rem", color: "#dc2626" }}>{error}</td></tr>
                            ) : (
                                empleados.map((emp) => (
                                    <tr key={emp.id_usuario} style={{ opacity: emp.estado ? 1 : 0.6 }}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #1e293b, #334155)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem" }}>
                                                    {emp.primer_nombre.charAt(0)}{emp.primer_apellido.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: 700, color: "#1e293b" }}>{emp.primer_nombre} {emp.primer_apellido}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: "#64748b", fontWeight: 500 }}>{emp.tipo_documento} {emp.numero_documento}</td>
                                        <td style={{ color: "#64748b", fontWeight: 500 }}>{emp.correo}</td>
                                        <td className="celda-centrada">
                                            <span style={{
                                                padding: "0.3rem 0.8rem", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 700,
                                                background: emp.rol?.nombre_rol?.toLowerCase() === 'administrador' ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)",
                                                color: emp.rol?.nombre_rol?.toLowerCase() === 'administrador' ? "#d97706" : "#2563eb",
                                                border: `1px solid ${emp.rol?.nombre_rol?.toLowerCase() === 'administrador' ? "rgba(245,158,11,0.3)" : "rgba(59,130,246,0.3)"}`
                                            }}>
                                                {emp.rol?.nombre_rol || "Asesor"}
                                            </span>
                                        </td>
                                        <td className="celda-centrada">
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                                                padding: "0.3rem 0.8rem", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 700,
                                                background: emp.estado ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                                                color: emp.estado ? "#16a34a" : "#dc2626",
                                                border: `1px solid ${emp.estado ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`
                                            }}>
                                                {emp.estado ? <UserCheck size={12} /> : <UserX size={12} />}
                                                {emp.estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="celda-centrada">
                                            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                                                <button 
                                                    onClick={() => handleEditar(emp)}
                                                    className="btn-accion-emp btn-edit-emp"
                                                    title="Editar Empleado"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleResetPassword(emp.id_usuario)}
                                                    className="btn-accion-emp btn-key-emp"
                                                    title="Restablecer Contraseña"
                                                >
                                                    <KeyRound size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleEstado(emp.id_usuario, emp.estado)}
                                                    className={`btn-accion-emp ${emp.estado ? 'btn-deactivate-emp' : 'btn-activate-emp'}`}
                                                    title={emp.estado ? "Desactivar Empleado" : "Activar Empleado"}
                                                >
                                                    {emp.estado ? <UserX size={16} /> : <UserCheck size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Modal de Registro / Edición */}
            {mostrarModal && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content modal-empleado" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-gradient" style={{ padding: "2rem", marginBottom: "0", borderRadius: "16px 16px 0 0", flexShrink: 0 }}>
                            <div className="modal-header-icon" style={{ width: "48px", height: "48px" }}>
                                {empleadoEditando ? <Pencil size={24} /> : <UserPlus size={24} />}
                            </div>
                            <div>
                                <p className="modal-header-subtitle">{empleadoEditando ? "Edición" : "Nuevo Ingreso"}</p>
                                <h2 className="modal-header-title" style={{ fontSize: "1.5rem" }}>{empleadoEditando ? "Editar Empleado" : "Registrar Empleado"}</h2>
                            </div>
                            <button className="modal-close-btn" onClick={cerrarModal}>×</button>
                        </div>
                        
                        <div className="modal-body" style={{ padding: "2rem", background: "var(--color-bg)", overflowY: "auto" }}>
                            {empleadoEditando ? (
                                <EditarEmpleado 
                                    empleado={empleadoEditando} 
                                    onCancel={cerrarModal} 
                                    onSuccess={onRegistroExitoso} 
                                />
                            ) : (
                                <Registro 
                                    isModal={true} 
                                    onSuccess={onRegistroExitoso} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
