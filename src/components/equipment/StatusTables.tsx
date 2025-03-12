
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { Equipment, Receipt as ReceiptType } from "@/types/equipment";

interface StatusTablesProps {
  equipments: Equipment[];
  receipts: ReceiptType[];
  openReceiptModal: (receipt: ReceiptType) => void;
  findEquipmentProduction: (equipmentId: string) => string;
  renderEquipmentType: (type: string) => string;
}

const StatusTables: React.FC<StatusTablesProps> = ({
  equipments,
  receipts,
  openReceiptModal,
  renderEquipmentType,
}) => {
  // Get equipment currently in use
  const inUseEquipments = equipments.filter(equipment => equipment.status === "em uso");
  
  // Get available equipment
  const availableEquipments = equipments.filter(equipment => equipment.status === "disponível");
  
  // Find the receipt for an equipment
  const findReceiptForEquipment = (equipmentId: string): ReceiptType | undefined => {
    return receipts.find(
      receipt => receipt.equipment?.id === equipmentId && receipt.status === "withdrawn"
    );
  };

  // Find user name from receipt
  const getUserName = (receipt?: ReceiptType): string => {
    if (!receipt || !receipt.user) return "Desconhecido";
    return receipt.user.full_name || "Usuário sem nome";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* In-Use Equipment */}
      <div className="bg-[#141414] rounded-lg overflow-hidden">
        <div className="p-3 bg-[#0e1620] text-white font-medium">
          Equipamentos em Uso
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#141414]">
                <TableHead>Equipamento</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inUseEquipments.map(equipment => {
                const receipt = findReceiptForEquipment(equipment.id);
                return (
                  <TableRow key={`in-use-${equipment.id}`}>
                    <TableCell>{equipment.name}</TableCell>
                    <TableCell>{getUserName(receipt)}</TableCell>
                    <TableCell className="text-right">
                      {receipt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openReceiptModal(receipt)}
                          className="h-8 w-8 p-0 hover:bg-gray-800"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {inUseEquipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    Nenhum equipamento em uso
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Available Equipment */}
      <div className="bg-[#141414] rounded-lg overflow-hidden">
        <div className="p-3 bg-[#0e1620] text-white font-medium">
          Equipamentos Disponíveis
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#141414]">
                <TableHead>Equipamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableEquipments.map(equipment => (
                <TableRow key={`available-${equipment.id}`}>
                  <TableCell>{equipment.name}</TableCell>
                  <TableCell>
                    {equipment.brand && equipment.model 
                      ? `${equipment.brand} ${equipment.model}`
                      : renderEquipmentType(equipment.category || '')}
                  </TableCell>
                  <TableCell className="text-right">{equipment.quantity || 1}</TableCell>
                </TableRow>
              ))}
              {availableEquipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    Nenhum equipamento disponível
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

export default StatusTables;
