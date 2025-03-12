
import React from "react";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt as ReceiptType } from "@/types/equipment";
import { Equipment } from "@/types/equipment";

type StatusTablesProps = {
  equipments: Equipment[];
  receipts: ReceiptType[];
  openReceiptModal: (receipt: ReceiptType) => void;
  findEquipmentProduction: (equipmentId: string) => string;
  renderEquipmentType: (type: string) => string;
};

const StatusTables = ({
  equipments,
  receipts,
  openReceiptModal,
  findEquipmentProduction,
  renderEquipmentType,
}: StatusTablesProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Status de Disponibilidade</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tabela de equipamentos em uso */}
        <div className="bg-[#141414] rounded-lg p-4">
          <h3 className="text-md font-medium mb-2 text-[#ff3335]">Equipamentos em Uso</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Produção</TableHead>
                  <TableHead className="text-right">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipments
                  .filter(e => e.status === "em uso")
                  .map(equipment => {
                    const receipt = receipts.find(
                      r => r.equipment?.id === equipment.id && r.status === 'withdrawn'
                    );
                    
                    return (
                      <TableRow key={`in-use-${equipment.id}`}>
                        <TableCell>{equipment.name}</TableCell>
                        <TableCell>
                          {findEquipmentProduction(equipment.id)}
                        </TableCell>
                        <TableCell className="text-right">
                          {receipt && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openReceiptModal(receipt)}
                              className="h-8 w-8 rounded-full hover:bg-gray-700"
                            >
                              <ReceiptText className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {equipments.filter(e => e.status === "em uso").length === 0 && (
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
        
        {/* Tabela de equipamentos disponíveis */}
        <div className="bg-[#141414] rounded-lg p-4">
          <h3 className="text-md font-medium mb-2 text-green-400">Equipamentos Disponíveis</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipments
                  .filter(e => e.status === "disponível")
                  .map(equipment => (
                    <TableRow key={`available-${equipment.id}`}>
                      <TableCell>{equipment.name}</TableCell>
                      <TableCell>{renderEquipmentType(equipment.category || '')}</TableCell>
                      <TableCell className="text-right">{equipment.quantity || 1}</TableCell>
                    </TableRow>
                  ))}
                {equipments.filter(e => e.status === "disponível").length === 0 && (
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
    </div>
  );
};

export default StatusTables;
