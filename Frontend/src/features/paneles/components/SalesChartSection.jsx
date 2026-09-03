import React, { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Calendar } from "lucide-react";

const data = [
  { name: '1', sales: 45, visits: 35 },
  { name: '2', sales: 22, visits: 30 },
  { name: '3', sales: 55, visits: 40 },
  { name: '4', sales: 22, visits: 35 },
  { name: '5', sales: 48, visits: 42 },
  { name: '6', sales: 30, visits: 38 },
  { name: '7', sales: 65, visits: 50 },
  { name: '8', sales: 40, visits: 30 },
  { name: '9', sales: 50, visits: 45 },
  { name: '10', sales: 35, visits: 40 },
  { name: '11', sales: 60, visits: 55 },
  { name: '12', sales: 45, visits: 48 },
];

const rankingData = [
  { id: 0, name: "Gongzhuan No. 0 shop", total: "323,234" },
  { id: 1, name: "Gongzhuan No. 1 shop", total: "323,234" },
  { id: 2, name: "Gongzhuan No. 2 shop", total: "323,234" },
  { id: 3, name: "Gongzhuan No. 3 shop", total: "323,234" },
  { id: 4, name: "Gongzhuan No. 4 shop", total: "323,234" },
  { id: 5, name: "Gongzhuan No. 5 shop", total: "323,234" },
  { id: 6, name: "Gongzhuan No. 6 shop", total: "323,234" },
];

export default function SalesChartSection() {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <div className="bg-white mt-6 rounded-lg shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center border-b px-6 py-4">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab("sales")}
            className={`pb-4 -mb-4 font-medium transition-colors ${activeTab === 'sales' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
          >
            Sales
          </button>
          <button 
            onClick={() => setActiveTab("visits")}
            className={`pb-4 -mb-4 font-medium transition-colors ${activeTab === 'visits' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}
          >
            Visits
          </button>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex gap-4">
            <button className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">All day</button>
            <button className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">All week</button>
            <button className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">All month</button>
            <button className="text-[var(--color-primary)] font-medium">All year</button>
          </div>
          <div className="flex items-center gap-2 border px-3 py-1.5 rounded cursor-pointer hover:border-[var(--color-primary-light)]">
            <span className="text-[var(--color-text-muted)]">2020-01-01 ~ 2020-12-31</span>
            <Calendar size={16} className="text-[var(--color-text-light)]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col lg:flex-row gap-8">
        {/* Left Side: Chart */}
        <div className="flex-1">
          <h3 className="text-gray-700 font-semibold mb-6">Store Sales Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Bar 
                  dataKey={activeTab === 'sales' ? 'sales' : 'visits'} 
                  fill="#C0392B" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Ranking */}
        <div className="w-full lg:w-72">
          <h3 className="text-gray-700 font-semibold mb-6">Sales ranking</h3>
          <ul className="space-y-4">
            {rankingData.map((item, index) => (
              <li key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < 3 ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{item.total}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
