import React from "react";
import "./pedidos.css";

export default function FiltrosCategorias({ categorias, categoriaActual, setCategoriaActual }) {
    return (
        <div className="filtros-categorias">
            <button
                onClick={() => setCategoriaActual(null)}
                className={!categoriaActual ? "tab-pill active" : "tab-pill"}
            >
                Todos
            </button>
            {categorias.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setCategoriaActual(cat)}
                    className={categoriaActual === cat ? "tab-pill active" : "tab-pill"}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
