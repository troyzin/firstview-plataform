
import React from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EquipmentHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  openKitModal: () => void;
  openNewEquipmentModal: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  openKitModal,
  openNewEquipmentModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold">Equipamentos</h1>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar equipamentos..."
            className="pl-8 bg-[#141414] border-[#141414]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            className="bg-[#ff3335] hover:bg-red-700 flex-1 sm:flex-none"
            onClick={openKitModal}
          >
            Retirar KIT
          </Button>
          <Button
            className="bg-[#141414] hover:bg-gray-800 flex-1 sm:flex-none"
            onClick={openNewEquipmentModal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentHeader;
