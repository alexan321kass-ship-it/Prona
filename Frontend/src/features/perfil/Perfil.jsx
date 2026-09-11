import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, ClipboardList, Pencil, LogOut, Lock, Save } from "lucide-react";
import { API_BASE } from "../../config/api";
import { usuariosService } from "../autenticacion/usuarios.service";
import { servicioAutenticacion } from "../autenticacion/autenticacion.service";
import "../../compartido/styles/seguimiento-compartido.css";
import "./perfil.css";
import logoPronavid from "../../images/Logopronavid.png";

export default function Perfil() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [formData, setFormData] = useState({
        primer_nombre: "",
        primer_apellido: "",
        correo: "",
        contrasena_actual: "",
        contrasena_nueva: "",
        confirmar_contrasena: ""
    });
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
    const [modoEdicion, setModoEdicion] = useState(false);
    const [cambiarPassword, setCambiarPassword] = useState(false);

    // Recuperar datos de sesión del usuario
    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem("usuario"));
            if (!user) {
                navigate("/login", { replace: true });
                return;
            }
            setUsuario(user);
            setFormData(prev => ({
                ...prev,
                primer_nombre: user.primer_nombre || "",
                primer_apellido: user.primer_apellido || "",
                correo: user.correo || ""
            }));
            setCargando(false);
        } catch {
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const volverDashboard = () => {
        if (usuario?.id_rol === 1 || usuario?.id_rol === 3) {
            navigate("/DashboardAdmin");
        } else {
            navigate("/DashboardAsesor");
        }
    };

    const guardarPerfil = async (e) => {
        e.preventDefault();

        if (!formData.primer_nombre.trim() || !formData.primer_apellido.trim()) {
            setMensaje({ texto: "Nombre y apellido son requeridos", tipo: "error" });
            return;
        }

        // Verificación de credenciales para el cambio de clave
        if (cambiarPassword) {
            if (!formData.contrasena_actual) {
                setMensaje({ texto: "Ingresa tu contraseña actual", tipo: "error" });
                return;
            }
            if (formData.contrasena_nueva !== formData.confirmar_contrasena) {
                setMensaje({ texto: "Las contraseñas nuevas no coinciden", tipo: "error" });
                return;
            }
            if (formData.contrasena_nueva.length < 6) {
                setMensaje({ texto: "La contraseña debe tener al menos 6 caracteres", tipo: "error" });
                return;
            }
        }

        setGuardando(true);
        setMensaje({ texto: "", tipo: "" });

        try {
            const dataToSend = {
                primer_nombre: formData.primer_nombre,
                primer_apellido: formData.primer_apellido,
                correo: formData.correo
            };

            if (cambiarPassword && formData.contrasena_nueva) {
                dataToSend.contrasena_actual = formData.contrasena_actual;
                dataToSend.contrasena_nueva = formData.contrasena_nueva;
            }

            const data = await usuariosService.update(usuario.id_usuario, dataToSend);

            // Sincronizar datos de sesión localmente
            const updatedUser = {
                ...usuario,
                primer_nombre: formData.primer_nombre,
                primer_apellido: formData.primer_apellido,
                correo: formData.correo
            };
            localStorage.setItem("usuario", JSON.stringify(updatedUser));
            setUsuario(updatedUser);

            setMensaje({ texto: "Perfil actualizado correctamente", tipo: "success" });
            setModoEdicion(false);
            setCambiarPassword(false);
            setFormData(prev => ({
                ...prev,
                contrasena_actual: "",
                contrasena_nueva: "",
                confirmar_contrasena: ""
            }));

        } catch (error) {
            console.error("Error actualizando perfil:", error);
            setMensaje({ texto: error.message || "Error al actualizar perfil", tipo: "error" });
        } finally {
            setGuardando(false);
        }
    };

    const cerrarSesion = async () => {
        await servicioAutenticacion.logout();
    };

    const getRolNombre = (id_rol) => {
        return id_rol === 1 ? "Administrador" : id_rol === 3 ? "Super Administrador" : id_rol === 2 ? "Asesor" : "Usuario";
    };

    if (cargando) {
        return (
            <div className="seguimiento-page">
                <div className="seg-loading">
                    <div className="loader"></div>
                    <p>Cargando perfil...</p>
                </div>
            </div>
        );
    }

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
                <div className="seg-card perfil-card">
                    {/* Header del perfil */}
                    <div className="perfil-cabecera">
                        <div className="perfil-avatar flex items-center justify-center">
                            <User size={40} className="text-gray-400" />
                        </div>
                        <h2 className="perfil-nombre">
                            {usuario?.primer_nombre} {usuario?.primer_apellido}
                        </h2>
                        <span className="perfil-rol-badge">
                            {getRolNombre(usuario?.id_rol)}
                        </span>
                    </div>

                    {/* Mensaje */}
                    {mensaje.texto && (
                        <div className={`seg-mensaje ${mensaje.tipo}`}>
                            {mensaje.texto}
                        </div>
                    )}

                    {/* Información del perfil */}
                    <div className="perfil-contenido">
                        {!modoEdicion ? (
                            <>
                                <div>
                                    <h3 className="perfil-seccion-titulo">
                                        <ClipboardList size={20} className="inline-block mr-2" /> Información Personal
                                    </h3>

                                    <div className="perfil-datos-grid">
                                        <div className="perfil-dato-item">
                                            <span className="perfil-dato-item__etiqueta">Nombre:</span>
                                            <span className="perfil-dato-item__valor">
                                                {usuario?.primer_nombre} {usuario?.primer_apellido}
                                            </span>
                                        </div>

                                        <div className="perfil-dato-item">
                                            <span className="perfil-dato-item__etiqueta">Correo:</span>
                                            <span className="perfil-dato-item__valor">
                                                {usuario?.correo || "-"}
                                            </span>
                                        </div>

                                        <div className="perfil-dato-item">
                                            <span className="perfil-dato-item__etiqueta">Rol:</span>
                                            <span className="perfil-dato-item__valor perfil-dato-item__valor--acento">
                                                {getRolNombre(usuario?.id_rol)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="perfil-botones">
                                    <button
                                        onClick={() => setModoEdicion(true)}
                                        className="btn-primary perfil-boton-flex"
                                    >
                                        <Pencil size={18} className="inline-block mr-2" /> Editar Perfil
                                    </button>
                                    <button
                                        onClick={cerrarSesion}
                                        className="btn-secondary perfil-boton-flex perfil-boton-cerrar"
                                    >
                                        <LogOut size={18} className="inline-block mr-2" /> Cerrar Sesión
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={guardarPerfil}>
                                <h3 className="perfil-seccion-titulo">
                                    <Pencil size={20} className="inline-block mr-2" /> Editar Información
                                </h3>

                                <div className="form-group">
                                    <label>Primer Nombre *</label>
                                    <input
                                        type="text"
                                        name="primer_nombre"
                                        value={formData.primer_nombre}
                                        onChange={handleChange}
                                        className="seg-input"
                                        placeholder="Tu nombre"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Primer Apellido *</label>
                                    <input
                                        type="text"
                                        name="primer_apellido"
                                        value={formData.primer_apellido}
                                        onChange={handleChange}
                                        className="seg-input"
                                        placeholder="Tu apellido"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Correo electrónico</label>
                                    <input
                                        type="email"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        className="seg-input"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>

                                {/* Toggle cambiar contraseña */}
                                <div className="perfil-toggle-password">
                                    <label className="perfil-toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={cambiarPassword}
                                            onChange={(e) => setCambiarPassword(e.target.checked)}
                                        />
                                        <span className="perfil-toggle-texto">
                                            <Lock size={16} className="inline-block mr-2" /> Cambiar contraseña
                                        </span>
                                    </label>
                                </div>

                                {cambiarPassword && (
                                    <div className="perfil-password-section">
                                        <div className="form-group">
                                            <label>Contraseña actual *</label>
                                            <input
                                                type="password"
                                                name="contrasena_actual"
                                                value={formData.contrasena_actual}
                                                onChange={handleChange}
                                                className="seg-input"
                                                placeholder="Tu contraseña actual"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Nueva contraseña *</label>
                                            <input
                                                type="password"
                                                name="contrasena_nueva"
                                                value={formData.contrasena_nueva}
                                                onChange={handleChange}
                                                className="seg-input"
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Confirmar nueva contraseña *</label>
                                            <input
                                                type="password"
                                                name="confirmar_contrasena"
                                                value={formData.confirmar_contrasena}
                                                onChange={handleChange}
                                                className="seg-input"
                                                placeholder="Repite la nueva contraseña"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="modal-actions perfil-acciones">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModoEdicion(false);
                                            setCambiarPassword(false);
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary flex items-center justify-center gap-2"
                                        disabled={guardando}
                                    >
                                        <span style={{ display: guardando ? 'inline-block' : 'none' }}>
                                            Guardando...
                                        </span>
                                        <span style={{ display: !guardando ? 'inline-flex' : 'none', alignItems: 'center', gap: '8px' }}>
                                            <Save size={18} /> Guardar Cambios
                                        </span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
