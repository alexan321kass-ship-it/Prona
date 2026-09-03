import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { servicioAutenticacion } from "./autenticacion.service";
import "./autenticacion.css";
import logoPronavid from "../../images/Logopronavid.png";

export default function Login() {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mensaje, setMensaje] = useState(null);
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const validarFormulario = () => {
        if (!correo.trim()) {
            setMensaje("El correo es requerido");
            setTipoMensaje("error");
            return false;
        }
        if (!contrasena.trim()) {
            setMensaje("La contraseña es requerida");
            setTipoMensaje("error");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            setMensaje("Por favor ingresa un correo válido");
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
                if (data.user.id_rol === 1 || data.user.id_rol === 3) {
                    navigate("/DashboardAdmin");
                } else {
                    navigate("/DashboardAsesor");
                }
            }, 1200);

        } catch (err) {
            console.error("Error de conexión:", err);
            setMensaje("Error de contraseña o email");
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
                        <h2>Iniciar Sesión</h2>
                        <p className="subtitulo">Ingresa tus credenciales para continuar</p>

                        <div className="input-group">
                            <label className="input-label">Correo electrónico</label>
                            <input
                                id="login-correo"
                                type="email"
                                className="input"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="ejemplo@correo.com"
                                disabled={cargando}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Contraseña</label>
                            <input
                                id="login-contrasena"
                                type="password"
                                className="input"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="••••••••"
                                disabled={cargando}
                            />
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            className="btn-submit"
                            disabled={cargando}
                        >
                            {cargando ? (
                                <>
                                    <span className="loader-inline"></span>
                                    Ingresando...
                                </>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </button>

                        {mensaje && (
                            <div className={`mensaje ${tipoMensaje}`}>
                                {tipoMensaje === "success" ? "✓" : "!"} {mensaje}
                            </div>
                        )}

                        <div className="auth-footer">
                            <Link to="/recuperar-contrasena" className="auth-link" style={{ display: 'block', marginBottom: '10px' }}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
