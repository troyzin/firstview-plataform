
import React from "react";
import { Package, CheckCircle, Users, AlertTriangle } from "lucide-react";

type EquipmentStatsProps = {
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
};

const EquipmentStats = ({ total, available, inUse, maintenance }: EquipmentStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-[#141414] rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Total de Equipamentos</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <Package className="h-8 w-8 text-gray-500" />
      </div>
      
      <div className="bg-[#141414] rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Disponíveis</p>
          <p className="text-2xl font-bold text-green-500">{available}</p>
        </div>
        <CheckCircle className="h-8 w-8 text-green-500" />
      </div>
      
      <div className="bg-[#141414] rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Em Uso</p>
          <p className="text-2xl font-bold text-[#ff3335]">{inUse}</p>
        </div>
        <Users className="h-8 w-8 text-[#ff3335]" />
      </div>
      
      <div className="bg-[#141414] rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Em Manutenção</p>
          <p className="text-2xl font-bold text-yellow-500">{maintenance}</p>
        </div>
        <AlertTriangle className="h-8 w-8 text-yellow-500" />
      </div>
    </div>
  );
};

export default EquipmentStats;
