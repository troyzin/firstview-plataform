
import React from "react";
import { Edit, Trash2, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Equipment } from "@/types/equipment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryTabProps {
  equipments: Equipment[];
  onEditEquipment: (equipment: Equipment) => void;
  onDeleteEquipment: (equipment: Equipment) => void;
  onScheduleEquipment: (equipment: Equipment) => void;
  onCheckoutEquipment: (equipment: Equipment) => void;
}

const InventoryTab: React.FC<InventoryTabProps> = ({
  equipments,
  onEditEquipment,
  onDeleteEquipment,
  onScheduleEquipment,
  onCheckoutEquipment,
}) => {
  const renderEquipmentCategory = (category: string | null) => {
    if (!category) return "N/A";
    
    const categoryMap: {[key: string]: string} = {
      camera: "Câmera",
      lens: "Lente",
      stabilizer: "Estabilizador",
      audio: "Áudio",
      lighting: "Iluminação",
      support: "Suporte",
      accessory: "Acessório",
    };
    
    return categoryMap[category] || category;
  };
  
  const renderStatus = (status: string | null) => {
    if (!status) return <Badge>Desconhecido</Badge>;
    
    switch (status) {
      case "disponível":
        return <Badge className="bg-green-600">Disponível</Badge>;
      case "em uso":
        return <Badge className="bg-[#ff3335]">Em Uso</Badge>;
      case "manutenção":
        return <Badge className="bg-yellow-600">Manutenção</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };
  
  return (
    <div className="rounded-md border border-[#141414] bg-[#000000]">
      <Table>
        <TableHeader className="bg-[#141414]">
          <TableRow>
            <TableHead className="text-gray-400">Nome</TableHead>
            <TableHead className="text-gray-400">Categoria</TableHead>
            <TableHead className="text-gray-400">Marca/Modelo</TableHead>
            <TableHead className="text-gray-400">Número de Série</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum equipamento encontrado.
              </TableCell>
            </TableRow>
          ) : (
            equipments.map((equipment) => (
              <TableRow key={equipment.id} className="border-t border-[#141414]">
                <TableCell className="font-medium">{equipment.name}</TableCell>
                <TableCell>{renderEquipmentCategory(equipment.category)}</TableCell>
                <TableCell>
                  {equipment.brand} {equipment.model && `- ${equipment.model}`}
                </TableCell>
                <TableCell>{equipment.serial_number || "N/A"}</TableCell>
                <TableCell>{renderStatus(equipment.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {equipment.status === "disponível" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#141414] border-[#141414] hover:bg-[#292929]"
                          onClick={() => onScheduleEquipment(equipment)}
                        >
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          Agendar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#ff3335] hover:bg-[#ff3335]/80"
                          onClick={() => onCheckoutEquipment(equipment)}
                        >
                          <Package className="h-3.5 w-3.5 mr-1" />
                          Retirar
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#141414] border-[#141414] hover:bg-[#292929]"
                      onClick={() => onEditEquipment(equipment)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#141414] border-[#141414] hover:bg-red-900/20 hover:text-red-400"
                      onClick={() => onDeleteEquipment(equipment)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTab;
