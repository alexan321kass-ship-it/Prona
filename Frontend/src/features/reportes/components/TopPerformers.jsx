import React from "react";
import { UserCheck, Star, Calendar, TrendingUp, Trophy, Medal, Flame } from "lucide-react";
import { Card } from "./Common";
import "../reportes.css";

export default function TopPerformers({ clientes, masVendido, metricasGrales, formatearMoneda }) {
  const maxVentas = masVendido.length > 0 ? masVendido[0].total : 1;

  return (
    <div className="fade-in rendimiento-grid">
      
      {/* SECCIÓN CLIENTES CON PODIO */}
      <div>
        <Card title={<><Trophy size={20} className="inline-block mr-2 text-yellow-500" /> Top Clientes (Fidelidad)</>}>
          {/* PODIO */}
          <div className="podio-contenedor">
            {/* Segundo Lugar */}
            {clientes[1] && (
              <PodiumItem 
                name={clientes[1].nombre_cliente} 
                count={clientes[1].cantidad} 
                rank={<Medal color="#BDC3C7" size={32} />} 
                height="100px" 
                color="#BDC3C7" 
              />
            )}
            {/* Primer Lugar */}
            {clientes[0] && (
              <PodiumItem 
                name={clientes[0].nombre_cliente} 
                count={clientes[0].cantidad} 
                rank={<Trophy color="#F1C40F" size={40} />} 
                height="140px" 
                color="#F1C40F" 
                main
              />
            )}
            {/* Tercer Lugar */}
            {clientes[2] && (
              <PodiumItem 
                name={clientes[2].nombre_cliente} 
                count={clientes[2].cantidad} 
                rank={<Medal color="#CD7F32" size={32} />} 
                height="80px" 
                color="#CD7F32" 
              />
            )}
          </div>

          <table className="seg-table">
            <thead>
              <tr>
                <th>Rango</th>
                <th>Cliente</th>
                <th className="celda-derecha">Total Unidades</th>
              </tr>
            </thead>
            <tbody>
              {clientes.slice(3, 10).map((c, i) => (
                <tr key={i}>
                  <td className="celda-rango">#{i + 4}</td>
                  <td className="celda-nombre">{c.nombre_cliente}</td>
                  <td className="celda-cantidad">{c.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* SECCIÓN PRODUCTOS Y KPI EXTRAS */}
      <div className="ranking-columna">
        
        {/* RANKING VISUAL DE PRODUCTOS */}
        <Card title={<><Flame size={20} className="inline-block mr-2 text-orange-500" /> Ranking de Productos</>}>
          <div className="ranking-lista">
            {masVendido.slice(0, 5).map((p, i) => (
              <div key={i}>
                <div className="ranking-item-info">
                  <span className="ranking-item-nombre">{p.producto}</span>
                  <span className="ranking-item-total">{p.total} uds</span>
                </div>
                <div className="ranking-barra-fondo">
                  <div
                    className="ranking-barra-relleno"
                    style={{ width: `${(p.total / maxVentas) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* KPI CARDS EXTRAS */}
        <div className="kpi-extras-grid">
           <div className="kpi-extra">
              <div className="kpi-extra__icono kpi-extra__icono--rojo">
                <Calendar size={24} />
              </div>
              <h4 className="kpi-extra__etiqueta">Pendientes</h4>
              <h2 className="kpi-extra__valor">{metricasGrales.pedidos_pendientes || 0}</h2>
              <p className="kpi-extra__nota kpi-extra__nota--rojo">Por procesar</p>
           </div>
           <div className="kpi-extra">
              <div className="kpi-extra__icono kpi-extra__icono--verde">
                <TrendingUp size={24} />
              </div>
              <h4 className="kpi-extra__etiqueta">Histórico</h4>
              <h2 className="kpi-extra__valor kpi-extra__valor--pequeno">{formatearMoneda(metricasGrales.ingresos_historicos)}</h2>
              <p className="kpi-extra__nota kpi-extra__nota--verde">Total Life-time</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function PodiumItem({ name, count, rank, height, color, main = false }) {
  return (
    <div className="podio-item">
      <span className="podio-item__rango">{rank}</span>
      <div
        className={`podio-item__barra ${main ? "podio-item__barra--principal" : ""}`}
        style={{ 
          height: height, 
          background: main ? `linear-gradient(180deg, ${color} 0%, #F39C12 100%)` : color,
          color: main ? "white" : "#3D4449"
        }}
      >
        <div className="podio-item__cantidad">{count}</div>
        <div className="podio-item__unidad">uds</div>
      </div>
      <div className="podio-item__nombre">
        {name}
      </div>
    </div>
  );
}
