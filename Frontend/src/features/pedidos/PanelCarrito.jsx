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
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="carrito-item"
                                        style={{ padding: '12px', gap: '12px', alignItems: 'flex-start' }}
                                    >
                                        {/* Miniatura */}
                                        <div className="carrito-item__miniatura" style={{ width: '60px', height: '60px', borderRadius: '12px' }}>
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={item.nombre_producto} style={{ borderRadius: '8px' }} />
                                            ) : (
                                                <Package size={24} color="#9ca3af" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="carrito-item__info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                            <p className="carrito-item__nombre" style={{ fontSize: '0.95rem', marginBottom: '4px', lineHeight: '1.2' }}>{item.nombre_producto}</p>
                                            <p className="carrito-item__precio" style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{formatearPrecio(item.precio * (item.cantidad || 1))}</p>
                                        </div>

                                        {/* Controles */}
                                        <div className="carrito-item__controles" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <button
                                                onClick={() => eliminarItem(item.id_producto)}
                                                className="carrito-item__boton-eliminar"
                                                title="Eliminar producto"
                                                style={{ padding: '6px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            
                                            <div className="carrito-item__cantidad-grupo" style={{ padding: '2px', background: 'rgba(0,0,0,0.04)', borderRadius: '100px' }}>
                                                <button
                                                    onClick={() => modificarCantidad(item.id_producto, -1)}
                                                    className="carrito-item__boton-cantidad"
                                                    style={{ padding: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <input 
                                                    type="number"
                                                    value={item.cantidad === undefined ? 1 : item.cantidad}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setCarrito(carrito.map(i => {
                                                            if (i.id_producto === item.id_producto) {
                                                                if (val === '') return { ...i, cantidad: '' };
                                                                const num = parseInt(val, 10);
                                                                return { ...i, cantidad: isNaN(num) ? 1 : num };
                                                            }
                                                            return i;
                                                        }));
                                                    }}
                                                    onBlur={(e) => {
                                                        if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                                                            modificarCantidad(item.id_producto, 1 - (parseInt(item.cantidad) || 0)); // Resets to 1
                                                        }
                                                    }}
                                                    className="carrito-item__cantidad-input"
                                                    style={{
                                                        width: '30px', 
                                                        textAlign: 'center', 
                                                        border: 'none', 
                                                        background: 'transparent', 
                                                        fontSize: '0.85rem', 
                                                        fontWeight: 700,
                                                        color: '#1f2937',
                                                        outline: 'none',
                                                        MozAppearance: 'textfield' // hide arrows in firefox
                                                    }}
                                                />
                                                <button
                                                    onClick={() => modificarCantidad(item.id_producto, 1)}
                                                    className="carrito-item__boton-cantidad"
                                                    style={{ padding: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
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
                    <div className="carrito-sidebar__inputs-cotizacion" style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>Desc (%)</label>
                            <input 
                                type="number" 
                                min="0" max="100" 
                                value={descuento} 
                                onChange={e => setDescuento(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', color: '#111827', fontWeight: 600 }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                            />
                        </div>
                        <div style={{ flex: 2 }}>
                            <label htmlFor="vigenciaInput" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase' }}>Vigencia</label>
                            <input 
                                id="vigenciaInput"
                                type="date" 
                                value={vigencia} 
                                onChange={e => setVigencia(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', color: '#111827', fontWeight: 600 }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                            />
                        </div>
                    </div>

                    <div className="carrito-sidebar__totales">
                        <div className="carrito-sidebar__linea-total">
                            <span>Subtotal ({totalItems} items)</span>
                            <span style={{ color: '#1f2937' }}>{formatearPrecio(subtotal)}</span>
                        </div>
                        {Number(descuento) > 0 && (
                            <div className="carrito-sidebar__linea-total" style={{ color: '#059669' }}>
                                <span>Descuento ({descuento}%)</span>
                                <span style={{ fontWeight: 600 }}>-{formatearPrecio(subtotal * (Number(descuento) / 100))}</span>
                            </div>
                        )}
                        <div className="carrito-sidebar__linea-total">
                            <span>IVA (19%)</span>
                            <span style={{ color: '#1f2937' }}>{formatearPrecio((subtotal - (subtotal * (Number(descuento) / 100))) * 0.19)}</span>
                        </div>
                        <div className="carrito-sidebar__total-final">
                            <span style={{ color: '#111827' }}>Total Final</span>
                            <span className="carrito-sidebar__total-monto" style={{ color: 'var(--color-primary-dark)' }}>
                                {formatearPrecio((subtotal - (subtotal * (Number(descuento) / 100))) * 1.19)}
                            </span>
                        </div>
                    </div>

                    <div className="carrito-sidebar__acciones" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1.5rem' }}>
                        <button
                            onClick={onCotizar}
                            className="btn-outline-enterprise"
                            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
                        >
                            <FileText size={18} /> Generar Cotización
                        </button>
                        <button
                            onClick={onConfirmar}
                            disabled={cargandoPedido || !clienteSeleccionado}
                            className="btn-premium"
                            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
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
