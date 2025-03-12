
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, ReceiptText, Package, Calendar, LogOut } from "lucide-react";
import { Equipment } from "@/types/equipment";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StatusTablesProps {
  equipments: Equipment[];
  onEditEquipment: (equipment: Equipment) => void;
  onScheduleEquipment: (equipment: Equipment) => void;
  onCheckoutEquipment: (equipment: Equipment) => void;
  onReturnEquipment: (equipment: Equipment) => void;
}

const StatusTables: React.FC<StatusTablesProps> = ({
  equipments,
  onEditEquipment,
  onScheduleEquipment,
  onCheckoutEquipment,
  onReturnEquipment,
}) => {
  // Filter equipments by status
  const availableEquipments = equipments.filter(
    (equipment) => equipment.status === "disponível"
  );
  const inUseEquipments = equipments.filter(
    (equipment) => equipment.status === "em uso"
  );
  const maintenanceEquipments = equipments.filter(
    (equipment) => equipment.status === "manutenção"
  );

  const renderCategoryBadge = (category: string | null) => {
    if (!category) return null;
    
    const categoryLabels: {[key: string]: string} = {
      'camera': 'Câmera',
      'lens': 'Lente',
      'stabilizer': 'Estabilizador',
      'audio': 'Áudio',
      'lighting': 'Iluminação',
      'support': 'Suporte',
      'accessory': 'Acessório',
    };
    
    const label = categoryLabels[category] || category;
    
    return (
      <Badge variant="outline" className="border-gray-600 text-gray-400">
        {label}
      </Badge>
    );
  };

  const renderEquipmentRow = (equipment: Equipment, actionButtons: React.ReactNode) => (
    <tr key={equipment.id} className="border-b border-[#141414]">
      <td className="py-3 pl-4">
        <div className="flex flex-col">
          <span className="font-medium">{equipment.name}</span>
          <div className="flex items-center gap-2 mt-1">
            {renderCategoryBadge(equipment.category)}
            {equipment.brand && (
              <span className="text-xs text-gray-500">
                {equipment.brand} {equipment.model && `- ${equipment.model}`}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex justify-end space-x-2">
          {actionButtons}
        </div>
      </td>
    </tr>
  );

  const renderStatusTable = (
    title: string,
    items: Equipment[],
    renderAction: (equipment: Equipment) => React.ReactNode,
    emptyMessage: string,
    className: string = ""
  ) => (
    <Card className={`bg-[#000000] border-[#141414] ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] w-full">
          {items.length > 0 ? (
            <table className="w-full">
              <tbody>
                {items.map((item) => renderEquipmentRow(item, renderAction(item)))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 px-4 text-center text-gray-500">{emptyMessage}</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {renderStatusTable(
        "Disponíveis",
        availableEquipments,
        (equipment) => (
          <>
            <Button
              size="sm"
              variant="outline"
              className="bg-[#141414] border-[#141414] hover:bg-[#292929] h-8"
              onClick={() => onScheduleEquipment(equipment)}
            >
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Agendar
            </Button>
            <Button
              size="sm"
              className="bg-[#ff3335] hover:bg-[#ff3335]/80 h-8"
              onClick={() => onCheckoutEquipment(equipment)}
            >
              <Package className="h-3.5 w-3.5 mr-1" />
              Retirar
            </Button>
          </>
        ),
        "Nenhum equipamento disponível"
      )}

      {renderStatusTable(
        "Em Uso",
        inUseEquipments,
        (equipment) => (
          <>
            <Button
              size="sm"
              variant="outline"
              className="bg-[#141414] border-[#141414] hover:bg-[#292929] h-8"
              onClick={() => onEditEquipment(equipment)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              className="bg-[#ff3335] hover:bg-[#ff3335]/80 h-8"
              onClick={() => onReturnEquipment(equipment)}
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Devolver
            </Button>
          </>
        ),
        "Nenhum equipamento em uso"
      )}

      {renderStatusTable(
        "Manutenção",
        maintenanceEquipments,
        (equipment) => (
          <Button
            size="sm"
            variant="outline"
            className="bg-[#141414] border-[#141414] hover:bg-[#292929] h-8"
            onClick={() => onEditEquipment(equipment)}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Editar
          </Button>
        ),
        "Nenhum equipamento em manutenção"
      )}
    </div>
  );
};

export default StatusTables;
