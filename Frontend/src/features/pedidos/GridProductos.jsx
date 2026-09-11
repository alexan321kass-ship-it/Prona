import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, X, Package, Plus } from "lucide-react";
import TarjetaProducto from "./TarjetaProducto";
import "./pedidos.css";

import "../../compartido/styles/autocompletado.css";

export default function GridProductos({ productos, agregarAlCarrito, formatearPrecio }) {
    const [busquedaProducto, setBusquedaProducto] = useState("");
    const [enfocado, setEnfocado] = useState(false);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const ref = useRef();
    const searchRef = useRef();

    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setMostrarSugerencias(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtrados = productos.filter(p => {
        if (!busquedaProducto) return true;
        const q = busquedaProducto.toLowerCase();
        return p.nombre_producto?.toLowerCase().includes(q) ||
               p.codigo_interno?.toLowerCase().includes(q);
    });

    const sugerencias = busquedaProducto.trim()
        ? filtrados.slice(0, 5)
        : [];

    return (
        <>
            {/* Buscador Píldora Flotante */}
            <div ref={searchRef} className="autocompletado-contenedor" style={{ marginBottom: '2rem', zIndex: 100 }}>
                <div className="autocompletado-campo">
                    <Search
                        size={20}
                        className="autocompletado-icono-busqueda"
                        style={{ color: enfocado ? 'var(--color-primary)' : '#9ca3af' }}
                    />
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre o código SKU..."
                        value={busquedaProducto}
                        onChange={(e) => {
                            setBusquedaProducto(e.target.value);
                            setMostrarSugerencias(true);
                        }}
                        onFocus={() => {
                            setEnfocado(true);
                            if (busquedaProducto.trim()) setMostrarSugerencias(true);
                        }}
                        onBlur={() => setEnfocado(false)}
                        className={`autocompletado-entrada ${enfocado ? 'activo' : ''}`}
                    />
                    {busquedaProducto && (
                        <button
                            onClick={() => { setBusquedaProducto(""); setMostrarSugerencias(false); }}
                            className="autocompletado-boton-limpiar"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Dropdown de sugerencias */}
                {mostrarSugerencias && sugerencias.length > 0 && (
                    <div className="autocompletado-lista">
                        {sugerencias.map((p) => (
                            <div
                                key={p.id_producto}
                                className="autocompletado-item"
                                onClick={() => {
                                    setBusquedaProducto(p.nombre_producto);
                                    setMostrarSugerencias(false);
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: 'var(--color-primary-glass)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Package size={18} color="var(--color-primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1f2937' }}>{p.nombre_producto}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>{formatearPrecio(p.precio)}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        agregarAlCarrito(p);
                                    }}
                                    style={{
                                        background: 'var(--color-primary)', color: 'white', padding: '6px',
                                        borderRadius: '8px', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Grid de productos */}
            <div className="grid-productos">
                <AnimatePresence mode="popLayout">
                    {filtrados.length > 0 ? (
                        filtrados.map((p) => (
                            <TarjetaProducto
                                key={p.id_producto}
                                producto={p}
                                agregarAlCarrito={agregarAlCarrito}
                                formatearPrecio={formatearPrecio}
                            />
                        ))
                    ) : (
                        <div className="seg-empty" key="empty">
                            <p>No se encontraron productos</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
