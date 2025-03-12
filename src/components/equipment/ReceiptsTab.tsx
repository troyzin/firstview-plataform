
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt } from "@/types/equipment";

type ReceiptsTabProps = {
  receipts: Receipt[];
  openReceiptModal: (receipt: Receipt) => void;
  renderReceiptStatus: (status: string) => React.ReactNode;
};

const ReceiptsTab: React.FC<ReceiptsTabProps> = ({
  receipts,
  openReceiptModal,
  renderReceiptStatus,
}) => {
  return (
    <div className="bg-[#141414] rounded-lg p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Produção</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>
                  {receipt.withdrawal_date && format(new Date(receipt.withdrawal_date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>{receipt.equipment?.name || receipt.equipment_id}</TableCell>
                <TableCell>{receipt.user?.full_name || receipt.user_id}</TableCell>
                <TableCell>
                  {receipt.is_personal_use ? (
                    <span className="text-gray-400">Uso Pessoal</span>
                  ) : (
                    receipt.production?.title || <span className="text-gray-400">Sem produção</span>
                  )}
                </TableCell>
                <TableCell>{renderReceiptStatus(receipt.status)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openReceiptModal(receipt)}
                    className="hover:bg-[#141414]"
                  >
                    <Info className="h-4 w-4 text-[#ff3335]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {receipts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
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
