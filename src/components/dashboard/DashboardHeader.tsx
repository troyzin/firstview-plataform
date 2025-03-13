
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterIcon, PlusIcon } from "lucide-react";

interface DashboardHeaderProps {
  onFilterChange: (filter: string) => void;
  onAddProduction: () => void;
  isMobile?: boolean;
}

const DashboardHeader = ({ onFilterChange, onAddProduction, isMobile = false }: DashboardHeaderProps) => {
  return (
    <div className="flex space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="bg-[#141414] text-white hover:bg-gray-700">
            <FilterIcon className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Filtrar</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#141414] border-gray-700">
          <DropdownMenuItem 
            className="hover:bg-gray-700"
            onClick={() => onFilterChange("all")}
          >
            Todos os projetos
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="hover:bg-gray-700"
            onClick={() => onFilterChange("mine")}
          >
            Meus projetos
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="hover:bg-gray-700"
            onClick={() => onFilterChange("late")}
          >
            Em atraso
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="hover:bg-gray-700"
            onClick={() => onFilterChange("completed")}
          >
            Concluídos
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button className="bg-[#ff3335] hover:bg-red-700" onClick={onAddProduction}>
        <PlusIcon className="h-4 w-4" />
        <span className="ml-2">Nova Produção</span>
      </Button>
    </div>
  );
};

export default DashboardHeader;
