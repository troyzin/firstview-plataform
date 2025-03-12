
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HistoryEvent } from "@/types/equipment";

type HistoryTabProps = {
  historyEvents: HistoryEvent[];
  renderEventType: (eventType: HistoryEvent["eventType"]) => React.ReactNode;
};

const HistoryTab = ({ historyEvents, renderEventType }: HistoryTabProps) => {
  return (
    <div className="bg-[#141414] rounded-lg p-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Produção</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{format(event.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                <TableCell>{renderEventType(event.eventType)}</TableCell>
                <TableCell>{event.equipmentName}</TableCell>
                <TableCell>{event.productionName || "N/A"}</TableCell>
                <TableCell>{event.responsibleName}</TableCell>
                <TableCell className="max-w-xs truncate">{event.notes || "N/A"}</TableCell>
              </TableRow>
            ))}
            {historyEvents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  Nenhum evento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HistoryTab;
