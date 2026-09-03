import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { servicioAutenticacion } from "./autenticacion.service";
import "./autenticacion.css";
import CabeceraPanel from "../paneles/CabeceraPanel";
import PiePanel from "../paneles/PiePanel";

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
        if (!formData.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            setMensaje("Ingresa un correo electrónico válido");
            setTipoMensaje("error");
            return false;
        }
        if (formData.contrasena.length < 6) {
            setMensaje("La contraseña debe tener al menos 6 caracteres");
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
            <form onSubmit={handleRegistro} className="formulario">
                        <h2>Registrar Nuevo Usuario</h2>
                        <p className="subtitulo">Añadir un nuevo Asesor o Administrador al sistema</p>

                        <div className="form-row">
                            <div className="input-group">
                                <label className="input-label">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    className="input"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Tu nombre"
                                    disabled={cargando}
                                    pattern="^[^0-9]*$"
                                    title="No se permiten números"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Apellido</label>
                                <input
                                    type="text"
                                    name="apellido"
                                    className="input"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    placeholder="Tu apellido"
                                    disabled={cargando}
                                    pattern="^[^0-9]*$"
                                    title="No se permiten números"
                                />
                            </div>
                        </div>

                        <div className="form-row registro-row-doc">
                            <div className="input-group">
                                <label className="input-label">Tipo Doc.</label>
                                <select
                                    name="tipoDoc"
                                    className="input"
                                    value={formData.tipoDoc}
                                    onChange={handleChange}
                                    disabled={cargando}
                                >
                                    <option value="CC">Cédula</option>
                                    <option value="TI">Tarjeta ID</option>
                                    <option value="CE">Cédula Ext.</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Número de documento</label>
                                <input
                                    type="text"
                                    name="numDoc"
                                    className="input"
                                    value={formData.numDoc}
                                    onChange={handleChange}
                                    placeholder="1234567890"
                                    disabled={cargando}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Correo electrónico</label>
                            <input
                                type="email"
                                name="correo"
                                className="input"
                                value={formData.correo}
                                onChange={handleChange}
                                placeholder="ejemplo@correo.com"
                                disabled={cargando}
                            />
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label className="input-label">Contraseña</label>
                                <input
                                    type="password"
                                    name="contrasena"
                                    className="input"
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={cargando}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Confirmar</label>
                                <input
                                    type="password"
                                    name="confirmarContrasena"
                                    className="input"
                                    value={formData.confirmarContrasena}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={cargando}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Tipo de cuenta</label>
                            <select
                                name="rol"
                                className="input"
                                value={formData.rol}
                                onChange={handleChange}
                                disabled={cargando || currentUserRol === 1}
                            >
                                <option value="Asesor">Asesor</option>
                                {currentUserRol === 3 && (
                                    <>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Super Administrador">Super Administrador</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={cargando}
                        >
                            {cargando ? (
                                <>
                                    <span className="loader-inline"></span>
                                    Registrando...
                                </>
                            ) : (
                                "Crear Usuario"
                            )}
                        </button>

                        {mensaje && (
                            <div className={`mensaje ${tipoMensaje}`}>
                                {tipoMensaje === "success" ? "✓" : "!"} {mensaje}
                            </div>
                        )}
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
