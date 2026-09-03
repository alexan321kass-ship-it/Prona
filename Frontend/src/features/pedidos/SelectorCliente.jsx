import React, { useState, useRef, useEffect } from "react";
import { UserSearch, X, CheckCircle2 } from "lucide-react";
import "./pedidos.css";

export default function SelectorCliente({ clientes, clienteSeleccionado, setClienteSeleccionado }) {
    const [busqueda, setBusqueda] = useState("");
    const [abierto, setAbierto] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtrados = clientes.filter(c => 
        c.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.identificacion?.includes(busqueda)
    ).slice(0, 6);

    const seleccionar = (cli) => {
        setClienteSeleccionado(cli);
        setBusqueda("");
        setAbierto(false);
    };

    const limpiar = () => {
        setClienteSeleccionado(null);
        setBusqueda("");
    };

    return (
        <div ref={ref} className="selector-cliente">
            <label className="selector-cliente__etiqueta">
                SELECCIONAR CLIENTE
            </label>
            
            <div className="selector-cliente__campo">
                {clienteSeleccionado ? (
                    <CheckCircle2 
                        size={20} 
                        className="selector-cliente__icono selector-cliente__icono--activo" 
                    />
                ) : (
                    <UserSearch 
                        size={20} 
                        className="selector-cliente__icono selector-cliente__icono--inactivo" 
                    />
                )}
                
                <input
                    type="text"
                    value={clienteSeleccionado ? clienteSeleccionado.nombre_cliente : busqueda}
                    onChange={(e) => {
                        setBusqueda(e.target.value);
                        setAbierto(true);
                    }}
                    onFocus={() => setAbierto(true)}
                    placeholder="Buscar por nombre o identificación..."
                    className={`seg-input selector-cliente__input ${clienteSeleccionado ? "selector-cliente__input--seleccionado" : ""}`}
                    readOnly={!!clienteSeleccionado}
                />
                
                {clienteSeleccionado && (
                    <button onClick={limpiar} className="selector-cliente__boton-limpiar">
                        <X size={18} />
                    </button>
                )}
            </div>

            {abierto && !clienteSeleccionado && filtrados.length > 0 && (
                <div className="selector-cliente__dropdown">
                    <div className="selector-cliente__dropdown-lista">
                        {filtrados.map((c) => (
                            <div 
                                key={c.id_cliente} 
                                onClick={() => seleccionar(c)}
                                className="selector-cliente__opcion"
                            >
                                <span className="selector-cliente__opcion-nombre">{c.nombre_cliente}</span>
                                <span className="selector-cliente__opcion-id">{c.identificacion}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
