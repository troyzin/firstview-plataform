
import React from "react";
import { Edit, Trash2, LogOut, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Equipment } from "@/types/equipment";

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
  openScheduleModal: (equipment: Equipment) => void;
};

const InventoryTab: React.FC<InventoryTabProps> = ({
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
  openScheduleModal,
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-3 mb-4">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          className={statusFilter === "all" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setStatusFilter("all")}
        >
          <Package className="h-4 w-4 mr-2" />
          Todos
        </Button>
        <Button
          variant={statusFilter === "available" ? "default" : "outline"}
          className={statusFilter === "available" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setStatusFilter("available")}
        >
          <Package className="h-4 w-4 mr-2" />
          Disponíveis
        </Button>
        <Button
          variant={statusFilter === "in_use" ? "default" : "outline"}
          className={statusFilter === "in_use" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setStatusFilter("in_use")}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Em Uso
        </Button>
        <Button
          variant={statusFilter === "maintenance" ? "default" : "outline"}
          className={statusFilter === "maintenance" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setStatusFilter("maintenance")}
        >
          <Package className="h-4 w-4 mr-2" />
          Em Manutenção
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          className={typeFilter === "all" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setTypeFilter("all")}
        >
          Todos
        </Button>
        <Button
          variant={typeFilter === "camera" ? "default" : "outline"}
          className={typeFilter === "camera" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setTypeFilter("camera")}
        >
          Câmeras
        </Button>
        <Button
          variant={typeFilter === "lens" ? "default" : "outline"}
          className={typeFilter === "lens" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setTypeFilter("lens")}
        >
          Lentes
        </Button>
        <Button
          variant={typeFilter === "stabilizer" ? "default" : "outline"}
          className={typeFilter === "stabilizer" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setTypeFilter("stabilizer")}
        >
          Estabilizadores
        </Button>
        <Button
          variant={typeFilter === "audio" ? "default" : "outline"}
          className={typeFilter === "audio" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setTypeFilter("audio")}
        >
          Áudio
        </Button>
        <Button
          variant={typeFilter === "lighting" ? "default" : "outline"}
          className={typeFilter === "lighting" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setTypeFilter("lighting")}
        >
          Iluminação
        </Button>
        <Button
          variant={typeFilter === "support" ? "default" : "outline"}
          className={typeFilter === "support" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setTypeFilter("support")}
        >
          Suportes
        </Button>
        <Button
          variant={typeFilter === "accessory" ? "default" : "outline"}
          className={typeFilter === "accessory" ? "bg-[#ff3335]" : "bg-[#141414]"}
          onClick={() => setTypeFilter("accessory")}
        >
          Acessórios
        </Button>
      </div>
      
      <div className="bg-[#141414] rounded-lg p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Produção</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipments.length > 0 ? (
                filteredEquipments.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">{equipment.name}</TableCell>
                    <TableCell>{renderEquipmentType(equipment.category)}</TableCell>
                    <TableCell>{renderStatus(equipment.status)}</TableCell>
                    <TableCell>
                      {/* Removing productionTitle reference as it doesn't exist on the Equipment type */}
                      {equipment.status === 'em uso' ? 'Em produção' : ''}
                    </TableCell>
                    <TableCell className="text-right flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditEquipment(equipment)}
                        className="hover:bg-[#141414]"
                      >
                        <Edit className="h-4 w-4 text-white" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteEquipment(equipment)}
                        className="hover:bg-[#141414]"
                      >
                        <Trash2 className="h-4 w-4 text-[#ff3335]" />
                      </Button>
                      
                      {equipment.status === 'disponível' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openCheckoutModal(equipment)}
                          className="hover:bg-[#141414]"
                        >
                          <LogOut className="h-4 w-4 text-white" />
                        </Button>
                      )}
                      
                      {equipment.status === 'em uso' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openReturnModal(equipment)}
                          className="hover:bg-[#141414]"
                        >
                          <LogOut className="h-4 w-4 rotate-180 text-white" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openScheduleModal(equipment)}
                        className="hover:bg-[#141414] opacity-50 cursor-not-allowed"
                        disabled={true}
                      >
                        <Calendar className="h-4 w-4 text-white" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
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
