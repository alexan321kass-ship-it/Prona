import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { servicioAutenticacion } from "./autenticacion.service";
import "./autenticacion.css";
import logoPronavid from "../../images/Logopronavid.png";

export default function CambiarContrasenaTemporal() {
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mensaje, setMensaje] = useState(null);
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar que el usuario esté logueado
        try {
            const userRaw = localStorage.getItem("usuario");
            if (!userRaw) {
                navigate("/login");
                return;
            }
            const user = JSON.parse(userRaw);
            // Si el usuario no necesita cambiar contraseña, lo enviamos al dashboard
            if (!user.requiere_cambio_contrasena) {
                redirigirSegunRol(user.id_rol);
                return;
            }
            setUsuario(user);
        } catch (e) {
            navigate("/login");
        }
    }, [navigate]);

    const redirigirSegunRol = (rol) => {
        if (Number(rol) === 1 || Number(rol) === 3) {
            navigate("/DashboardAdmin");
        } else {
            navigate("/DashboardAsesor");
        }
    };

    const validarFormulario = () => {
        if (!nuevaContrasena.trim() || !confirmarContrasena.trim()) {
            setMensaje("Todos los campos son requeridos");
            setTipoMensaje("error");
            return false;
        }
        if (nuevaContrasena.length < 6) {
            setMensaje("La contraseña debe tener al menos 6 caracteres");
            setTipoMensaje("error");
            return false;
        }
        if (nuevaContrasena !== confirmarContrasena) {
            setMensaje("Las contraseñas no coinciden");
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
            await servicioAutenticacion.changePassword(nuevaContrasena);

            setMensaje("¡Contraseña actualizada con éxito!");
            setTipoMensaje("success");

            // Actualizamos localStorage para que refleje el cambio
            const updatedUser = { ...usuario, requiere_cambio_contrasena: false };
            localStorage.setItem("usuario", JSON.stringify(updatedUser));

            // Redirigir al panel correspondiente después de 1.5s
            setTimeout(() => {
                redirigirSegunRol(updatedUser.id_rol);
            }, 1500);

        } catch (err) {
            console.error("Error al cambiar contraseña:", err);
            setMensaje(err.message || "Error al actualizar la contraseña");
            setTipoMensaje("error");
            setCargando(false);
        }
    };

    if (!usuario) return null;

    return (
        <div className="auth-page">
            <header className="encabezado">
                <img src={logoPronavid} alt="Logo Pronavid" className="logo" />
            </header>

            <main className="contenedor">
                <div className="glass-card fade-in">
                    <form onSubmit={handleSubmit} className="formulario">
                        <h2>Actualizar Contraseña</h2>
                        <p className="subtitulo">Por seguridad, debes cambiar tu contraseña temporal antes de continuar.</p>

                        <div className="input-group">
                            <label className="input-label">Nueva Contraseña</label>
                            <input
                                type="password"
                                className="input"
                                value={nuevaContrasena}
                                onChange={(e) => setNuevaContrasena(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                disabled={cargando}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Confirmar Contraseña</label>
                            <input
                                type="password"
                                className="input"
                                value={confirmarContrasena}
                                onChange={(e) => setConfirmarContrasena(e.target.value)}
                                placeholder="Repite la nueva contraseña"
                                disabled={cargando}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={cargando}
                        >
                            <span style={{ display: cargando ? 'inline-flex' : 'none', alignItems: 'center', gap: '8px' }}>
                                <span className="loader-inline"></span>
                                <span>Actualizando...</span>
                            </span>
                            <span style={{ display: !cargando ? 'inline-block' : 'none' }}>
                                <span>Guardar y Continuar</span>
                            </span>
                        </button>

                        {mensaje && (
                            <div className={`mensaje ${tipoMensaje}`}>
                                <span>{tipoMensaje === "success" ? "✓" : "!"}</span> <span>{mensaje}</span>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}
