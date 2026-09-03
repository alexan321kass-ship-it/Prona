import React from "react";
import { Info } from "lucide-react";

export default function StatCard({ title, value, footerLeft, footerRight, chart }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-40">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <Info size={16} className="text-gray-400" />
        </div>
        <div className="text-3xl font-semibold text-gray-800">
          {value}
        </div>
      </div>
      
      {/* Opcional: minigráfico en el centro */}
      <div className="flex-1 flex items-end mb-2">
        {chart && <div className="w-full h-8">{chart}</div>}
      </div>

      <div className="border-t pt-3 flex justify-between items-center text-sm">
        <span className="text-gray-500">{footerLeft}</span>
        {footerRight && <span>{footerRight}</span>}
      </div>
    </div>
  );
}
