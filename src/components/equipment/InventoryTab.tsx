
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Equipment } from "@/types/equipment";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle, ArrowDownToLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type InventoryTabProps = {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  filteredEquipments: Equipment[];
  handleEditEquipment: (equipment: Equipment) => void;
  handleDeleteEquipment: (equipment: Equipment) => void;
  renderStatus: (status: string) => React.ReactNode;
  renderEquipmentType: (type: string) => string;
  openCheckoutModal: (equipment: Equipment) => void;
  openReturnModal: (equipment: Equipment) => void;
};

const InventoryTab = ({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  filteredEquipments,
  handleEditEquipment,
  handleDeleteEquipment,
  renderStatus,
  renderEquipmentType,
  openCheckoutModal,
  openReturnModal,
}: InventoryTabProps) => {
  const isMobile = useIsMobile();
  
  // Function to render status as colored dots on mobile
  const renderStatusIndicator = (status: string) => {
    if (!isMobile) {
      return renderStatus(status);
    }
    
    // On mobile, render dots instead of badges
    switch (status) {
      case "disponível":
        return <div className="w-3 h-3 rounded-full bg-green-500 mx-auto" title="Disponível" />;
      case "em uso":
        return <div className="w-3 h-3 rounded-full bg-yellow-500 mx-auto" title="Em Uso" />;
      case "manutenção":
        return <div className="w-3 h-3 rounded-full bg-purple-500 mx-auto" title="Manutenção" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-500 mx-auto" title="Desconhecido" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-[#141414] border-gray-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-gray-700">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="in_use">Em Uso</SelectItem>
            <SelectItem value="maintenance">Manutenção</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-[#141414] border-gray-700">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-gray-700">
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="camera">Câmera</SelectItem>
            <SelectItem value="lens">Lente</SelectItem>
            <SelectItem value="stabilizer">Estabilizador</SelectItem>
            <SelectItem value="audio">Áudio</SelectItem>
            <SelectItem value="lighting">Iluminação</SelectItem>
            <SelectItem value="support">Suporte</SelectItem>
            <SelectItem value="accessory">Acessório</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-[#141414] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>{isMobile ? "Tipo" : "Tipo"}</TableHead>
                <TableHead className={isMobile ? "text-center" : ""}>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipments.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell className="max-w-[100px] md:max-w-none truncate">{equipment.name}</TableCell>
                  <TableCell className="max-w-[80px] md:max-w-none truncate">{renderEquipmentType(equipment.category || '')}</TableCell>
                  <TableCell className={isMobile ? "text-center" : ""}>
                    {renderStatusIndicator(equipment.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {equipment.status === "disponível" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openCheckoutModal(equipment)}
                          className="h-8 w-8 rounded-full hover:bg-gray-700 border-gray-700"
                          title="Retirar equipamento"
                        >
                          <ArrowDownToLine className="h-4 w-4 text-white" />
                        </Button>
                      )}
                      {equipment.status === "em uso" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openReturnModal(equipment)}
                          className="h-8 w-8 rounded-full hover:bg-gray-700 border-gray-700"
                          title="Devolver equipamento"
                        >
                          <CheckCircle className="h-4 w-4 text-white" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditEquipment(equipment)}
                        className="h-8 w-8 rounded-full hover:bg-gray-700 border-gray-700"
                        title="Editar equipamento"
                      >
                        <Edit className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEquipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    Nenhum equipamento encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
