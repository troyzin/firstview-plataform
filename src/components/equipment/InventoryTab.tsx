
import React from "react";
import { Edit, Trash, LogOut, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
    <div className="bg-[#141414] rounded-lg p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
          className={statusFilter === "all" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Todos
        </Button>
        
        <Button
          variant={statusFilter === "available" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("available")}
          className={statusFilter === "available" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Disponíveis
        </Button>
        
        <Button
          variant={statusFilter === "in_use" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("in_use")}
          className={statusFilter === "in_use" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Em Uso
        </Button>
        
        <Button
          variant={statusFilter === "maintenance" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("maintenance")}
          className={statusFilter === "maintenance" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Em Manutenção
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("all")}
          className={typeFilter === "all" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Todos
        </Button>
        
        <Button
          variant={typeFilter === "camera" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("camera")}
          className={typeFilter === "camera" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Câmeras
        </Button>
        
        <Button
          variant={typeFilter === "lens" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("lens")}
          className={typeFilter === "lens" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Lentes
        </Button>
        
        <Button
          variant={typeFilter === "stabilizer" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("stabilizer")}
          className={typeFilter === "stabilizer" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Estabilizadores
        </Button>
        
        <Button
          variant={typeFilter === "audio" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("audio")}
          className={typeFilter === "audio" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Áudio
        </Button>
        
        <Button
          variant={typeFilter === "lighting" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("lighting")}
          className={typeFilter === "lighting" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Iluminação
        </Button>
        
        <Button
          variant={typeFilter === "support" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("support")}
          className={typeFilter === "support" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Suporte
        </Button>
        
        <Button
          variant={typeFilter === "accessory" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("accessory")}
          className={typeFilter === "accessory" ? "bg-[#ff3335] hover:bg-[#cc2a2b]" : "bg-[#141414] hover:bg-[#1e1e1e]"}
        >
          Acessórios
        </Button>
      </div>

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
            {filteredEquipments.map((equipment) => (
              <TableRow key={equipment.id}>
                <TableCell className="font-medium">{equipment.name}</TableCell>
                <TableCell>{renderEquipmentType(equipment.category)}</TableCell>
                <TableCell>{renderStatus(equipment.status)}</TableCell>
                <TableCell>
                  {equipment.status === "em uso" ? (
                    <span>{equipment.productionTitle || "Não especificada"}</span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {equipment.status === "disponível" && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openCheckoutModal(equipment)}
                        className="bg-[#141414] hover:bg-[#1e1e1e]"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Retirar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openScheduleModal(equipment)}
                        className="bg-[#141414] hover:bg-[#1e1e1e] opacity-50"
                        disabled={true}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar
                      </Button>
                    </>
                  )}
                  
                  {equipment.status === "em uso" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openReturnModal(equipment)}
                      className="bg-[#141414] hover:bg-[#1e1e1e]"
                    >
                      <LogOut className="h-4 w-4 mr-2 rotate-180" />
                      Devolver
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditEquipment(equipment)}
                    className="hover:bg-[#141414]"
                  >
                    <Edit className="h-4 w-4 text-[#ff3335]" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteEquipment(equipment)}
                    className="hover:bg-[#141414]"
                  >
                    <Trash className="h-4 w-4 text-[#ff3335]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredEquipments.length === 0 && (
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
  );
};

export default InventoryTab;
