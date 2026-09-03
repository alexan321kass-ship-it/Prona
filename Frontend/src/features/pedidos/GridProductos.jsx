import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, X, Package, Plus } from "lucide-react";
import TarjetaProducto from "./TarjetaProducto";
import "./pedidos.css";

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
            {/* Buscador con sugerencias */}
            <div ref={searchRef} className="grid-buscador">
                <div className="grid-buscador__campo">
                    <Search
                        size={20}
                        className={`grid-buscador__icono ${enfocado ? "grid-buscador__icono--activo" : "grid-buscador__icono--inactivo"}`}
                    />
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre o código..."
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
                        className={`seg-input grid-buscador__input ${enfocado ? "grid-buscador__input--enfocado" : ""}`}
                    />
                    {busquedaProducto && (
                        <button
                            onClick={() => { setBusquedaProducto(""); setMostrarSugerencias(false); }}
                            className="grid-buscador__boton-limpiar"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Dropdown de sugerencias */}
                {mostrarSugerencias && sugerencias.length > 0 && (
                    <div className="grid-dropdown">
                        <div className="grid-dropdown__lista">
                            {sugerencias.map((p) => (
                                <div
                                    key={p.id_producto}
                                    className="grid-dropdown__item"
                                    onClick={() => {
                                        setBusquedaProducto(p.nombre_producto);
                                        setMostrarSugerencias(false);
                                    }}
                                >
                                    <div className="grid-dropdown__item-info">
                                        <div className="grid-dropdown__item-icono">
                                            <Package size={18} color="var(--color-primary)" />
                                        </div>
                                        <div>
                                            <div className="grid-dropdown__item-nombre">{p.nombre_producto}</div>
                                            <div className="grid-dropdown__item-precio">{formatearPrecio(p.precio)}</div>
                                        </div>
                                    </div>

                                    <button
                                        className="grid-dropdown__item-boton"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            agregarAlCarrito(p);
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="grid-dropdown__pie">
                            {filtrados.length} productos encontrados
                        </div>
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
