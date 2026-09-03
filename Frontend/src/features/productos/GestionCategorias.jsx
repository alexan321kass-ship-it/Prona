import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layers, Plus, Edit2, Trash2, X, Check,
    AlertCircle, CheckCircle2, Package, Search,
    ToggleLeft, ToggleRight
} from "lucide-react";
import { productosService } from "./productos.service";

export default function GestionCategorias() {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

    // Modal
    const [modal, setModal] = useState(null); // null | { tipo: 'crear'|'editar', data? }
    const [form, setForm] = useState({ nombre_categoria: "", descripcion: "", estado: true });
    const [guardando, setGuardando] = useState(false);

    // Confirm delete
    const [confirmDelete, setConfirmDelete] = useState(null); // id

    const mostrarMensaje = (texto, tipo = "exito") => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3500);
    };

    const cargar = async () => {
        try {
            setCargando(true);
            const data = await productosService.getCategories();
            setCategorias(data || []);
        } catch {
            mostrarMensaje("Error al cargar categorías", "error");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    const abrirCrear = () => {
        setForm({ nombre_categoria: "", descripcion: "", estado: true });
        setModal({ tipo: "crear" });
    };

    const abrirEditar = (cat) => {
        setForm({
            nombre_categoria: cat.nombre_categoria,
            descripcion: cat.descripcion || "",
            estado: cat.estado ?? true,
        });
        setModal({ tipo: "editar", id: cat.id_categoria });
    };

    const cerrarModal = () => { setModal(null); };

    const guardar = async () => {
        if (!form.nombre_categoria.trim()) {
            mostrarMensaje("El nombre es obligatorio", "error");
            return;
        }
        setGuardando(true);
        try {
            if (modal.tipo === "crear") {
                await productosService.createCategory(form);
                mostrarMensaje("Categoría creada exitosamente");
            } else {
                await productosService.updateCategory(modal.id, form);
                mostrarMensaje("Categoría actualizada exitosamente");
            }
            cerrarModal();
            cargar();
        } catch (err) {
            mostrarMensaje(err?.message || "Error al guardar", "error");
        } finally {
            setGuardando(false);
        }
    };

    const eliminar = async (id) => {
        try {
            await productosService.deleteCategory(id);
            mostrarMensaje("Categoría eliminada");
            setConfirmDelete(null);
            cargar();
        } catch (err) {
            mostrarMensaje(err?.message || "No se pudo eliminar", "error");
            setConfirmDelete(null);
        }
    };

    const categoriasFiltradas = categorias.filter(c =>
        c.nombre_categoria?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
            {/* Toast */}
            <AnimatePresence>
                {mensaje.texto && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: "fixed", top: 20, right: 20, zIndex: 9999,
                            background: mensaje.tipo === "error" ? "#fee2e2" : "#dcfce7",
                            border: `1px solid ${mensaje.tipo === "error" ? "#fca5a5" : "#86efac"}`,
                            borderRadius: 14, padding: "12px 20px",
                            display: "flex", alignItems: "center", gap: 10,
                            boxShadow: "0 4px 24px rgba(0,0,0,0.10)", color: mensaje.tipo === "error" ? "#991b1b" : "#166534",
                            fontWeight: 600, fontSize: 14, maxWidth: 380,
                        }}
                    >
                        {mensaje.tipo === "error"
                            ? <AlertCircle size={18} />
                            : <CheckCircle2 size={18} />}
                        {mensaje.texto}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "linear-gradient(135deg,#E31E24,#F7941D)", borderRadius: 14, padding: 10, display: "flex" }}>
                        <Layers size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1a1c1e" }}>Categorías</h1>
                        <p style={{ margin: 0, fontSize: 13, color: "#72777f" }}>{categorias.length} categoría(s) registradas</p>
                    </div>
                </div>
                <button onClick={abrirCrear} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "linear-gradient(135deg,#E31E24,#c41219)", color: "white",
                    border: "none", borderRadius: 12, padding: "10px 20px",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(227,30,36,0.35)", transition: "opacity .2s",
                }}>
                    <Plus size={18} /> Nueva Categoría
                </button>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 24 }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <input
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar categorías..."
                    style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "11px 16px 11px 40px",
                        border: "1.5px solid #e5e7eb", borderRadius: 12,
                        fontSize: 14, outline: "none", background: "#f9fafb", color: "#1a1c1e",
                    }}
                />
            </div>

            {/* List */}
            {cargando ? (
                <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Cargando categorías...</div>
            ) : categoriasFiltradas.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
                    <Layers size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                    <p style={{ fontWeight: 600 }}>No hay categorías que mostrar</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    <AnimatePresence>
                        {categoriasFiltradas.map((cat, i) => (
                            <motion.div
                                key={cat.id_categoria}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ delay: i * 0.04 }}
                                style={{
                                    background: "white", borderRadius: 16,
                                    border: "1.5px solid #f0f0f0",
                                    padding: "16px 20px",
                                    display: "flex", alignItems: "center", gap: 16,
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                    background: "linear-gradient(135deg,#fff0f0,#fff5ee)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: "1.5px solid #fde0d0",
                                }}>
                                    <Layers size={20} color="#E31E24" />
                                </div>
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1c1e" }}>{cat.nombre_categoria}</span>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                                            background: cat.estado !== false ? "#dcfce7" : "#fee2e2",
                                            color: cat.estado !== false ? "#166534" : "#991b1b",
                                        }}>
                                            {cat.estado !== false ? "Activa" : "Inactiva"}
                                        </span>
                                    </div>
                                    {cat.descripcion && (
                                        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#72777f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {cat.descripcion}
                                        </p>
                                    )}
                                </div>
                                {/* Products count badge */}
                                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9ca3af", fontSize: 12, flexShrink: 0 }}>
                                    <Package size={14} />
                                    <span>#{cat.id_categoria}</span>
                                </div>
                                {/* Actions */}
                                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => abrirEditar(cat)} style={{
                                        background: "#f3f4f6", border: "none", borderRadius: 10,
                                        width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", color: "#374151", transition: "background .2s",
                                    }} title="Editar">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => setConfirmDelete(cat.id_categoria)} style={{
                                        background: "#fee2e2", border: "none", borderRadius: 10,
                                        width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", color: "#dc2626", transition: "background .2s",
                                    }} title="Eliminar">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal Crear/Editar */}
            <AnimatePresence>
                {modal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            zIndex: 1000, padding: 16,
                        }}
                        onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
                            style={{
                                background: "white", borderRadius: 20, padding: 28,
                                width: "100%", maxWidth: 480,
                                boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                                    {modal.tipo === "crear" ? "Nueva Categoría" : "Editar Categoría"}
                                </h2>
                                <button onClick={cerrarModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Nombre */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, color: "#374151" }}>
                                    Nombre <span style={{ color: "#E31E24" }}>*</span>
                                </label>
                                <input
                                    value={form.nombre_categoria}
                                    onChange={e => setForm(f => ({ ...f, nombre_categoria: e.target.value }))}
                                    placeholder="Ej: Granola, Snacks..."
                                    style={{
                                        width: "100%", boxSizing: "border-box", padding: "11px 16px",
                                        border: "1.5px solid #e5e7eb", borderRadius: 12,
                                        fontSize: 14, outline: "none",
                                    }}
                                />
                            </div>

                            {/* Descripción */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, color: "#374151" }}>
                                    Descripción <span style={{ color: "#9ca3af", fontWeight: 400 }}>(opcional)</span>
                                </label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                    placeholder="Describe brevemente esta categoría..."
                                    rows={3}
                                    style={{
                                        width: "100%", boxSizing: "border-box", padding: "11px 16px",
                                        border: "1.5px solid #e5e7eb", borderRadius: 12,
                                        fontSize: 14, outline: "none", resize: "vertical",
                                    }}
                                />
                            </div>

                            {/* Estado */}
                            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <label style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Estado</label>
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, estado: !f.estado }))}
                                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: form.estado ? "#16a34a" : "#6b7280" }}
                                >
                                    {form.estado ? <ToggleRight size={28} color="#16a34a" /> : <ToggleLeft size={28} color="#9ca3af" />}
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{form.estado ? "Activa" : "Inactiva"}</span>
                                </button>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={cerrarModal} style={{
                                    flex: 1, padding: "11px", border: "1.5px solid #e5e7eb",
                                    borderRadius: 12, background: "white", fontWeight: 600,
                                    fontSize: 14, cursor: "pointer", color: "#374151",
                                }}>
                                    Cancelar
                                </button>
                                <button onClick={guardar} disabled={guardando} style={{
                                    flex: 2, padding: "11px",
                                    background: "linear-gradient(135deg,#E31E24,#c41219)",
                                    border: "none", borderRadius: 12, color: "white",
                                    fontWeight: 700, fontSize: 14, cursor: guardando ? "not-allowed" : "pointer",
                                    opacity: guardando ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                }}>
                                    <Check size={16} />
                                    {guardando ? "Guardando..." : (modal.tipo === "crear" ? "Crear Categoría" : "Guardar Cambios")}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Confirmar Eliminación */}
            <AnimatePresence>
                {confirmDelete !== null && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            zIndex: 1100, padding: 16,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
                            style={{
                                background: "white", borderRadius: 20, padding: 28,
                                maxWidth: 400, width: "100%",
                                boxShadow: "0 20px 60px rgba(0,0,0,0.18)", textAlign: "center",
                            }}
                        >
                            <div style={{ background: "#fee2e2", borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                <Trash2 size={24} color="#dc2626" />
                            </div>
                            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>¿Eliminar categoría?</h3>
                            <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: 14 }}>
                                Solo se puede eliminar si no tiene productos asociados. Esta acción no se puede deshacer.
                            </p>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => setConfirmDelete(null)} style={{
                                    flex: 1, padding: "11px", border: "1.5px solid #e5e7eb",
                                    borderRadius: 12, background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer",
                                }}>
                                    Cancelar
                                </button>
                                <button onClick={() => eliminar(confirmDelete)} style={{
                                    flex: 1, padding: "11px", background: "#dc2626",
                                    border: "none", borderRadius: 12, color: "white",
                                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                                }}>
                                    Eliminar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
