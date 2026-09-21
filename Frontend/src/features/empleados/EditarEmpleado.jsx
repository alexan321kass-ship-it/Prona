import { useState, useEffect } from "react";
import { servicioEmpleados } from "./empleados.service";
import "./empleados.css";

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
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserRol, setCurrentUserRol] = useState(null);

    useEffect(() => {
        try {
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            if (usuario) {
                setCurrentUserId(usuario.id_usuario);
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
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre.trim())) { setMensaje("El nombre no puede contener números ni caracteres especiales"); setTipoMensaje("error"); return false; }
        if (!formData.apellido.trim()) { setMensaje("El apellido es requerido"); setTipoMensaje("error"); return false; }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellido.trim())) { setMensaje("El apellido no puede contener números ni caracteres especiales"); setTipoMensaje("error"); return false; }
        if (!formData.numDoc.trim()) { setMensaje("El documento es requerido"); setTipoMensaje("error"); return false; }
        if (!/^\d+$/.test(formData.numDoc.trim())) { setMensaje("El documento solo puede contener números"); setTipoMensaje("error"); return false; }
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
        <form onSubmit={handleActualizar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Nombre</label>
                    <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} disabled={cargando} pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$" title="Solo se permiten letras" />
                </div>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Apellido</label>
                    <input type="text" name="apellido" className="form-control" value={formData.apellido} onChange={handleChange} disabled={cargando} pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$" title="Solo se permiten letras" />
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
                    <input type="text" name="numDoc" className="form-control" value={formData.numDoc} onChange={handleChange} disabled={cargando} />
                </div>
            </div>

            <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Correo electrónico</label>
                <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleChange} disabled={cargando} />
            </div>

            <div className="form-group">
                {(() => {
                    const esMismoUsuario = String(currentUserId) === String(empleado?.id_usuario);
                    const esSuperAdminTarget = empleado?.id_rol === 3 || empleado?.rol?.nombre_rol?.toLowerCase() === 'super administrador' || formData.rol === "Super Administrador";
                    const deshabilitarRol = cargando || currentUserRol === 1 || esMismoUsuario || esSuperAdminTarget;
                    
                    const textoHelperRol = esMismoUsuario
                        ? "(No puedes modificar tu propio rol)"
                        : esSuperAdminTarget
                        ? "(No se puede modificar el rol de un Super Administrador)"
                        : "";

                    return (
                        <>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
                                Tipo de cuenta {textoHelperRol && <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{textoHelperRol}</span>}
                            </label>
                            <select 
                                name="rol" 
                                className="form-control" 
                                value={formData.rol} 
                                onChange={handleChange} 
                                disabled={deshabilitarRol}
                                title={textoHelperRol}
                            >
                                <option value="Asesor">Asesor</option>
                                {(currentUserRol === 3 || formData.rol === "Administrador" || formData.rol === "Super Administrador") && (
                                    <>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Super Administrador">Super Administrador</option>
                                    </>
                                )}
                            </select>
                        </>
                    );
                })()}
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

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-submit" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', flex: 1 }} onClick={onCancel} disabled={cargando}>
                    Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={cargando} style={{ flex: 2 }}>
                    {cargando ? "Actualizando..." : "Guardar Cambios"}
                </button>
            </div>
        </form>
    );
}
