import React from "react";
import { Trophy, Medal, Flame, Calendar } from "lucide-react";
import "../reportes.css";

function PodiumItem({ name, count, rank, height, color, main }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
      <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
        {rank}
        <p style={{ margin: '0.2rem 0 0', fontWeight: 700, fontSize: main ? '1rem' : '0.85rem', color: '#1E293B' }}>{name}</p>
        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>{count} uds</span>
      </div>
      <div style={{ height, width: '100%', background: color, borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
    </div>
  );
}

export default function TopPerformers({ clientes = [], masVendido = [], metricasGrales = {}, formatearMoneda }) {
  const safeClientes = Array.isArray(clientes) ? clientes : [];
  const safeMasVendido = Array.isArray(masVendido) ? masVendido : [];

  const maxVentas = safeMasVendido.length > 0 && safeMasVendido[0]?.total ? Number(safeMasVendido[0].total) : 1;

  return (
    <div className="fade-in rendimiento-grid">
      
      {/* SECCIÓN CLIENTES CON PODIO */}
      <div>
        <div className="grafico-premium-card" style={{ height: '100%' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#1E293B', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
            <Trophy size={22} className="mr-2 text-yellow-500" /> Top Clientes (Fidelidad)
          </h3>
          
          {/* PODIO */}
          <div className="podio-contenedor">
            {/* Segundo Lugar */}
            {safeClientes[1] && (
              <PodiumItem 
                name={safeClientes[1].nombre_cliente} 
                count={safeClientes[1].cantidad} 
                rank={<Medal color="#94A3B8" size={36} />} 
                height="120px" 
                color="linear-gradient(180deg, #E2E8F0 0%, #94A3B8 100%)" 
              />
            )}
            {/* Primer Lugar */}
            {safeClientes[0] && (
              <PodiumItem 
                name={safeClientes[0].nombre_cliente} 
                count={safeClientes[0].cantidad} 
                rank={<Trophy color="#F59E0B" size={48} />} 
                height="160px" 
                color="linear-gradient(180deg, #FCD34D 0%, #F59E0B 100%)" 
                main
              />
            )}
            {/* Tercer Lugar */}
            {safeClientes[2] && (
              <PodiumItem 
                name={safeClientes[2].nombre_cliente} 
                count={safeClientes[2].cantidad} 
                rank={<Medal color="#B45309" size={32} />} 
                height="90px" 
                color="linear-gradient(180deg, #FDBA74 0%, #B45309 100%)" 
              />
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            {safeClientes.slice(3, 8).map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="celda-rango">#{i + 4}</span>
                  <span className="celda-nombre">{c.nombre_cliente}</span>
                </div>
                <span className="celda-cantidad">{c.cantidad} uds</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓN PRODUCTOS Y KPI EXTRAS */}
      <div className="ranking-columna">
        
        {/* RANKING VISUAL DE PRODUCTOS */}
        <div className="grafico-premium-card">
          <h3 style={{ margin: '0 0 1.5rem', color: '#1E293B', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
            <Flame size={22} className="mr-2 text-orange-500" /> Ranking de Productos
          </h3>
          <div className="ranking-lista">
            {safeMasVendido.slice(0, 5).map((p, i) => (
              <div key={i}>
                <div className="ranking-item-info">
                  <span className="ranking-item-nombre">{p.producto}</span>
                  <span className="ranking-item-total">{p.total} uds</span>
                </div>
                <div className="ranking-barra-fondo">
                  <div
                    className="ranking-barra-relleno"
                    style={{ width: `${(Number(p.total || 0) / maxVentas) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI CARDS EXTRAS */}
        <div className="kpi-extras-grid">
           <div className="kpi-extra" style={{ '--kpi-bg': 'rgba(239, 68, 68, 0.1)' }}>
              <div className="kpi-extra__icono kpi-extra__icono--rojo">
                <Calendar size={24} />
              </div>
              <div>
                <h4 className="kpi-extra__etiqueta">Pendientes</h4>
                <p className="kpi-extra__valor">{metricasGrales?.pedidos_pendientes || 0}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
