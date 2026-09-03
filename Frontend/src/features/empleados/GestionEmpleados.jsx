import { useState, useEffect } from "react";
import { UserPlus, UserX, UserCheck, KeyRound, Pencil, X } from "lucide-react";
import { servicioEmpleados } from "./empleados.service";
import Registro from "../autenticacion/Registro";
import EditarEmpleado from "./EditarEmpleado";
import CabeceraPanel from "../paneles/CabeceraPanel";
import PiePanel from "../paneles/PiePanel";
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
    };

    const handleResetPassword = async (id) => {
        if (!window.confirm("¿Estás seguro de restablecer la contraseña de este empleado? Se le generará una clave temporal.")) return;
        
        try {
            const res = await servicioEmpleados.resetPassword(id);
            alert(`Contraseña temporal generada: ${res.tempPassword}\n\nPor favor cópiala y entrégala al empleado.`);
            cargarEmpleados();
        } catch (err) {
            setMensajeFlash({ tipo: "error", texto: "Error al restablecer contraseña" });
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
    };

    const handleEditar = (emp) => {
        setEmpleadoEditando(emp);
        setMostrarModal(true);
    };

    return (
        <>
            {/* Contenido principal */}
            <main className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
                <div className="encabezado-gestion">
                    <div>
                        <h2>Gestión de Empleados</h2>
                        <p className="subtitulo">Administra los accesos y credenciales de tu equipo</p>
                    </div>
                    <button className="btn-premium" onClick={() => setMostrarModal(true)}>
                        <UserPlus size={18} />
                        Añadir Empleado
                    </button>
                </div>

                {mensajeFlash && (
                    <div className={`mensaje ${mensajeFlash.tipo}`} style={{ marginBottom: '1rem' }}>
                        {mensajeFlash.texto}
                        <button style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setMensajeFlash(null)}>x</button>
                    </div>
                )}

                <div className="tabla-contenedor fade-in">
                    {cargando ? (
                        <p className="loading-text">Cargando datos...</p>
                    ) : error ? (
                        <p className="error-text">{error}</p>
                    ) : (
                        <table className="tabla-empleados">
                            <thead>
                                <tr>
                                    <th>Nombre Completo</th>
                                    <th>Documento</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empleados.map((emp) => (
                                    <tr key={emp.id_usuario} className={!emp.estado ? "fila-inactiva" : ""}>
                                        <td>{emp.primer_nombre} {emp.primer_apellido}</td>
                                        <td>{emp.tipo_documento} {emp.numero_documento}</td>
                                        <td>{emp.correo}</td>
                                        <td>
                                            <span className={`badge-rol ${emp.rol.nombre_rol.toLowerCase()}`}>
                                                {emp.rol.nombre_rol}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge-estado ${emp.estado ? 'activo' : 'inactivo'}`}>
                                                {emp.estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="acciones-celda">
                                            <button 
                                                className="btn-accion btn-edit"
                                                title="Editar"
                                                onClick={() => handleEditar(emp)}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button 
                                                className="btn-accion btn-key"
                                                title="Restablecer Contraseña"
                                                onClick={() => handleResetPassword(emp.id_usuario)}
                                            >
                                                <KeyRound size={16} />
                                            </button>
                                            <button 
                                                className={`btn-accion ${emp.estado ? 'btn-deactivate' : 'btn-activate'}`}
                                                title={emp.estado ? "Inactivar" : "Activar"}
                                                onClick={() => handleToggleEstado(emp.id_usuario, emp.estado)}
                                            >
                                                {emp.estado ? <UserX size={16} /> : <UserCheck size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
            <PiePanel />

            {/* Modal de Registro / Edición */}
            {mostrarModal && (
                <div className="modal-overlay fade-in">
                    <div className="modal-content glass-card slide-up">
                        <button className="btn-cerrar-modal" onClick={cerrarModal} style={{ zIndex: 10 }}>
                            <X size={24} />
                        </button>
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
            )}
        </>
    );
}
