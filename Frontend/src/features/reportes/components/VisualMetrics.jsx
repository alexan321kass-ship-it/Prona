import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { TrendingUp, Users, Package, DollarSign } from "lucide-react";
import "../reportes.css";

export default function VisualMetrics({ resumen = {}, metricasGrales = {}, ventasMensuales = [], masVendido = [], formatearMoneda }) {
  const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E", "#F59E0B", "#10B981"];

  const safeVentasMensuales = Array.isArray(ventasMensuales) ? ventasMensuales : [];
  const safeMasVendido = Array.isArray(masVendido) ? masVendido : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{label}</p>
          <p style={{ margin: 0, fontWeight: 800, color: payload[0].color || 'var(--color-primary)', fontSize: '1.1rem' }}>
            {payload[0].name === "total_valor" || payload[0].value.toString().includes("$") 
              ? formatearMoneda ? formatearMoneda(payload[0].value) : `$${payload[0].value}`
              : `${payload[0].value} uds`}
          </p>
        </div>
      );
    }
    return null;
  };

  const fmt = formatearMoneda || ((val) => `$${Number(val || 0).toLocaleString('es-CO')}`);

  return (
    <div className="fade-in">
      {/* KPI CARDS */}
      <div className="metricas-grid-kpi">
        <div className="kpi-premium-card" style={{ '--kpi-color': '#10B981', '--kpi-bg': 'rgba(16, 185, 129, 0.15)', '--kpi-shadow': 'rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>Ingresos Totales</p>
              <h3 style={{ margin: '0.3rem 0', color: '#0F172A', fontWeight: 800, fontSize: '1.8rem' }}>{fmt(resumen?.totalIngresos)}</h3>
            </div>
            <div style={{ background: '#ECFDF5', padding: '0.8rem', borderRadius: '14px', color: '#10B981' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', background: '#DCFCE7', color: '#16A34A', padding: '0.1rem 0.4rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>+12%</span>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>Ventas acumuladas</p>
          </div>
        </div>

        <div className="kpi-premium-card" style={{ '--kpi-color': '#3B82F6', '--kpi-bg': 'rgba(59, 130, 246, 0.15)', '--kpi-shadow': 'rgba(59, 130, 246, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>Pedidos Realizados</p>
              <h3 style={{ margin: '0.3rem 0', color: '#0F172A', fontWeight: 800, fontSize: '1.8rem' }}>{resumen?.totalVentas || 0}</h3>
            </div>
            <div style={{ background: '#EFF6FF', padding: '0.8rem', borderRadius: '14px', color: '#3B82F6' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', background: '#DBEAFE', color: '#2563EB', padding: '0.1rem 0.4rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>+5%</span>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>Total histórico</p>
          </div>
        </div>

        <div className="kpi-premium-card" style={{ '--kpi-color': '#8B5CF6', '--kpi-bg': 'rgba(139, 92, 246, 0.15)', '--kpi-shadow': 'rgba(139, 92, 246, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>Clientes Totales</p>
              <h3 style={{ margin: '0.3rem 0', color: '#0F172A', fontWeight: 800, fontSize: '1.8rem' }}>{metricasGrales?.total_clientes || 0}</h3>
            </div>
            <div style={{ background: '#F5F3FF', padding: '0.8rem', borderRadius: '14px', color: '#8B5CF6' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', background: '#EDE9FE', color: '#7C3AED', padding: '0.1rem 0.4rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>+18%</span>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>Base de datos activa</p>
          </div>
        </div>

        <div className="kpi-premium-card" style={{ '--kpi-color': '#F59E0B', '--kpi-bg': 'rgba(245, 158, 11, 0.15)', '--kpi-shadow': 'rgba(245, 158, 11, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>Productos Vendidos</p>
              <h3 style={{ margin: '0.3rem 0', color: '#0F172A', fontWeight: 800, fontSize: '1.8rem' }}>{resumen?.totalProductos || 0}</h3>
            </div>
            <div style={{ background: '#FFFBEB', padding: '0.8rem', borderRadius: '14px', color: '#F59E0B' }}>
              <Package size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', background: '#FEF3C7', color: '#D97706', padding: '0.1rem 0.4rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>+2%</span>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>Unidades físicas</p>
          </div>
        </div>
      </div>

      <div className="metricas-grid-graficos">
        {/* GRÁFICO DE TENDENCIA */}
        <div className="grafico-premium-card">
          <h3 style={{ margin: '0 0 1.5rem', color: '#1E293B', fontWeight: 800, fontSize: '1.2rem' }}>Tendencia de Ingresos Mensuales</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={safeVentasMensuales}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total_valor" stroke="url(#colorIngresos)" strokeWidth={4} fillOpacity={1} fill="url(#colorIngresos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* PRODUCTOS MÁS VENDIDOS */}
        <div className="grafico-premium-card">
          <h3 style={{ margin: '0 0 1.5rem', color: '#1E293B', fontWeight: 800, fontSize: '1.2rem' }}>Top Productos (Unidades)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={safeMasVendido.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="producto" width={140} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(241, 245, 249, 0.5)'}} />
              <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={20}>
                {safeMasVendido.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
