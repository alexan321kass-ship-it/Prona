import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { servicioAutenticacion } from "./autenticacion.service";
import "./autenticacion.css";
import logoPronavid from "../../images/Logopronavid.png";

export default function RestablecerContrasena() {
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mensaje, setMensaje] = useState(null);
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setMensaje("El enlace de recuperación es inválido o no tiene token.");
            setTipoMensaje("error");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(null);

        if (!token) return;

        if (nuevaContrasena.length < 6) {
            setMensaje("La contraseña debe tener al menos 6 caracteres");
            setTipoMensaje("error");
            return;
        }

        if (nuevaContrasena !== confirmarContrasena) {
            setMensaje("Las contraseñas no coinciden");
            setTipoMensaje("error");
            return;
        }

        setCargando(true);

        try {
            await servicioAutenticacion.resetPassword(token, nuevaContrasena);
            setMensaje("¡Contraseña actualizada con éxito!");
            setTipoMensaje("success");
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.error("Error al restablecer:", err);
            setMensaje(err.message || "Ocurrió un error o el token expiró");
            setTipoMensaje("error");
        } finally {
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
                        <h2>Crear Nueva Contraseña</h2>
                        <p className="subtitulo">Elige una nueva contraseña segura</p>

                        <div className="input-group">
                            <label className="input-label">Nueva Contraseña</label>
                            <input
                                type="password"
                                className="input"
                                value={nuevaContrasena}
                                onChange={(e) => setNuevaContrasena(e.target.value)}
                                placeholder="••••••••"
                                disabled={cargando || !token}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Confirmar Contraseña</label>
                            <input
                                type="password"
                                className="input"
                                value={confirmarContrasena}
                                onChange={(e) => setConfirmarContrasena(e.target.value)}
                                placeholder="••••••••"
                                disabled={cargando || !token}
                            />
                        </div>

                        <button type="submit" className="btn-submit" disabled={cargando || !token}>
                            {cargando ? "Guardando..." : "Guardar Contraseña"}
                        </button>

                        {mensaje && (
                            <div className={`mensaje ${tipoMensaje}`}>
                                {tipoMensaje === "success" ? "✓" : "!"} {mensaje}
                            </div>
                        )}

                        <div className="auth-footer">
                            <Link to="/login" className="auth-link">
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
