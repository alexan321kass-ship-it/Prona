import React from "react";
import "../../../compartido/styles/comun-ui.css";

export function MetricCard({ title, value, icon, color, subtext }) {
  return (
    <div
      className="tarjeta-metrica"
      style={{ '--color-acento': color, '--color-acento-fondo': `${color}15` }}
    >
      <div className="tarjeta-metrica__icono">
        {icon}
      </div>
      <div>
        <p className="tarjeta-metrica__titulo">{title}</p>
        <h3 className="tarjeta-metrica__valor">{value}</h3>
        <p className="tarjeta-metrica__subtexto">{subtext}</p>
      </div>
    </div>
  );
}

export function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`boton-pestana ${active ? "activo" : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}

export function Card({ title, children, style = {}, className = "" }) {
  return (
    <div className={`tarjeta-contenedora ${className}`} style={style}>
      {title && <h3 className="tarjeta-contenedora__titulo">{title}</h3>}
      {children}
    </div>
  );
}
