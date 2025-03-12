
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Equipment, Receipt as ReceiptType } from "@/types/equipment";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  // Filter equipment that's currently in use (withdrawn)
  const equipmentInUse = receipts
    .filter(receipt => receipt.status === "withdrawn")
    .sort((a, b) => new Date(b.withdrawal_date).getTime() - new Date(a.withdrawal_date).getTime());

  // Filter available equipment
  const availableEquipment = equipments
    .filter(equipment => equipment.status === "disponível")
    .sort((a, b) => a.name.localeCompare(b.name));

  // Since we don't have a direct "scheduled" status in the type, 
  // let's assume scheduled equipment might be in receipts but with a future withdrawal date
  // or would need to be fetched from a separate schedule list
  const scheduledEquipment = receipts
    .filter(receipt => receipt.status === "withdrawn" && new Date(receipt.withdrawal_date) > new Date())
    .sort((a, b) => new Date(a.withdrawal_date).getTime() - new Date(b.withdrawal_date).getTime());

  // Formatting a shorter ID for display
  const formatReceiptId = (id: string) => {
    if (!id) return "#0000";
    return "#" + id.substring(0, 4);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Equipment In Use Table */}
      <div className="bg-[#141414] rounded-lg p-4 overflow-x-auto">
        <Table>
          <TableCaption className="mt-2">
            Equipamentos em Uso
          </TableCaption>
          <TableHeader>
            <TableRow className="border-[#141414]">
              <TableHead>ID</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Devolução</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipmentInUse.slice(0, 5).map(receipt => (
              <TableRow key={`in-use-${receipt.id}`}>
                <TableCell>{formatReceiptId(receipt.id)}</TableCell>
                <TableCell>{receipt.equipment?.name || "Não encontrado"}</TableCell>
                <TableCell>{receipt.user?.full_name || "Usuário"}</TableCell>
                <TableCell>{formatDate(receipt.expected_return_date)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openReceiptModal(receipt)}
                    className="h-8 w-8 p-0 hover:bg-gray-800"
                  >
                    <EyeIcon className="h-4 w-4 text-[#ff3335]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {equipmentInUse.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Nenhum equipamento em uso
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Available Equipment Table */}
      <div className="bg-[#141414] rounded-lg p-4 overflow-x-auto">
        <Table>
          <TableCaption className="mt-2">
            Equipamentos Disponíveis
          </TableCaption>
          <TableHeader>
            <TableRow className="border-[#141414]">
              <TableHead>Equipamento</TableHead>
              <TableHead>Marca/Modelo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availableEquipment.slice(0, 5).map(equipment => (
              <TableRow key={`available-${equipment.id}`}>
                <TableCell>{equipment.name}</TableCell>
                <TableCell>
                  {equipment.brand && equipment.model 
                    ? `${equipment.brand} ${equipment.model}`
                    : equipment.brand || equipment.model || "-"}
                </TableCell>
              </TableRow>
            ))}
            {availableEquipment.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-500">
                  Nenhum equipamento disponível
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Scheduled Equipment Table */}
      <div className="bg-[#141414] rounded-lg p-4 overflow-x-auto">
        <Table>
          <TableCaption className="mt-2">
            Equipamentos Agendados
          </TableCaption>
          <TableHeader>
            <TableRow className="border-[#141414]">
              <TableHead>Equipamento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data Agendada</TableHead>
              <TableHead>Devolução</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledEquipment.slice(0, 5).map(schedule => (
              <TableRow key={`scheduled-${schedule.id}`}>
                <TableCell>{schedule.equipment?.name || "Não encontrado"}</TableCell>
                <TableCell>{schedule.user?.full_name || "Usuário"}</TableCell>
                <TableCell>{formatDate(schedule.withdrawal_date)}</TableCell>
                <TableCell>{formatDate(schedule.expected_return_date)}</TableCell>
              </TableRow>
            ))}
            {scheduledEquipment.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Nenhum equipamento agendado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StatusTables;
