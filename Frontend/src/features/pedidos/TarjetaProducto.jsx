import React from "react";
import { motion } from "framer-motion";
import { Package, Plus } from "lucide-react";
import { API_BASE, UPLOAD_BASE } from "../../config/api";
import "./pedidos.css";

export default function TarjetaProducto({ producto, agregarAlCarrito, formatearPrecio }) {
    const isLowStock = producto.stock > 0 && producto.stock <= 10;
    const isOutOfStock = producto.stock === 0;

    const resolveImageUrl = (url) => {
        if (!url || url === 'null') return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        return `${UPLOAD_BASE}/${url}`;
    };

    const imageUrl = producto.imagen_url ? resolveImageUrl(producto.imagen_url) : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="premium-glass-card tarjeta-producto"
        >
            {/* Stock Badge Dinámico */}
            <motion.div 
                whileHover={{ scale: 1.08 }}
                className={`stock-badge tarjeta-producto__badge-stock ${isOutOfStock ? 'stock-badge--agotado' : isLowStock ? 'stock-badge--bajo' : 'stock-badge--disponible'}`}
            >
                {isOutOfStock ? "Agotado (0 uds)" : isLowStock ? `¡Bajo Stock: ${producto.stock} uds!` : `En Stock: ${producto.stock} uds`}
            </motion.div>

            {/* Imagen del producto con efecto glass */}
            <div className="tarjeta-producto__imagen-container">
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

                <motion.button
                    whileHover={!isOutOfStock ? { scale: 1.05, boxShadow: "0px 5px 15px rgba(255,59,48,0.4)" } : {}}
                    whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={isOutOfStock}
                    className={`btn-glass-premium tarjeta-producto__boton-agregar ${isOutOfStock ? "tarjeta-producto__boton-agregar--agotado" : ""}`}
                >
                    {isOutOfStock ? "Agotado" : <><Plus size={16} /> Añadir</>}
                </motion.button>
            </div>
        </motion.div>
    );
}
