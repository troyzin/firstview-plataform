
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, EyeIcon } from "lucide-react";
import { Equipment, Receipt as ReceiptType } from "@/types/equipment";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  findEquipmentProduction,
  renderEquipmentType,
}) => {
  // Function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Hoje, ${format(date, "HH:mm", { locale: ptBR })}`;
    } else if (isYesterday(date)) {
      return `Ontem, ${format(date, "HH:mm", { locale: ptBR })}`;
    } else {
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    }
  };

  // Recent withdrawals (last 5)
  const recentWithdrawals = receipts
    .filter(receipt => receipt.status === "withdrawn")
    .sort((a, b) => new Date(b.withdrawal_date).getTime() - new Date(a.withdrawal_date).getTime())
    .slice(0, 5);

  // Recent returns (last 5)
  const recentReturns = receipts
    .filter(receipt => receipt.status === "returned" || receipt.status === "returned_late")
    .sort((a, b) => {
      if (!a.returned_date || !b.returned_date) return 0;
      return new Date(b.returned_date).getTime() - new Date(a.returned_date).getTime();
    })
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Available Equipment */}
      <Table className="border border-[#141414] rounded-lg">
        <TableCaption className="mt-2">
          Equipamentos disponíveis para retirada
        </TableCaption>
        <TableHeader>
          <TableRow className="border-[#141414]">
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Qtd</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipments
            .filter(equipment => equipment.status === "disponível")
            .slice(0, 5)
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

      {/* Recent Withdrawals */}
      <Table className="border border-[#141414] rounded-lg">
        <TableCaption className="mt-2">Retiradas recentes</TableCaption>
        <TableHeader>
          <TableRow className="border-[#141414]">
            <TableHead>Equipamento</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentWithdrawals.map(receipt => (
            <TableRow key={`withdrawal-${receipt.id}`}>
              <TableCell>
                {receipt.equipment?.name || "Equipamento não encontrado"}
              </TableCell>
              <TableCell>{formatDate(receipt.withdrawal_date)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openReceiptModal(receipt)}
                  className="h-8 w-8 p-0 hover:bg-gray-800"
                >
                  <Receipt className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {recentWithdrawals.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                Nenhuma retirada recente
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Recent Returns */}
      <Table className="border border-[#141414] rounded-lg">
        <TableCaption className="mt-2">Devoluções recentes</TableCaption>
        <TableHeader>
          <TableRow className="border-[#141414]">
            <TableHead>Equipamento</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentReturns.map(receipt => (
            <TableRow key={`return-${receipt.id}`}>
              <TableCell>
                {receipt.equipment?.name || "Equipamento não encontrado"}
              </TableCell>
              <TableCell>
                {receipt.returned_date ? formatDate(receipt.returned_date) : "Data desconhecida"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openReceiptModal(receipt)}
                  className="h-8 w-8 p-0 hover:bg-gray-800"
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {recentReturns.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                Nenhuma devolução recente
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StatusTables;
