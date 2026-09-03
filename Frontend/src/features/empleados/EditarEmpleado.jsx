import { useState, useEffect } from "react";
import { servicioEmpleados } from "./empleados.service";
import "../autenticacion/autenticacion.css"; // Usa los estilos del formulario de auth

export default function EditarEmpleado({ empleado, onCancel, onSuccess }) {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        tipoDoc: "CC",
        numDoc: "",
        correo: "",
        rol: "Asesor"
    });

    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const [currentUserRol, setCurrentUserRol] = useState(null);

    useEffect(() => {
        try {
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            if (usuario) {
                setCurrentUserRol(usuario.id_rol);
            }
        } catch (e) {}
    }, []);

    useEffect(() => {
        if (empleado) {
            setFormData({
                nombre: empleado.primer_nombre || "",
                apellido: empleado.primer_apellido || "",
                tipoDoc: empleado.tipo_documento || "CC",
                numDoc: empleado.numero_documento || "",
                correo: empleado.correo || "",
                rol: empleado.rol?.nombre_rol || "Asesor"
            });
        }
    }, [empleado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const obtenerIdRol = () => {
        if (formData.rol === "Super Administrador") return 3;
        if (formData.rol === "Administrador") return 1;
        return 2;
    };

    const validarFormulario = () => {
        if (!formData.nombre.trim()) { setMensaje("El nombre es requerido"); setTipoMensaje("error"); return false; }
        if (!formData.apellido.trim()) { setMensaje("El apellido es requerido"); setTipoMensaje("error"); return false; }
        if (!formData.numDoc.trim()) { setMensaje("El documento es requerido"); setTipoMensaje("error"); return false; }
        if (!formData.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            setMensaje("Ingresa un correo electrónico válido"); setTipoMensaje("error"); return false;
        }
        return true;
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        setMensaje("");

        if (!validarFormulario()) return;

        setCargando(true);
        try {
            await servicioEmpleados.actualizar(empleado.id_usuario, {
                primer_nombre: formData.nombre,
                primer_apellido: formData.apellido,
                tipo_documento: formData.tipoDoc,
                numero_documento: formData.numDoc,
                correo: formData.correo,
                id_rol: obtenerIdRol(),
            });

            setMensaje("¡Usuario actualizado exitosamente!");
            setTipoMensaje("success");

            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 1000);

        } catch (err) {
            console.error("Error:", err);
            setMensaje(err.message || "Error al actualizar");
            setTipoMensaje("error");
            setCargando(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleActualizar} className="formulario">
                <h2>Editar Usuario</h2>
                <p className="subtitulo">Actualizar información de {empleado?.primer_nombre}</p>

                <div className="form-row">
                    <div className="input-group">
                        <label className="input-label">Nombre</label>
                        <input type="text" name="nombre" className="input" value={formData.nombre} onChange={handleChange} disabled={cargando} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Apellido</label>
                        <input type="text" name="apellido" className="input" value={formData.apellido} onChange={handleChange} disabled={cargando} />
                    </div>
                </div>

                <div className="form-row registro-row-doc">
                    <div className="input-group">
                        <label className="input-label">Tipo Doc.</label>
                        <select name="tipoDoc" className="input" value={formData.tipoDoc} onChange={handleChange} disabled={cargando}>
                            <option value="CC">Cédula</option>
                            <option value="TI">Tarjeta ID</option>
                            <option value="CE">Cédula Ext.</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Número de documento</label>
                        <input type="text" name="numDoc" className="input" value={formData.numDoc} onChange={handleChange} disabled={cargando} />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Correo electrónico</label>
                    <input type="email" name="correo" className="input" value={formData.correo} onChange={handleChange} disabled={cargando} />
                </div>

                <div className="input-group">
                    <label className="input-label">Tipo de cuenta</label>
                    <select name="rol" className="input" value={formData.rol} onChange={handleChange} disabled={cargando || currentUserRol === 1}>
                        <option value="Asesor">Asesor</option>
                        {currentUserRol === 3 && (
                            <>
                                <option value="Administrador">Administrador</option>
                                <option value="Super Administrador">Super Administrador</option>
                            </>
                        )}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn-submit" style={{ background: '#6C737A' }} onClick={onCancel} disabled={cargando}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-submit" disabled={cargando}>
                        {cargando ? "Actualizando..." : "Guardar Cambios"}
                    </button>
                </div>

                {mensaje && (
                    <div className={`mensaje ${tipoMensaje}`}>
                        {tipoMensaje === "success" ? "✓" : "!"} {mensaje}
                    </div>
                )}
            </form>
        </div>
    );
}
