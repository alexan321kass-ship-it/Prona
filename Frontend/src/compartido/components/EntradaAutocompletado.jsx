import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import "../styles/autocompletado.css";

/**
 * EntradaAutocompletado - Componente de búsqueda inteligente
 * @param {string} value - Valor actual del input
 * @param {function} onChange - Función para manejar el cambio
 * @param {Array} suggestions - Lista de strings para sugerir
 * @param {string} placeholder - Texto decorativo
 * @param {string} className - Clases adicionales
 */
export default function EntradaAutocompletado({ 
  value, 
  onChange, 
  suggestions = [], 
  placeholder = "Buscar...", 
  onSelect,
  className = "" 
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // Filtrar sugerencias basadas en el input
  useEffect(() => {
    if (value && value.length > 0) {
      const matches = suggestions.filter(s => 
        s && s.toLowerCase().includes(value.toLowerCase()) &&
        s.toLowerCase() !== value.toLowerCase()
      );
      // Tomar solo las primeras 6 sugerencias únicas
      setFiltered([...new Set(matches)].slice(0, 6));
    } else {
      // Mostrar últimas sugerencias si no hay texto (enfoque inicial)
      if (suggestions && suggestions.length > 0) {
         setFiltered([...new Set(suggestions)].slice(0, 6));
      } else {
         setFiltered([]);
      }
    }
  }, [value, suggestions]);

  // Manejar clics fuera del componente para cerrar la lista
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && filtered[activeIndex]) {
        handleChoice(filtered[activeIndex]);
      }
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleChoice = (choice) => {
    onChange(choice);
    if (onSelect) onSelect(choice);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  return (
    <div ref={wrapperRef} className={`autocompletado-contenedor ${className}`}>
      <div className="autocompletado-campo">
        <Search 
          size={18} 
          className="autocompletado-icono-busqueda"
        />
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className={`autocompletado-entrada ${showSuggestions && filtered.length > 0 ? "activo" : ""}`}
        />
        {value && (
          <button 
            onClick={() => { onChange(""); setFiltered([]); }}
            className="autocompletado-boton-limpiar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showSuggestions && filtered.length > 0 && (
        <ul className="autocompletado-lista">
          {filtered.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleChoice(suggestion)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`autocompletado-item ${index === activeIndex ? "activo" : ""}`}
            >
              <div className="autocompletado-indicador" />
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
