import React, { useState, useRef, useEffect } from "react";
import { UserSearch, X, CheckCircle2, Building2 } from "lucide-react";
import "./pedidos.css";

export default function SelectorCliente({ clientes = [], clienteSeleccionado, setClienteSeleccionado }) {
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

    const safeClientes = Array.isArray(clientes) ? clientes : [];

    const filtrados = safeClientes.filter(c => 
        c.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.identificacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.correo_cliente?.toLowerCase().includes(busqueda.toLowerCase())
    );

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
        <div ref={ref} className="selector-cliente" style={{ position: "relative" }}>
            <label className="selector-cliente__etiqueta">
                SELECCIONAR CLIENTE ({safeClientes.length} DISPONIBLES)
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
                    placeholder="Buscar por nombre, NIT o cédula..."
                    className={`seg-input selector-cliente__input ${clienteSeleccionado ? "selector-cliente__input--seleccionado" : ""}`}
                    readOnly={!!clienteSeleccionado}
                />
                
                {clienteSeleccionado && (
                    <button onClick={limpiar} className="selector-cliente__boton-limpiar" type="button" title="Cambiar cliente">
                        <X size={18} />
                    </button>
                )}
            </div>

            {abierto && !clienteSeleccionado && (
                <div className="selector-cliente__dropdown">
                    {filtrados.length > 0 ? (
                        <div className="selector-cliente__dropdown-lista">
                            {filtrados.map((c) => (
                                <div 
                                    key={c.id_cliente} 
                                    onClick={() => seleccionar(c)}
                                    className="selector-cliente__opcion"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Building2 size={16} className="text-gray-400" />
                                        <div>
                                            <div className="selector-cliente__opcion-nombre">{c.nombre_cliente}</div>
                                            {c.correo_cliente && (
                                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{c.correo_cliente}</div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="selector-cliente__opcion-id">NIT/CC: {c.identificacion}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>
                            No se encontraron clientes coincidentes
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
