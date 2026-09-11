import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, CheckCircle2, AlertCircle } from "lucide-react";
import { servicioAutenticacion } from "./autenticacion.service";
import "./autenticacion.css";
import logoPronavid from "../../images/Logopronavid.png";

export default function Login() {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const validarFormulario = () => {
        if (!correo.trim()) {
            setMensaje("El correo electrónico es requerido");
            setTipoMensaje("error");
            return false;
        }
        if (!contrasena.trim()) {
            setMensaje("La contraseña es requerida");
            setTipoMensaje("error");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            setMensaje("Por favor ingresa un correo electrónico válido");
            setTipoMensaje("error");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(null);

        if (!validarFormulario()) return;

        setCargando(true);

        try {
            const data = await servicioAutenticacion.login(correo, contrasena);

            setMensaje(`¡Bienvenido, ${data.user.primer_nombre}!`);
            setTipoMensaje("success");

            setTimeout(() => {
                const rol = Number(data.user.id_rol);
                if (rol === 1 || rol === 3) {
                    navigate("/DashboardAdmin");
                } else {
                    navigate("/DashboardAsesor");
                }
            }, 1000);

        } catch (err) {
            console.error("Error de conexión:", err);
            setMensaje("Correo electrónico o contraseña incorrectos");
            setTipoMensaje("error");
            setCargando(false);
        }
    };

    return (
        <div className="auth-page">
            <header className="encabezado">
                <img src={logoPronavid} alt="Logo Pronavid" className="logo" />
            </header>

            <main className="contenedor">
                <div className="glass-card fade-in">
                    <form onSubmit={handleSubmit} className="formulario">
                        <div className="auth-card-header">
                            <h2>¡Bienvenido!</h2>
                            <p className="subtitulo">Ingresa tus credenciales para acceder al sistema</p>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Correo electrónico</label>
                            <div className="input-field-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    id="login-correo"
                                    type="email"
                                    className="input input-with-icon"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    placeholder="ejemplo@pronavid.com"
                                    disabled={cargando}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="input-label-row">
                                <label className="input-label">Contraseña</label>
                                <Link to="/recuperar-contrasena" className="auth-forgot-link">
                                    ¿Olvidaste tu clave?
                                </Link>
                            </div>
                            <div className="input-field-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    id="login-contrasena"
                                    type={mostrarContrasena ? "text" : "password"}
                                    className="input input-with-icon input-with-eye"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={cargando}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="btn-toggle-eye"
                                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                                    title={mostrarContrasena ? "Ocultar contraseña" : "Ver contraseña"}
                                    tabIndex={-1}
                                >
                                    {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            className="btn-submit"
                            disabled={cargando}
                        >
                            {cargando ? (
                                <span className="btn-content-inline">
                                    <span className="loader-inline"></span>
                                    <span>Ingresando al sistema...</span>
                                </span>
                            ) : (
                                <span className="btn-content-inline">
                                    <span>Iniciar Sesión</span>
                                    <LogIn size={18} />
                                </span>
                            )}
                        </button>

                        {mensaje && (
                            <div className={`mensaje ${tipoMensaje}`}>
                                {tipoMensaje === "success" ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    <AlertCircle size={18} />
                                )}
                                <span>{mensaje}</span>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}
