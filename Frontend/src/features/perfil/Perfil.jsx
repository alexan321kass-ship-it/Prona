import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    User, 
    Mail, 
    Shield, 
    Lock, 
    Pencil, 
    LogOut, 
    Save, 
    CheckCircle2, 
    KeyRound, 
    Sparkles, 
    BadgeCheck, 
    IdCard 
} from "lucide-react";
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

            await usuariosService.update(usuario.id_usuario, dataToSend);

            // Sincronizar datos de sesión localmente
            const updatedUser = {
                ...usuario,
                primer_nombre: formData.primer_nombre,
                primer_apellido: formData.primer_apellido,
                correo: formData.correo
            };
            localStorage.setItem("usuario", JSON.stringify(updatedUser));
            setUsuario(updatedUser);

            setMensaje({ texto: "¡Perfil actualizado con éxito!", tipo: "success" });
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

    const getRolInfo = (id_rol) => {
        switch (id_rol) {
            case 3:
                return { nombre: "Super Administrador", color: "#C0392B", bg: "rgba(192, 57, 43, 0.12)", badgeClass: "perfil-badge-super" };
            case 1:
                return { nombre: "Administrador", color: "#E67E22", bg: "rgba(230, 126, 34, 0.12)", badgeClass: "perfil-badge-admin" };
            case 2:
                return { nombre: "Asesor Comercial", color: "#2980B9", bg: "rgba(41, 128, 185, 0.12)", badgeClass: "perfil-badge-asesor" };
            default:
                return { nombre: "Usuario", color: "#7F8C8D", bg: "rgba(127, 140, 141, 0.12)", badgeClass: "perfil-badge-default" };
        }
    };

    const rolInfo = getRolInfo(usuario?.id_rol);

    const getIniciales = () => {
        const n = usuario?.primer_nombre?.charAt(0) || "U";
        const a = usuario?.primer_apellido?.charAt(0) || "";
        return (n + a).toUpperCase();
    };

    if (cargando) {
        return (
            <div className="seguimiento-page flex items-center justify-center min-h-screen">
                <div className="seg-loading text-center">
                    <div className="loader"></div>
                    <p style={{ marginTop: '1rem', color: '#6b7280', fontWeight: 600 }}>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="perfil-pagina-v2">
            {/* Top Bar Header */}
            <div className="perfil-topbar">
                <button onClick={volverDashboard} className="perfil-topbar__btn-volver" title="Volver al Panel">
                    <ArrowLeft size={18} />
                    <span>Volver</span>
                </button>

                <img src={logoPronavid} alt="Pronavid" className="perfil-topbar__logo" />
            </div>

            <div className="perfil-contenedor-principal">
                {/* HERO USER HEADER CARD */}
                <div className="perfil-hero-card">
                    <div className="perfil-hero-card__bg-accent"></div>
                    
                    <div className="perfil-hero-card__content">
                        {/* Avatar con anillo luminoso */}
                        <div className="perfil-avatar-wrapper">
                            <div className="perfil-avatar-glow"></div>
                            <div className="perfil-avatar-circulo">
                                {getIniciales()}
                            </div>
                            <div className="perfil-avatar-status" title="Cuenta Activa">
                                <BadgeCheck size={16} color="#ffffff" />
                            </div>
                        </div>

                        {/* Nombre y Rol */}
                        <div className="perfil-user-info">
                            <h1 className="perfil-user-info__nombre">
                                {usuario?.primer_nombre} {usuario?.primer_apellido}
                            </h1>
                            <p className="perfil-user-info__correo">
                                <Mail size={15} /> {usuario?.correo}
                            </p>
                            <span 
                                className="perfil-user-info__badge" 
                                style={{ color: rolInfo.color, backgroundColor: rolInfo.bg, borderColor: rolInfo.color }}
                            >
                                <Shield size={14} /> {rolInfo.nombre}
                            </span>
                        </div>
                    </div>
                </div>

                {/* FEEDBACK TOAST */}
                {mensaje.texto && (
                    <div className={`perfil-alerta ${mensaje.tipo === 'success' ? 'perfil-alerta--exito' : 'perfil-alerta--error'}`}>
                        {mensaje.tipo === 'success' ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                {/* MAIN CONTENT CARD */}
                <div className="perfil-card-body">
                    {!modoEdicion ? (
                        /* VISTA LECTURA */
                        <div className="perfil-vista-modo">
                            <div className="perfil-header-seccion">
                                <h3 className="perfil-titulo-seccion">
                                    <IdCard size={20} className="text-red-600" /> Datos de la Cuenta
                                </h3>
                                <p className="perfil-subtitulo-seccion">Gestiona tus datos personales y credenciales de acceso</p>
                            </div>

                            <div className="perfil-grid-detalles">
                                <div className="perfil-campo-card">
                                    <div className="perfil-campo-card__icono">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <span className="perfil-campo-card__etiqueta">Nombre Completo</span>
                                        <p className="perfil-campo-card__valor">{usuario?.primer_nombre} {usuario?.primer_apellido}</p>
                                    </div>
                                </div>

                                <div className="perfil-campo-card">
                                    <div className="perfil-campo-card__icono">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <span className="perfil-campo-card__etiqueta">Correo Electrónico</span>
                                        <p className="perfil-campo-card__valor">{usuario?.correo}</p>
                                    </div>
                                </div>

                                <div className="perfil-campo-card">
                                    <div className="perfil-campo-card__icono">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <span className="perfil-campo-card__etiqueta">Tipo de Rol asignado</span>
                                        <p className="perfil-campo-card__valor" style={{ color: rolInfo.color }}>
                                            {rolInfo.nombre}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="perfil-acciones-footer">
                                <button
                                    onClick={() => setModoEdicion(true)}
                                    className="perfil-btn perfil-btn--primary"
                                >
                                    <Pencil size={18} /> Editar Perfil
                                </button>

                                <button
                                    onClick={cerrarSesion}
                                    className="perfil-btn perfil-btn--danger"
                                >
                                    <LogOut size={18} /> Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* VISTA EDICIÓN */
                        <form onSubmit={guardarPerfil} className="perfil-form-edicion">
                            <div className="perfil-header-seccion">
                                <h3 className="perfil-titulo-seccion">
                                    <Pencil size={20} className="text-red-600" /> Modificar Perfil
                                </h3>
                                <p className="perfil-subtitulo-seccion">Actualiza tus nombres o contraseña de acceso</p>
                            </div>

                            <div className="perfil-form-grid">
                                <div className="perfil-form-group">
                                    <label className="perfil-form-label">
                                        <User size={16} /> Primer Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="primer_nombre"
                                        value={formData.primer_nombre}
                                        onChange={handleChange}
                                        className="perfil-form-input"
                                        placeholder="Tu nombre"
                                        required
                                    />
                                </div>

                                <div className="perfil-form-group">
                                    <label className="perfil-form-label">
                                        <User size={16} /> Primer Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        name="primer_apellido"
                                        value={formData.primer_apellido}
                                        onChange={handleChange}
                                        className="perfil-form-input"
                                        placeholder="Tu apellido"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="perfil-form-group">
                                <label className="perfil-form-label">
                                    <Mail size={16} /> Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    className="perfil-form-input"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>

                            {/* ACORDEÓN / TOGGLE CAMBIO DE CONTRASEÑA */}
                            <div className="perfil-card-seguridad">
                                <label className="perfil-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={cambiarPassword}
                                        onChange={(e) => setCambiarPassword(e.target.checked)}
                                        className="perfil-checkbox-input"
                                    />
                                    <div className="perfil-checkbox-content">
                                        <KeyRound size={20} className="text-red-600" />
                                        <div>
                                            <span className="perfil-checkbox-titulo">Cambiar Contraseña de Acceso</span>
                                            <p className="perfil-checkbox-desc">Activa esta opción para actualizar tu clave de seguridad</p>
                                        </div>
                                    </div>
                                </label>

                                {cambiarPassword && (
                                    <div className="perfil-password-box">
                                        <div className="perfil-form-group">
                                            <label className="perfil-form-label">Contraseña Actual *</label>
                                            <input
                                                type="password"
                                                name="contrasena_actual"
                                                value={formData.contrasena_actual}
                                                onChange={handleChange}
                                                className="perfil-form-input"
                                                placeholder="Ingresa tu clave actual"
                                            />
                                        </div>

                                        <div className="perfil-form-grid">
                                            <div className="perfil-form-group">
                                                <label className="perfil-form-label">Nueva Contraseña *</label>
                                                <input
                                                    type="password"
                                                    name="contrasena_nueva"
                                                    value={formData.contrasena_nueva}
                                                    onChange={handleChange}
                                                    className="perfil-form-input"
                                                    placeholder="Mínimo 6 caracteres"
                                                />
                                            </div>

                                            <div className="perfil-form-group">
                                                <label className="perfil-form-label">Confirmar Nueva Contraseña *</label>
                                                <input
                                                    type="password"
                                                    name="confirmar_contrasena"
                                                    value={formData.confirmar_contrasena}
                                                    onChange={handleChange}
                                                    className="perfil-form-input"
                                                    placeholder="Repite la clave nueva"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* BOTONES ACCIÓN FORMULARIO */}
                            <div className="perfil-acciones-footer">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModoEdicion(false);
                                        setCambiarPassword(false);
                                        setMensaje({ texto: "", tipo: "" });
                                    }}
                                    className="perfil-btn perfil-btn--secondary"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="perfil-btn perfil-btn--primary"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <span>Guardando...</span>
                                    ) : (
                                        <>
                                            <Save size={18} /> Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
