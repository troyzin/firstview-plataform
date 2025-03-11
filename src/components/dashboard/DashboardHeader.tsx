
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
}

const DashboardHeader = ({ onFilterChange, onAddProduction }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <div className="flex space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
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

        <Button className="bg-red-600 hover:bg-red-700" onClick={onAddProduction}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nova Produção
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
