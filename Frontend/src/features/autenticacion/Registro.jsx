import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { servicioAutenticacion } from "./autenticacion.service";
import "./autenticacion.css";
import CabeceraPanel from "../paneles/CabeceraPanel";
import PiePanel from "../paneles/PiePanel";
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";

export default function Registro({ isModal = false, onSuccess = null }) {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        tipoDoc: "CC",
        numDoc: "",
        correo: "",
        contrasena: "",
        confirmarContrasena: "",
        rol: "Asesor"
    });

    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [currentUserRol, setCurrentUserRol] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            if (usuario) {
                setCurrentUserRol(usuario.id_rol);
            }
        } catch (e) {}
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const obtenerIdRol = () => {
        if (formData.rol === "Super Administrador") return 3;
        if (formData.rol === "Administrador") return 1;
        return 2;
    };

    const validarFormulario = () => {
        if (!formData.nombre.trim()) {
            setMensaje("El nombre es requerido");
            setTipoMensaje("error");
            return false;
        }
        if (/\d/.test(formData.nombre)) {
            setMensaje("El nombre no puede contener números");
            setTipoMensaje("error");
            return false;
        }
        if (!formData.apellido.trim()) {
            setMensaje("El apellido es requerido");
            setTipoMensaje("error");
            return false;
        }
        if (/\d/.test(formData.apellido)) {
            setMensaje("El apellido no puede contener números");
            setTipoMensaje("error");
            return false;
        }
        if (!formData.numDoc.trim()) {
            setMensaje("El número de documento es requerido");
            setTipoMensaje("error");
            return false;
        }
        if (!/^\d+$/.test(formData.numDoc.trim())) {
            setMensaje("El número de documento solo puede contener números");
            setTipoMensaje("error");
            return false;
        }
        if (!formData.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            setMensaje("Ingresa un correo electrónico válido");
            setTipoMensaje("error");
            return false;
        }

        const pass = formData.contrasena;
        if (pass.length < 7 || !/\d/.test(pass) || !/[A-Z]/.test(pass) || !/[\W_]/.test(pass)) {
            setMensaje("La contraseña no cumple con los requisitos de seguridad");
            setTipoMensaje("error");
            return false;
        }

        if (formData.contrasena !== formData.confirmarContrasena) {
            setMensaje("Las contraseñas no coinciden");
            setTipoMensaje("error");
            return false;
        }
        return true;
    };

    const passReqs = {
        length: formData.contrasena.length >= 7,
        number: /\d/.test(formData.contrasena),
        upper: /[A-Z]/.test(formData.contrasena),
        special: /[\W_]/.test(formData.contrasena)
    };
    const isPassSecure = passReqs.length && passReqs.number && passReqs.upper && passReqs.special;

    const handleRegistro = async (e) => {
        e.preventDefault();
        setMensaje("");

        if (!validarFormulario()) return;

        setCargando(true);

        try {
            await servicioAutenticacion.register({
                primer_nombre: formData.nombre,
                primer_apellido: formData.apellido,
                tipo_documento: formData.tipoDoc,
                numero_documento: formData.numDoc,
                correo: formData.correo,
                contrasena: formData.contrasena,
                id_rol: obtenerIdRol(),
            });

            setMensaje("¡Registro exitoso! Redirigiendo...");
            setTipoMensaje("success");

            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate("/DashboardAdmin");
                }
            }, 1500);

        } catch (err) {
            console.error("Error:", err);
            setMensaje(err.message || "Error al registrar");
            setTipoMensaje("error");
            setCargando(false);
        }
    };

    const contenidoFormulario = (
        <div className={!isModal ? "glass-card fade-in registro-card" : ""} style={!isModal ? { maxWidth: '600px', margin: '0 auto' } : {}}>
            <form onSubmit={handleRegistro}>
                {!isModal && (
                    <>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.2rem' }}>Registrar Nuevo Usuario</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Añadir un nuevo Asesor o Administrador al sistema</p>
                    </>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Nombre</label>
                        <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre" disabled={cargando} pattern="^[^0-9]*$" title="No se permiten números" />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Apellido</label>
                        <input type="text" name="apellido" className="form-control" value={formData.apellido} onChange={handleChange} placeholder="Tu apellido" disabled={cargando} pattern="^[^0-9]*$" title="No se permiten números" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Tipo Doc.</label>
                        <select name="tipoDoc" className="form-control" value={formData.tipoDoc} onChange={handleChange} disabled={cargando}>
                            <option value="CC">Cédula</option>
                            <option value="TI">Tarjeta ID</option>
                            <option value="CE">Cédula Ext.</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Número de documento</label>
                        <input type="text" name="numDoc" className="form-control" value={formData.numDoc} onChange={handleChange} placeholder="1234567890" disabled={cargando} />
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Correo electrónico</label>
                    <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleChange} placeholder="ejemplo@correo.com" disabled={cargando} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <input type={mostrarContrasena ? "text" : "password"} name="contrasena" className="form-control" value={formData.contrasena} onChange={handleChange} placeholder="••••••••" disabled={cargando} style={{ paddingRight: '2.5rem' }} />
                            <button 
                                type="button" 
                                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        {formData.contrasena.length > 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: passReqs.length ? '#16a34a' : '#94a3b8' }}>
                                    {passReqs.length ? <CheckCircle2 size={14} /> : <XCircle size={14} />} Mínimo 7 caracteres
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: passReqs.upper ? '#16a34a' : '#94a3b8' }}>
                                    {passReqs.upper ? <CheckCircle2 size={14} /> : <XCircle size={14} />} Una mayúscula
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: passReqs.number ? '#16a34a' : '#94a3b8' }}>
                                    {passReqs.number ? <CheckCircle2 size={14} /> : <XCircle size={14} />} Un número
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: passReqs.special ? '#16a34a' : '#94a3b8' }}>
                                    {passReqs.special ? <CheckCircle2 size={14} /> : <XCircle size={14} />} Un carácter especial
                                </div>
                                {isPassSecure && (
                                    <div style={{ marginTop: '0.3rem', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
                                        ¡Contraseña Segura!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Confirmar</label>
                        <div style={{ position: 'relative' }}>
                            <input type={mostrarContrasena ? "text" : "password"} name="confirmarContrasena" className="form-control" value={formData.confirmarContrasena} onChange={handleChange} placeholder="••••••••" disabled={cargando} style={{ paddingRight: '2.5rem' }} />
                            <button 
                                type="button" 
                                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        {formData.confirmarContrasena.length > 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', color: formData.contrasena === formData.confirmarContrasena ? '#16a34a' : '#dc2626' }}>
                                {formData.contrasena === formData.confirmarContrasena ? (
                                    <><CheckCircle2 size={14} /> Las contraseñas coinciden</>
                                ) : (
                                    <><XCircle size={14} /> Las contraseñas no coinciden</>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Tipo de cuenta</label>
                    <select name="rol" className="form-control" value={formData.rol} onChange={handleChange} disabled={cargando || currentUserRol === 1}>
                        <option value="Asesor">Asesor</option>
                        {currentUserRol === 3 && (
                            <>
                                <option value="Administrador">Administrador</option>
                                <option value="Super Administrador">Super Administrador</option>
                            </>
                        )}
                    </select>
                </div>

                {mensaje && (
                    <div style={{ 
                        padding: "0.8rem 1rem", borderRadius: "10px", marginTop: "1rem", fontSize: "0.9rem", fontWeight: 600,
                        background: tipoMensaje === "success" ? "#dcfce7" : "#fee2e2",
                        color: tipoMensaje === "success" ? "#16a34a" : "#dc2626",
                        border: `1px solid ${tipoMensaje === "success" ? "#bbf7d0" : "#fecaca"}`
                    }}>
                        {tipoMensaje === "success" ? "✓" : "!"} {mensaje}
                    </div>
                )}

                <button type="submit" className="btn-submit" disabled={cargando} style={{ marginTop: '1.5rem', width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    {cargando ? "Registrando..." : "Crear Usuario"}
                </button>
            </form>
        </div>
    );

    if (isModal) {
        return contenidoFormulario;
    }

    return (
        <>
            {/* Contenido principal */}
            <main className="contenedor" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                {contenidoFormulario}
            </main>
            <PiePanel />
        </>
    );
}
