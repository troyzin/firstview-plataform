
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Check, 
  Clock, 
  AlertTriangle,
  User,
  CalendarX,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReceiptModal } from "./ReceiptModal";

interface WithdrawalData {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id: string | null;
  created_at: string;
  expected_return_date: string;
  returned_date: string | null;
  notes: string | null;
  status: string;
  is_personal_use: boolean;
  equipment: {
    name: string;
  };
  user: {
    full_name: string;
  };
  production: {
    title: string;
  } | null;
}

export const WithdrawalsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Fetch all withdrawals
  const { data: withdrawals = [], isLoading, refetch } = useQuery({
    queryKey: ["equipment_withdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_withdrawals")
        .select(`
          *,
          equipment:equipment_id(name),
          user:user_id(full_name),
          production:production_id(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Check for any overdue withdrawals and update their status
      const now = new Date();
      const overdueWithdrawals = data?.filter(
        (w) => 
          w.status === "withdrawn" && 
          isAfter(now, new Date(w.expected_return_date))
      ) || [];

      if (overdueWithdrawals.length > 0) {
        await Promise.all(
          overdueWithdrawals.map(async (withdrawal) => {
            await supabase
              .from("equipment_withdrawals")
              .update({ status: "overdue" })
              .eq("id", withdrawal.id);
          })
        );
        
        // Update the status in our local data
        overdueWithdrawals.forEach(w => {
          w.status = "overdue";
        });
      }

      return data || [];
    },
  });

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      withdrawal.equipment?.name.toLowerCase().includes(searchLower) ||
      withdrawal.user?.full_name.toLowerCase().includes(searchLower) ||
      (withdrawal.production?.title?.toLowerCase().includes(searchLower) || false) ||
      withdrawal.status.toLowerCase().includes(searchLower)
    );
  });

  const openReceiptModal = (receiptId: string) => {
    setSelectedReceiptId(receiptId);
    setIsReceiptModalOpen(true);
  };

  const renderStatusBadge = (status: string, expectedDate: string, returnedDate: string | null) => {
    switch (status) {
      case "withdrawn":
        return (
          <Badge className="bg-[#ff3335]">
            <Clock className="h-3 w-3 mr-1" /> Em Uso
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-600">
            <AlertTriangle className="h-3 w-3 mr-1" /> Atrasado
          </Badge>
        );
      case "returned":
        return (
          <Badge className="bg-green-600">
            <Check className="h-3 w-3 mr-1" /> Devolvido
          </Badge>
        );
      case "returned_late":
        return (
          <Badge className="bg-amber-600">
            <CalendarX className="h-3 w-3 mr-1" /> Devolvido com Atraso
          </Badge>
        );
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center bg-[#141414] rounded-md px-3 py-2 w-full">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <Input
          placeholder="Buscar retiradas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-[#141414]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipamento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Produção</TableHead>
              <TableHead>Retirada</TableHead>
              <TableHead>Devolução Esperada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Recibo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWithdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  Nenhuma retirada encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="font-medium">
                    {withdrawal.equipment?.name || "N/A"}
                  </TableCell>
                  <TableCell>{withdrawal.user?.full_name || "N/A"}</TableCell>
                  <TableCell>
                    {withdrawal.is_personal_use ? (
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>Uso Pessoal</span>
                      </div>
                    ) : (
                      withdrawal.production?.title || "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(withdrawal.created_at), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(withdrawal.expected_return_date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(
                      withdrawal.status,
                      withdrawal.expected_return_date,
                      withdrawal.returned_date
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openReceiptModal(withdrawal.id)}
                      className="h-8 w-8 p-0"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedReceiptId && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          receiptId={selectedReceiptId}
        />
      )}
    </div>
  );
};
