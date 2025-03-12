
import React from "react";
import { Receipt, Equipment } from "@/types/equipment";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type StatusTablesProps = {
  equipments: Equipment[];
  receipts: Receipt[];
  openReceiptModal: (receipt: Receipt) => void;
  findEquipmentProduction: (equipmentId: string) => string;
  renderEquipmentType: (type: string) => string;
};

const StatusTables: React.FC<StatusTablesProps> = ({
  equipments,
  receipts,
  openReceiptModal,
  findEquipmentProduction,
  renderEquipmentType,
}) => {
  // Get equipment in use
  const equipmentInUse = equipments.filter(
    (equipment) => equipment.status === "em uso"
  ).slice(0, 5);

  // Get latest receipts
  const latestReceipts = [...receipts]
    .sort((a, b) => {
      const dateA = new Date(a.withdrawal_date || 0).getTime();
      const dateB = new Date(b.withdrawal_date || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-[#141414] rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Equipamentos em Uso</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produção</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentInUse.length > 0 ? (
                equipmentInUse.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">{equipment.name}</TableCell>
                    <TableCell>{renderEquipmentType(equipment.category)}</TableCell>
                    <TableCell>{findEquipmentProduction(equipment.id)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                    Nenhum equipamento em uso
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-[#141414] rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Últimas Retiradas</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestReceipts.length > 0 ? (
                latestReceipts.map((receipt) => (
                  <TableRow 
                    key={receipt.id} 
                    className="cursor-pointer hover:bg-[#1e1e1e]"
                    onClick={() => openReceiptModal(receipt)}
                  >
                    <TableCell>
                      {receipt.withdrawal_date && 
                        format(new Date(receipt.withdrawal_date), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{receipt.equipment?.name || receipt.equipment_id}</TableCell>
                    <TableCell>
                      {receipt.status === "withdrawn" && <Badge variant="yellow">Em Uso</Badge>}
                      {receipt.status === "returned" && <Badge variant="green">Devolvido</Badge>}
                      {receipt.status === "overdue" && <Badge variant="yellow">Atrasado</Badge>}
                      {receipt.status === "returned_late" && <Badge variant="purple">Devolvido com Atraso</Badge>}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                    Nenhuma retirada recente
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
