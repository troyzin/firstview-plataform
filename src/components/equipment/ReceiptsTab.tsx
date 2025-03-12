
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ReceiptText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Receipt as ReceiptType } from "@/types/equipment";

type ReceiptsTabProps = {
  receipts: ReceiptType[];
  openReceiptModal: (receipt: ReceiptType) => void;
  renderReceiptStatus: (status: string) => React.ReactNode;
};

const ReceiptsTab = ({ receipts, openReceiptModal, renderReceiptStatus }: ReceiptsTabProps) => {
  
  // Format IDs to display as #0001, #0002, etc.
  const formatID = (id: string) => {
    if (!id) return '#0000';
    
    // Try to extract a numeric portion from the UUID
    const parts = id.split('-');
    if (!parts || parts.length === 0) return `#${id.substring(0, 4)}`;
    
    // Try to parse the first part as a number or use a fallback
    const numericId = parseInt(parts[0], 16) % 10000 || 0;
    return `#${numericId.toString().padStart(4, '0')}`;
  };
  
  return (
    <div className="bg-[#141414] rounded-lg p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Produção</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>{formatID(receipt.id)}</TableCell>
                <TableCell>
                  {receipt.withdrawal_date 
                    ? format(new Date(receipt.withdrawal_date), "dd/MM/yyyy", { locale: ptBR })
                    : "N/A"}
                </TableCell>
                <TableCell>{receipt.equipment?.name || "N/A"}</TableCell>
                <TableCell>
                  {receipt.is_personal_use 
                    ? "Uso Pessoal" 
                    : receipt.production 
                      ? formatID(receipt.production.id)
                      : "N/A"}
                </TableCell>
                <TableCell>{receipt.user?.full_name || "N/A"}</TableCell>
                <TableCell>{renderReceiptStatus(receipt.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openReceiptModal(receipt)}
                    className="h-8 w-8 rounded-full hover:bg-gray-700"
                  >
                    <ReceiptText className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {receipts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Nenhum recibo encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReceiptsTab;
