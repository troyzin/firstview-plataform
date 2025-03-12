
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Clock, AlertTriangle, CalendarX } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Receipt {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id: string | null;
  created_at: string;
  expected_return_date: string;
  returned_date: string | null;
  notes: string | null;
  return_notes: string | null;
  status: "withdrawn" | "overdue" | "returned" | "returned_late";
  is_personal_use: boolean;
  equipment_name: string;
  user_name: string;
  production_name: string | null;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptId: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptId,
}) => {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!isOpen || !receiptId) return;

      setLoading(true);
      try {
        // Get receipt with related data
        const { data, error } = await supabase
          .from("equipment_withdrawals")
          .select(`
            *,
            equipment:equipment_id(name),
            user:user_id(full_name),
            production:production_id(title)
          `)
          .eq("id", receiptId)
          .single();

        if (error) throw error;

        if (data) {
          setReceipt({
            ...data,
            equipment_name: data.equipment?.name || "Equipamento não encontrado",
            user_name: data.user?.full_name || "Usuário não encontrado",
            production_name: data.production?.title || null,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar recibo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [isOpen, receiptId]);

  const renderStatusBadge = (status: string) => {
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

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[500px]">
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!receipt) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Recibo não encontrado</DialogTitle>
            <DialogDescription className="text-gray-400">
              Não foi possível encontrar o recibo solicitado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={onClose}
              className="bg-[#ff3335] hover:bg-red-700"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">Recibo de Retirada</DialogTitle>
            {renderStatusBadge(receipt.status)}
          </div>
          <DialogDescription className="text-gray-400">
            ID: {receipt.id.substring(0, 8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="border-t border-[#141414] pt-4">
            <h3 className="font-medium mb-4">Informações do Equipamento</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-400">Equipamento</p>
                <p className="font-medium">{receipt.equipment_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Tipo</p>
                <p className="font-medium">
                  {receipt.is_personal_use ? "Uso Pessoal" : "Produção"}
                </p>
              </div>
              
              {!receipt.is_personal_use && receipt.production_name && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Produção</p>
                  <p className="font-medium">{receipt.production_name}</p>
                </div>
              )}
              
              {receipt.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Observações</p>
                  <p className="text-sm">{receipt.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-[#141414] pt-4">
            <h3 className="font-medium mb-4">Informações da Retirada</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-400">Responsável</p>
                <p className="font-medium">{receipt.user_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Data de Retirada</p>
                <p className="font-medium">
                  {format(new Date(receipt.created_at), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Devolução Esperada</p>
                <p className="font-medium">
                  {format(new Date(receipt.expected_return_date), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Data de Devolução</p>
                <p className="font-medium">
                  {receipt.returned_date
                    ? format(new Date(receipt.returned_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "Pendente"}
                </p>
              </div>
              
              {receipt.return_notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Observações na Devolução</p>
                  <p className="text-sm">{receipt.return_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-gray-800 hover:bg-gray-700">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
