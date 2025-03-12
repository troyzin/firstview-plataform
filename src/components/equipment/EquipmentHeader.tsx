
import React from "react";
import { Plus, Search, Filter, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EquipmentHeaderProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  openKitModal: () => void;
  openNewEquipmentModal: () => void;
};

const EquipmentHeader = ({
  searchTerm,
  setSearchTerm,
  openKitModal,
  openNewEquipmentModal,
}: EquipmentHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <h1 className="text-2xl font-bold">Equipamentos</h1>
        
        <div className="flex items-center bg-[#141414] rounded-md px-3 py-2 w-full md:w-auto">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <Input
            placeholder="Buscar equipamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full md:w-60"
          />
        </div>
        
        <Button variant="outline" className="bg-[#141414] border-gray-700 w-full md:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>
      
      <div className="flex space-x-3 w-full md:w-auto">
        <Button 
          onClick={openKitModal}
          className="bg-[#141414] hover:bg-[#1e1e1e] text-white w-full md:w-auto"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Retirar KIT
        </Button>
        <Button 
          onClick={openNewEquipmentModal} 
          className="bg-[#ff3335] hover:bg-[#ff3335]/90 w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Equipamento
        </Button>
      </div>
    </div>
  );
};

export default EquipmentHeader;
