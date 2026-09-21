import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Package, 
    Plus, 
    Edit2, 
    Trash2, 
    ChevronLeft, 
    Layers, 
    Search, 
    Info, 
    DollarSign, 
    Tag,
    AlertCircle,
    CheckCircle2,
    X,
    Upload,
    Image as ImageIcon
} from "lucide-react";

import { productosService } from "./productos.service";
import { API_BASE, UPLOAD_BASE } from "../../config/api";
import logoPronavid from "../../images/Logopronavid.png";
import "./productos.css";
import "./catalogo.css";
import "../../compartido/styles/seguimiento-compartido.css"; 

const resolveImageUrl = (url) => {
    if (!url || url === 'null') return null;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${UPLOAD_BASE}/${url}`;
};

export default function Catalogo() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaActual, setCategoriaActual] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
    const searchRef = useRef(null);
    const fileInputRef = useRef(null);
    const bulkInputRef = useRef(null);
    const [subiendoMasivo, setSubiendoMasivo] = useState(false);
    const [imagenZoom, setImagenZoom] = useState(null);

    const userRaw = localStorage.getItem("usuario");
    const usuario = userRaw ? JSON.parse(userRaw) : null;

    const [modalForm, setModalForm] = useState(null);
    const [formData, setFormData] = useState({
        codigo_interno: "",
        nombre_producto: "",
        descripcion: "",
        precio: "",
        stock: "",
        id_categoria: "",
        imagen_url: null
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem("usuario"));
            const rol = user ? Number(user.id_rol) : null;
            if (!user || (rol !== 1 && rol !== 3)) {
                navigate("/DashboardAsesor", { replace: true });
            }
        } catch {
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const categoriasData = await productosService.getCategories();
                setCategorias(categoriasData || []);
            } catch (err) {
                console.error("Error cargando categorías:", err);
            }
        };
        fetchCategorias();
    }, []);

    const cargarProductos = async () => {
        try {
            setCargando(true);
            const data = await productosService.getAll();
            setProductos(data || []);
        } catch (err) {
            console.error("Error cargando productos:", err);
            setMensaje({ texto: "Error al cargar productos", tipo: "error" });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const productosFiltrados = productos.filter(p => {
        const matchCategoria = !categoriaActual || p.nombre_categoria === categoriaActual;
        const matchBusqueda = !busqueda ||
            p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.codigo_interno?.toLowerCase().includes(busqueda.toLowerCase());
        return matchCategoria && matchBusqueda;
    });

    const sugerencias = busqueda.trim().length > 0 
        ? productosFiltrados.slice(0, 5) 
        : [];

    const abrirFormulario = (producto = null) => {
        setPreviewUrl(null);
        setSelectedFile(null);
        if (producto) {
            setFormData({
                codigo_interno: producto.codigo_interno || "",
                nombre_producto: producto.nombre_producto || "",
                descripcion: producto.descripcion || "",
                precio: producto.precio || "",
                stock: producto.stock || 0,
                id_categoria: producto.id_categoria || "",
                imagen_url: producto.imagen_url || null
            });
            if (producto.imagen_url) {
                setPreviewUrl(resolveImageUrl(producto.imagen_url));
            }
            setModalForm({ tipo: "editar", id: producto.id_producto });
        } else {
            setFormData({
                codigo_interno: "",
                nombre_producto: "",
                descripcion: "",
                precio: "",
                stock: 0,
                id_categoria: "",
                imagen_url: null
            });
            setModalForm({ tipo: "crear" });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "stock") {
            // Solo digitos enteros y opcional signo negativo para poder validar y reportar error de stock negativo
            if (value !== "" && !/^-?\d*$/.test(value)) {
                return;
            }
        }
        if (name === "precio") {
            // Solo números y opcional signo negativo/decimales para poder validar y reportar error de precio negativo
            if (value !== "" && !/^-?\d*\.?\d*$/.test(value)) {
                return;
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMensaje({ texto: "La imagen es muy pesada (máx 5MB)", tipo: "error" });
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const eliminarImagen = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, imagen_url: "null" }));
    };

    const guardarProducto = async (e) => {
        e.preventDefault();
        
        // 1. Validaciones Código Interno (SKU - String)
        const codigo = formData.codigo_interno ? String(formData.codigo_interno).trim() : "";
        if (!codigo) {
            setMensaje({ texto: "El código interno es obligatorio", tipo: "error" });
            return;
        }
        if (codigo.length > 50) {
            setMensaje({ texto: "Se superó la longitud máxima permitida para el código", tipo: "error" });
            return;
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(codigo)) {
            setMensaje({ texto: "El formato del código es inválido", tipo: "error" });
            return;
        }

        // 2. Validaciones Nombre del Producto (String obligatorio, debe contener texto, sin números ni caracteres especiales)
        const nombre = formData.nombre_producto ? String(formData.nombre_producto).trim() : "";
        if (!nombre) {
            setMensaje({ texto: "El nombre es requerido", tipo: "error" });
            return;
        }
        if (/\d/.test(nombre)) {
            setMensaje({ texto: "El nombre del producto no puede contener números", tipo: "error" });
            return;
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
            setMensaje({ texto: "El nombre del producto no permite caracteres especiales", tipo: "error" });
            return;
        }
        if (nombre.length > 100) {
            setMensaje({ texto: "Exceso de longitud en el nombre", tipo: "error" });
            return;
        }

        // 3. Validaciones Descripción (String opcional, sin caracteres especiales peligrosos)
        const desc = formData.descripcion ? String(formData.descripcion).trim() : "";
        if (desc && /[<>{}\[\]\\^~*|=#$%@!?\"'`+]/g.test(desc)) {
            setMensaje({ texto: "La descripción no permite caracteres especiales", tipo: "error" });
            return;
        }
        if (desc.length > 500) {
            setMensaje({ texto: "Se superó el número máximo de caracteres permitidos", tipo: "error" });
            return;
        }

        // 4. Validaciones Precio (Number positivo > 0)
        const precioVal = formData.precio;
        if (precioVal === "" || precioVal === null || precioVal === undefined) {
            setMensaje({ texto: "El precio es requerido", tipo: "error" });
            return;
        }
        const precioNum = Number(precioVal);
        if (isNaN(precioNum)) {
            setMensaje({ texto: "El precio debe ser un número válido", tipo: "error" });
            return;
        }
        if (precioNum < 0) {
            setMensaje({ texto: "El sistema rechaza el registro (precio negativo)", tipo: "error" });
            return;
        }
        if (precioNum === 0) {
            setMensaje({ texto: "El precio debe ser mayor a cero", tipo: "error" });
            return;
        }

        // 5. Validaciones Stock (Number entero >= 0)
        const stockVal = formData.stock;
        if (stockVal === "" || stockVal === null || stockVal === undefined) {
            setMensaje({ texto: "El stock es obligatorio", tipo: "error" });
            return;
        }
        const stockNum = Number(stockVal);
        if (isNaN(stockNum)) {
            setMensaje({ texto: "El sistema rechaza el registro (stock no numérico)", tipo: "error" });
            return;
        }
        if (stockNum < 0) {
            setMensaje({ texto: "El stock no puede ser negativo", tipo: "error" });
            return;
        }
        if (!Number.isInteger(stockNum)) {
            setMensaje({ texto: "El stock debe ser un número entero (sin decimales)", tipo: "error" });
            return;
        }

        setGuardando(true);
        setMensaje({ texto: "", tipo: "" });

        try {
            const data = new FormData();
            data.append("nombre_producto", formData.nombre_producto);
            data.append("codigo_interno", formData.codigo_interno);
            data.append("descripcion", formData.descripcion);
            data.append("precio", formData.precio);
            data.append("stock", formData.stock);
            data.append("id_categoria", formData.id_categoria);
            
            if (selectedFile) {
                data.append("imagen", selectedFile);
            } else if (formData.imagen_url === "null") {
                data.append("imagen_url", "null");
            }

            if (modalForm.tipo === "editar") {
                await productosService.update(modalForm.id, data);
            } else {
                await productosService.create(data);
            }

            setMensaje({
                texto: modalForm.tipo === "editar" ? "Producto actualizado" : "Producto creado",
                tipo: "success"
            });
            setTimeout(() => setModalForm(null), 300);
            cargarProductos();
        } catch (error) {
            setMensaje({ texto: error.message || "Error al procesar producto", tipo: "error" });
        } finally {
            setGuardando(false);
        }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSubiendoMasivo(true);
            setMensaje({ texto: "Procesando archivo...", tipo: "info" });
            const respuesta = await productosService.bulkUpload(file);
            setMensaje({ 
                texto: `Subida completada. Creados: ${respuesta.resultados.creados}. Fallidos: ${respuesta.resultados.fallidos}`, 
                tipo: "success" 
            });
            if (respuesta.resultados.errores && respuesta.resultados.errores.length > 0) {
                console.warn("Errores en subida masiva:", respuesta.resultados.errores);
                alert(`Hubo ${respuesta.resultados.fallidos} errores en algunas filas. Revisa la consola para más detalles.`);
            }
            cargarProductos();
        } catch (error) {
            setMensaje({ texto: error.message || "Error al subir archivo masivo", tipo: "error" });
        } finally {
            setSubiendoMasivo(false);
            if (bulkInputRef.current) bulkInputRef.current.value = "";
        }
    };

    const eliminarProducto = async (id) => {
        if (!confirm("¿Eliminar este producto?")) return;
        try {
            await productosService.delete(id);
            setMensaje({ texto: "Producto eliminado", tipo: "success" });
            cargarProductos();
        } catch (error) {
            setMensaje({ texto: error.message || "Error de conexión", tipo: "error" });
        }
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(precio);
    };

    return (
        <div className="dashboard-container">
        

            {/* DISEÑO FULL WIDTH */}
            <div className="catalogo-contenido">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="catalogo-wrapper-premium"
                >
                    <div className="catalogo-header-premium">
                        <div className="catalogo-icono-titulo">
                            <div className="catalogo-icono-badge">
                                <Package size={24} />
                            </div>
                            <h2>Gestión Integral de Productos</h2>
                        </div>
                        {(usuario?.id_rol === 1 || usuario?.id_rol === 3) && (
                            <div className="catalogo-acciones-enterprise">
                                <input 
                                    type="file" 
                                    ref={bulkInputRef} 
                                    onChange={handleBulkUpload} 
                                    accept=".xlsx, .csv" 
                                    style={{ display: "none" }} 
                                  />
                                <button 
                                    onClick={() => navigate("/categorias")}
                                    className="btn-outline-enterprise"
                                    title="Gestionar Categorías"
                                >
                                    <Layers size={18} /> Categorías
                                </button>
                                <button 
                                    onClick={() => bulkInputRef.current?.click()} 
                                    className="btn-ghost-enterprise"
                                    disabled={subiendoMasivo}
                                    title="Subida Masiva Excel/CSV"
                                >
                                    {subiendoMasivo ? "Subiendo..." : <><Upload size={18} /> Masivo</>}
                                </button>
                                <button onClick={() => abrirFormulario()} className="btn-premium">
                                    <Plus size={20} /> Nuevo Producto
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="perfil-contenido">
                        {/* Categorías */}
                        <div className="catalogo-filtro-categorias">
                            <button onClick={() => setCategoriaActual(null)} className={!categoriaActual ? "tab-pill active" : "tab-pill"}>
                                Todo el Inventario
                            </button>
                            {categorias.map(cat => (
                                <button key={cat.id_categoria} onClick={() => setCategoriaActual(cat.nombre_categoria)} className={categoriaActual === cat.nombre_categoria ? "tab-pill active" : "tab-pill"}>
                                    {cat.nombre_categoria}
                                </button>
                            ))}
                        </div>

                        {/* Buscador */}
                        <div ref={searchRef} className="catalogo-buscador">
                            <div className="catalogo-buscador__campo">
                                <Search size={20} className="catalogo-buscador__icono" />
                                <input
                                    type="text" placeholder="Localizar producto por nombre o SKU..."
                                    value={busqueda}
                                    onChange={(e) => {setBusqueda(e.target.value); setMostrarSugerencias(true);}}
                                    onFocus={() => setMostrarSugerencias(true)}
                                    className="seg-input catalogo-buscador__input"
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="catalog-grid catalogo-grid">
                            {cargando ? (
                                <div className="seg-loading catalogo-estado-full catalogo-cargando">
                                    <div className="loader"></div>
                                    <p>Cargando catálogo premium...</p>
                                </div>
                            ) : productosFiltrados.length === 0 ? (
                                <div className="seg-empty catalogo-estado-full catalogo-vacio">
                                    <Package size={48} className="catalogo-vacio__icono" />
                                    <p>No se encontraron productos</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {productosFiltrados.map((producto, index) => {
                                        const isLowStock = producto.stock > 0 && producto.stock <= 10;
                                        const isOutOfStock = producto.stock === 0;
                                        const imageUrl = producto.imagen_url ? resolveImageUrl(producto.imagen_url) : null;
                                        
                                        return (
                                        <motion.div 
                                            layout 
                                            key={producto.id_producto} 
                                            initial={{ opacity: 0, y: 30, scale: 0.9 }} 
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.03 }}
                                            className="premium-glass-card tarjeta-producto"
                                        >
                                            {/* Stock Badge */}
                                            <motion.div 
                                                whileHover={{ scale: 1.1 }}
                                                className={`stock-badge tarjeta-producto__badge-stock ${isOutOfStock ? 'low-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}
                                            >
                                                {isOutOfStock ? "Agotado" : `${producto.stock} uds`}
                                            </motion.div>

                                            {/* Imagen del producto con efecto glass */}
                                            <div 
                                                className="tarjeta-producto__imagen-container" 
                                                onClick={() => { if (imageUrl) setImagenZoom(imageUrl); }}
                                                style={{ cursor: imageUrl ? 'zoom-in' : 'default' }}
                                            >
                                                <div className="tarjeta-producto__imagen">
                                                    {imageUrl ? (
                                                        <img src={imageUrl} alt={producto.nombre_producto} />
                                                    ) : (
                                                        <Package size={40} className="product-card-icon" color="var(--color-primary)" />
                                                    )}
                                                </div>
                                                <div className="tarjeta-producto__categoria-glass">
                                                    {producto.nombre_categoria}
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="tarjeta-producto__cuerpo-glass">
                                                <div className="tarjeta-producto__info">
                                                    {producto.codigo_interno && (
                                                        <span className="tarjeta-producto__codigo-glass">
                                                            {producto.codigo_interno}
                                                        </span>
                                                    )}

                                                    <h4 className="tarjeta-producto__nombre-glass" title={producto.nombre_producto}>
                                                        {producto.nombre_producto}
                                                    </h4>
                                                    
                                                    {producto.descripcion && (
                                                        <p className="tarjeta-producto__desc-glass" title={producto.descripcion}>
                                                            {producto.descripcion}
                                                        </p>
                                                    )}

                                                    <div className="tarjeta-producto__precio-contenedor">
                                                        <p className="tarjeta-producto__precio-glass">
                                                            {formatearPrecio(producto.precio)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {(usuario?.id_rol === 1 || usuario?.id_rol === 3) && (
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '1.2rem' }}>
                                                        <motion.button 
                                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                            onClick={() => abrirFormulario(producto)} 
                                                            className="btn-glass-premium" style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem' }}
                                                        >
                                                            <Edit2 size={14} /> Editar
                                                        </motion.button>
                                                        <motion.button 
                                                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(231, 76, 60, 0.2)' }} whileTap={{ scale: 0.95 }}
                                                            onClick={() => eliminarProducto(producto.id_producto)} 
                                                            className="btn-glass-premium" style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--color-danger)', color: 'var(--color-danger)' }}
                                                        >
                                                            <Trash2 size={14} /> Borrar
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )})}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* MODAL CON LIVE PREVIEW Y UPLOAD */}
            <AnimatePresence>
                {modalForm && (
                    <div className="modal-overlay" onClick={() => setModalForm(null)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="modal-content premium-modal catalogo-modal-grid" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* LADO IZQUIERDO: FORMULARIO */}
                            <div className="custom-scrollbar catalogo-modal-formulario">
                                <div className="catalogo-modal-cabecera">
                                    <div className="modal-title-group">
                                        <div className="modal-icon-badge">
                                            {modalForm.tipo === "editar" ? <Edit2 size={24} /> : <Plus size={24} />}
                                        </div>
                                        <h3>{modalForm.tipo === "editar" ? "Editar Producto" : "Nuevo Producto"}</h3>
                                    </div>
                                </div>

                                {mensaje.texto && (
                                    <div style={{ padding: '10px', margin: '15px 20px 0', borderRadius: '6px', backgroundColor: mensaje.tipo === 'error' ? '#fee2e2' : '#dcfce3', color: mensaje.tipo === 'error' ? '#991b1b' : '#166534', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {mensaje.tipo === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                        {mensaje.texto}
                                    </div>
                                )}

                                <form onSubmit={guardarProducto} className="premium-form" noValidate>
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label><Search size={14} /> Código SKU</label>
                                            <input type="text" name="codigo_interno" value={formData.codigo_interno} onChange={handleChange} placeholder="PRN-001" />
                                        </div>
                                        <div className="input-group">
                                            <label><Tag size={14} /> Categoría *</label>
                                            <select name="id_categoria" value={formData.id_categoria} onChange={handleChange} required>
                                                <option value="">Selecciona...</option>
                                                {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="input-group full">
                                        <label><Info size={14} /> Nombre del Producto *</label>
                                        <input type="text" name="nombre_producto" value={formData.nombre_producto} onChange={handleChange} required pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$" title="Solo se permiten letras" />
                                    </div>

                                    <div className="input-group full">
                                        <label><Info size={14} /> Descripción</label>
                                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} />
                                    </div>

                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label><DollarSign size={14} /> Precio *</label>
                                            <input type="number" name="precio" value={formData.precio} onChange={handleChange} required min="0" />
                                        </div>
                                        <div className="input-group">
                                            <label><Package size={14} /> Stock</label>
                                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" />
                                        </div>
                                    </div>

                                    {/* SECCIÓN DE CARGA DE IMAGEN */}
                                    <div className="input-group full">
                                        <label><ImageIcon size={14} /> Imagen del Producto</label>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="catalogo-upload-zona"
                                        >
                                            <Upload className="catalogo-upload-icono" />
                                            <p className="catalogo-upload-texto">
                                                {selectedFile ? selectedFile.name : "Haga clic para subir una foto real"}
                                            </p>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="catalogo-upload-oculto" />
                                        </div>
                                        {(previewUrl || formData.imagen_url) && (
                                            <button type="button" onClick={eliminarImagen} className="catalogo-eliminar-foto">
                                                Eliminar foto y volver al icono por defecto
                                            </button>
                                        )}
                                    </div>

                                    <div className="premium-modal-footer">
                                        <button type="button" onClick={() => setModalForm(null)} className="btn-cancel-premium">Cancelar</button>
                                        <button type="submit" className="btn-premium-action" disabled={guardando}>
                                            {guardando ? "Guardando..." : "Guardar Producto"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* LADO DERECHO: LIVE PREVIEW */}
                            <div className="catalogo-modal-preview">
                                <p className="catalogo-preview-etiqueta">
                                    Previsualización en Vivo
                                </p>
                                <div className="premium-glass-card tarjeta-producto catalogo-preview-card">
                                    {/* Stock Badge */}
                                    <div className="stock-badge tarjeta-producto__badge-stock in-stock">
                                        {formData.stock || 0} uds
                                    </div>

                                    {/* Imagen con efecto glass */}
                                    <div className="tarjeta-producto__imagen-container">
                                        <div className="tarjeta-producto__imagen">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" />
                                            ) : (
                                                <Package size={40} className="product-card-icon" color="var(--color-primary)" />
                                            )}
                                        </div>
                                        <div className="tarjeta-producto__categoria-glass">
                                            {categorias.find(c => c.id_categoria == formData.id_categoria)?.nombre_categoria || "Categoría"}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="tarjeta-producto__cuerpo-glass">
                                        <div className="tarjeta-producto__info">
                                            <span className="tarjeta-producto__codigo-glass">
                                                {formData.codigo_interno || "SKU-000"}
                                            </span>

                                            <h4 className="tarjeta-producto__nombre-glass">
                                                {formData.nombre_producto || "Nombre del Producto"}
                                            </h4>
                                            
                                            <p className="tarjeta-producto__desc-glass">
                                                {formData.descripcion || "Descripción del producto..."}
                                            </p>

                                            <div className="tarjeta-producto__precio-contenedor">
                                                <p className="tarjeta-producto__precio-glass">
                                                    {formatearPrecio(formData.precio || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* LIGHTBOX PARA ZOOM DE IMAGEN */}
            <AnimatePresence>
                {imagenZoom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="catalogo-lightbox"
                        onClick={() => setImagenZoom(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="catalogo-lightbox-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="catalogo-lightbox-close" onClick={() => setImagenZoom(null)}>
                                <X size={32} />
                            </button>
                            <img src={imagenZoom} alt="Zoom" className="catalogo-lightbox-img" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
