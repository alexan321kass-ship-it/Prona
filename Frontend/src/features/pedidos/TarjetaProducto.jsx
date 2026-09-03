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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="premium-card product-item-card tarjeta-producto"
        >
            {/* Stock Badge */}
            <div 
                className={`stock-badge tarjeta-producto__badge-stock ${isOutOfStock ? 'low-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}
            >
                {isOutOfStock ? "Agotado" : `${producto.stock} uds`}
            </div>

            {/* Imagen del producto */}
            <div className="product-card-image tarjeta-producto__imagen">
                {imageUrl ? (
                    <img src={imageUrl} alt={producto.nombre_producto} />
                ) : (
                    <Package size={40} className="product-card-icon" />
                )}
                
                <div className="tarjeta-producto__categoria">
                    {producto.nombre_categoria}
                </div>
            </div>

            {/* Body */}
            <div className="product-card-body tarjeta-producto__cuerpo">
                <div>
                    {producto.codigo_interno && (
                        <span className="tarjeta-producto__codigo">
                            {producto.codigo_interno}
                        </span>
                    )}

                    <h4 className="product-name tarjeta-producto__nombre">
                        {producto.nombre_producto}
                    </h4>

                    <div className="tarjeta-producto__precio-contenedor">
                        <p className="tarjeta-producto__precio">
                            {formatearPrecio(producto.precio)}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={isOutOfStock}
                    className={`btn-premium tarjeta-producto__boton-agregar ${isOutOfStock ? "tarjeta-producto__boton-agregar--agotado" : ""}`}
                >
                    {isOutOfStock ? "Agotado" : <><Plus size={14} /> Añadir</>}
                </button>
            </div>
        </motion.div>
    );
}
