import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { TrendingUp, Users, Package, DollarSign } from "lucide-react";
import { MetricCard, Card } from "./Common";
import "../reportes.css";

export default function VisualMetrics({ resumen, metricasGrales, ventasMensuales, masVendido, formatearMoneda }) {
  const COLORS = ["#C0392B", "#E67E22", "#F1C40F", "#27AE60", "#2980B9", "#8E44AD"];

  return (
    <div className="fade-in">
      {/* KPI CARDS */}
      <div className="metricas-grid-kpi">
        <MetricCard 
          title="Ingresos Totales" 
          value={formatearMoneda(resumen.totalIngresos)} 
          icon={<DollarSign color="#27AE60" />} 
          color="#27AE60"
          subtext="Ventas acumuladas"
        />
        <MetricCard 
          title="Pedidos Realizados" 
          value={resumen.totalVentas || 0} 
          icon={<TrendingUp color="#2980B9" />} 
          color="#2980B9"
          subtext="Total histórico"
        />
        <MetricCard 
          title="Clientes Totales" 
          value={metricasGrales.total_clientes || 0} 
          icon={<Users color="#8E44AD" />} 
          color="#8E44AD"
          subtext="Base de datos activa"
        />
        <MetricCard 
          title="Productos Vendidos" 
          value={resumen.totalProductos || 0} 
          icon={<Package color="#E67E22" />} 
          color="#E67E22"
          subtext="Unidades físicas"
        />
      </div>

      <div className="metricas-grid-graficos">
        {/* GRÁFICO DE TENDENCIA */}
        <Card title="Tendencia de Ingresos Mensuales">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ventasMensuales}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C0392B" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#C0392B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#7F8C8D', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#7F8C8D', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(val) => formatearMoneda(val)}
              />
              <Area type="monotone" dataKey="total_valor" stroke="#C0392B" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* PRODUCTOS MÁS VENDIDOS */}
        <Card title="Top Productos (Unidades)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={masVendido.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E0E0" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="producto" width={120} axisLine={false} tickLine={false} tick={{fill: '#2C3E50', fontSize: 11, fontWeight: 500}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={25}>
                {masVendido.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
