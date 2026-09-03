import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { servicioAutenticacion } from "./autenticacion.service";
import "./autenticacion.css";
import "./recuperar.css";
import logoPronavid from "../../images/Logopronavid.png";

// Pasos: 1 = correo, 2 = código + nueva contraseña, 3 = éxito
export default function RecuperarContrasena() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [correo, setCorreo] = useState("");
    const [codigo, setCodigo] = useState("");
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [mensaje, setMensaje] = useState(null);
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    // ─── PASO 1: Solicitar código ──────────────────────────────────────────
    const handleEnviarCodigo = async (e) => {
        e.preventDefault();
        setMensaje(null);

        if (!correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            setMensaje("Por favor ingresa un correo válido");
            setTipoMensaje("error");
            return;
        }

        setCargando(true);
        try {
            const res = await servicioAutenticacion.forgotPassword(correo);
            if (res.resetToken) {
                setResetToken(res.resetToken);
                setPaso(2);
                setMensaje("Código enviado. Revisa tu correo.");
                setTipoMensaje("success");
            } else {
                // Si el correo no existe, el backend responde sin token por seguridad
                setMensaje("Si el correo está registrado, recibirás el código en breve.");
                setTipoMensaje("success");
            }
        } catch (err) {
            setMensaje(err.message || "No se pudo enviar el código");
            setTipoMensaje("error");
        } finally {
            setCargando(false);
        }
    };

    // ─── PASO 2: Verificar código y cambiar contraseña ────────────────────
    const handleResetear = async (e) => {
        e.preventDefault();
        setMensaje(null);

        if (!codigo.trim() || codigo.length !== 6) {
            setMensaje("El código debe tener 6 dígitos");
            setTipoMensaje("error");
            return;
        }
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
            await servicioAutenticacion.resetPassword(resetToken, codigo, nuevaContrasena);
            setPaso(3);
        } catch (err) {
            setMensaje(err.message || "Código inválido o expirado");
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
                <div className="glass-card fade-in recuperar-card">
                    {/* ── Barra de pasos ── */}
                    <div className="pasos-bar">
                        <div className={`paso-dot ${paso >= 1 ? "activo" : ""}`}>
                            <span>1</span>
                            <p>Correo</p>
                        </div>
                        <div className={`paso-linea ${paso >= 2 ? "activa" : ""}`} />
                        <div className={`paso-dot ${paso >= 2 ? "activo" : ""}`}>
                            <span>2</span>
                            <p>Verificación</p>
                        </div>
                        <div className={`paso-linea ${paso >= 3 ? "activa" : ""}`} />
                        <div className={`paso-dot ${paso >= 3 ? "activo" : ""}`}>
                            <span>3</span>
                            <p>¡Listo!</p>
                        </div>
                    </div>

                    {/* ── PASO 1 ── */}
                    {paso === 1 && (
                        <form onSubmit={handleEnviarCodigo} className="formulario">
                            <h2>Recuperar Contraseña</h2>
                            <p className="subtitulo">Ingresa tu correo y te enviaremos un código de 6 dígitos</p>

                            <div className="input-group">
                                <label className="input-label">Correo electrónico</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                    disabled={cargando}
                                    autoFocus
                                />
                            </div>

                            <button type="submit" className="btn-submit" disabled={cargando}>
                                {cargando ? <><span className="loader-inline" /> Enviando...</> : "Enviar Código"}
                            </button>

                            {mensaje && (
                                <div className={`mensaje ${tipoMensaje}`}>
                                    {tipoMensaje === "success" ? "✓" : "!"} {mensaje}
                                </div>
                            )}

                            <div className="auth-footer">
                                <Link to="/login" className="auth-link">← Volver al inicio de sesión</Link>
                            </div>
                        </form>
                    )}

                    {/* ── PASO 2 ── */}
                    {paso === 2 && (
                        <form onSubmit={handleResetear} className="formulario">
                            <h2>Verificar Código</h2>
                            <p className="subtitulo">
                                Revisá tu bandeja de entrada de <strong>{correo}</strong> e ingresa el código de 6 dígitos
                            </p>

                            <div className="input-group">
                                <label className="input-label">Código de Verificación</label>
                                <input
                                    type="text"
                                    className="input codigo-input"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="_ _ _ _ _ _"
                                    maxLength={6}
                                    disabled={cargando}
                                    autoFocus
                                />
                            </div>

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
                                <label className="input-label">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={confirmarContrasena}
                                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                                    placeholder="Repite la contraseña"
                                    disabled={cargando}
                                />
                            </div>

                            <button type="submit" className="btn-submit" disabled={cargando}>
                                {cargando ? <><span className="loader-inline" /> Verificando...</> : "Cambiar Contraseña"}
                            </button>

                            {mensaje && (
                                <div className={`mensaje ${tipoMensaje}`}>
                                    {tipoMensaje === "success" ? "✓" : "!"} {mensaje}
                                </div>
                            )}

                            <div className="auth-footer">
                                <button
                                    type="button"
                                    className="auth-link btn-link"
                                    onClick={() => { setPaso(1); setMensaje(null); }}
                                >
                                    ¿No recibiste el código? Intentar de nuevo
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── PASO 3: Éxito ── */}
                    {paso === 3 && (
                        <div className="formulario exito-container">
                            <div className="exito-icono">✓</div>
                            <h2>¡Contraseña Actualizada!</h2>
                            <p className="subtitulo">Tu contraseña ha sido cambiada exitosamente.</p>
                            <button
                                type="button"
                                className="btn-submit"
                                onClick={() => navigate("/login")}
                            >
                                Ir al Inicio de Sesión
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
