import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Minus, Plus, Trash2, FileText, Send, UserCircle2, AlertCircle, Package } from "lucide-react";
import { UPLOAD_BASE } from "../../config/api";
import "./pedidos.css";

export default function PanelCarrito({ 
    carrito, 
    setCarrito, 
    clienteSeleccionado, 
    formatearPrecio, 
    onConfirmar, 
    onCotizar,
    cargandoPedido,
    isOpen,
    onClose,
    descuento,
    setDescuento,
    vigencia,
    setVigencia
}) {
    const modificarCantidad = (idProducto, delta) => {
        setCarrito(carrito.map(item => {
            if (item.id_producto === idProducto) {
                const nuevaCantidad = Math.max(1, (item.cantidad || 1) + delta);
                return { ...item, cantidad: nuevaCantidad };
            }
            return item;
        }));
    };

    const eliminarItem = (idProducto) => {
        setCarrito(carrito.filter(item => item.id_producto !== idProducto));
    };

    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);

    return (
        <div className={`carrito-sidebar ${isOpen ? "carrito-sidebar--abierto" : ""}`}>
            {/* HEADER */}
            <div className="carrito-sidebar__cabecera">
                <div className="carrito-sidebar__cabecera-fila">
                    <div className="carrito-sidebar__titulo-grupo">
                        <ShoppingCart size={24} />
                        <h3 className="carrito-sidebar__titulo">Carrito ({totalItems})</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="carrito-sidebar__boton-cerrar"
                        title="Cerrar carrito"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Cliente seleccionado */}
                {clienteSeleccionado ? (
                    <div className="carrito-sidebar__cliente">
                        <UserCircle2 size={20} />
                        <span className="carrito-sidebar__cliente-nombre">
                            {clienteSeleccionado.nombre_cliente}
                        </span>
                    </div>
                ) : (
                    <span className="carrito-sidebar__sin-cliente">
                        Sin cliente seleccionado
                    </span>
                )}
            </div>

            {/* ITEMS */}
            <div className="carrito-sidebar__items">
                {carrito.length === 0 ? (
                    <div className="carrito-sidebar__vacio">
                        <ShoppingCart size={48} />
                        <span className="carrito-sidebar__vacio-texto">
                            Tu carrito está vacío
                        </span>
                    </div>
                ) : (
                    <div className="carrito-sidebar__lista">
                        <AnimatePresence>
                            {carrito.map((item) => {
                                const resolveImageUrl = (url) => {
  if (!url) return null;
  // If URL already absolute (http/https or data/blob), return as is
  if (/^(https?:|blob:)/i.test(url)) return url;
  // Otherwise prepend the upload base path
  return `${UPLOAD_BASE}/${url}`;
};

const imageUrl = resolveImageUrl(item.imagen_url);

                                return (
                                    <motion.div
                                        key={item.id_producto}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="carrito-item"
                                    >
                                        {/* Miniatura */}
                                        <div className="carrito-item__miniatura">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={item.nombre_producto} />
                                            ) : (
                                                <Package size={20} color="var(--color-text-muted)" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="carrito-item__info">
                                            <p className="carrito-item__nombre">{item.nombre_producto}</p>
                                            <p className="carrito-item__precio">{formatearPrecio(item.precio * (item.cantidad || 1))}</p>
                                        </div>

                                        {/* Controles */}
                                        <div className="carrito-item__controles">
                                            <div className="carrito-item__cantidad-grupo">
                                                <button
                                                    onClick={() => modificarCantidad(item.id_producto, -1)}
                                                    className="carrito-item__boton-cantidad"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="carrito-item__cantidad-valor">{item.cantidad || 1}</span>
                                                <button
                                                    onClick={() => modificarCantidad(item.id_producto, 1)}
                                                    className="carrito-item__boton-cantidad"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => eliminarItem(item.id_producto)}
                                                className="carrito-item__boton-eliminar"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            {carrito.length > 0 && (
                <div className="carrito-sidebar__pie">
                    <div className="carrito-sidebar__inputs-cotizacion" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: '#666' }}>Descuento (%)</label>
                            <input 
                                type="number" 
                                min="0" max="100" 
                                value={descuento} 
                                onChange={e => setDescuento(e.target.value)}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label htmlFor="vigenciaInput" style={{ fontSize: '12px', color: '#666' }}>Vigencia</label>
                            <input 
                                id="vigenciaInput"
                                type="date" 
                                value={vigencia} 
                                onChange={e => setVigencia(e.target.value)}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>

                    <div className="carrito-sidebar__totales">
                        <div className="carrito-sidebar__linea-total">
                            <span>Subtotal ({totalItems} items)</span>
                            <span>{formatearPrecio(subtotal)}</span>
                        </div>
                        {Number(descuento) > 0 && (
                            <div className="carrito-sidebar__linea-total" style={{ color: '#27ae60' }}>
                                <span>Descuento ({descuento}%)</span>
                                <span>-{formatearPrecio(subtotal * (Number(descuento) / 100))}</span>
                            </div>
                        )}
                        <div className="carrito-sidebar__linea-total">
                            <span>IVA (19%)</span>
                            <span>{formatearPrecio((subtotal - (subtotal * (Number(descuento) / 100))) * 0.19)}</span>
                        </div>
                        <div className="carrito-sidebar__total-final">
                            <span>Total Final</span>
                            <span className="carrito-sidebar__total-monto">
                                {formatearPrecio((subtotal - (subtotal * (Number(descuento) / 100))) * 1.19)}
                            </span>
                        </div>
                    </div>

                    <div className="carrito-sidebar__acciones">
                        <button
                            onClick={onCotizar}
                            className="btn-secondary carrito-sidebar__boton-cotizacion"
                        >
                            <FileText size={18} /> Generar Cotización
                        </button>
                        <button
                            onClick={onConfirmar}
                            disabled={cargandoPedido || !clienteSeleccionado}
                            className="btn-primary carrito-sidebar__boton-confirmar"
                        >
                            <Send size={18} />
                            {cargandoPedido ? "Procesando..." : "Confirmar Pedido"}
                        </button>
                    </div>

                    {!clienteSeleccionado && (
                        <div className="carrito-sidebar__alerta-cliente">
                            <AlertCircle size={14} /> Selecciona un cliente para continuar
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
