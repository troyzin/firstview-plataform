
import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Production {
  id: string;
  title: string;
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: string;
  equipmentName: string;
  onSuccess: () => void;
  isPersonalUse?: boolean;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  onSuccess,
  isPersonalUse = false,
}) => {
  const queryClient = useQueryClient();
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 7 days from now
  );
  const [selectedProduction, setSelectedProduction] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: string, full_name: string | null} | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setCurrentUser(data);
        }
      }
    };

    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  // Fetch productions
  const { data: productions = [] } = useQuery<Production[]>({
    queryKey: ["productions"],
    queryFn: async () => {
      console.log("Fetching productions");
      const { data, error } = await supabase
        .from("productions")
        .select("id, title")
        .order("title");

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !isPersonalUse,
    staleTime: 60000, // 1 minute
  });

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setReturnDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setSelectedProduction("");
      setNotes("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!returnDate) {
      toast.error("Por favor, selecione uma data de devolução esperada");
      return;
    }

    if (!isPersonalUse && !selectedProduction) {
      toast.error("Por favor, selecione uma produção");
      return;
    }

    if (!currentUser) {
      toast.error("Usuário não encontrado");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a withdrawal record
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from("equipment_withdrawals")
        .insert([
          {
            equipment_id: equipmentId,
            user_id: currentUser.id,
            production_id: isPersonalUse ? null : selectedProduction,
            expected_return_date: returnDate.toISOString(),
            notes: notes,
            status: "withdrawn",
            is_personal_use: isPersonalUse,
          },
        ])
        .select()
        .single();

      if (withdrawalError) throw withdrawalError;

      // Update equipment status to "em uso"
      const { error: equipmentError } = await supabase
        .from("equipment")
        .update({
          status: "em uso",
        })
        .eq("id", equipmentId);

      if (equipmentError) throw equipmentError;

      toast.success(
        `${equipmentName} retirado com sucesso! ID: ${withdrawal.id.substring(0, 8)}`
      );
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
      queryClient.invalidateQueries({ queryKey: ["available-equipments"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao processar retirada:", error);
      toast.error("Ocorreu um erro ao processar a retirada");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isPersonalUse ? "Retirar para Uso Pessoal" : "Retirar Equipamento"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {equipmentName
              ? `Retirada para: ${equipmentName}`
              : "Configure a retirada deste equipamento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Responsável</label>
            <Input
              className="bg-[#141414] border-[#141414]"
              value={currentUser?.full_name || "Usuário não identificado"}
              readOnly
              disabled
            />
          </div>

          {!isPersonalUse && (
            <div>
              <label className="text-sm font-medium mb-1 block">Produção</label>
              <Select
                value={selectedProduction}
                onValueChange={setSelectedProduction}
              >
                <SelectTrigger className="w-full bg-[#141414] border-[#141414]">
                  <SelectValue placeholder="Selecione uma produção" />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-[#141414]">
                  {productions.map((production) => (
                    <SelectItem key={production.id} value={production.id}>
                      {production.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1 block">
              Data Esperada de Devolução
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-[#141414] border-[#141414]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? (
                    format(returnDate, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#141414] border-[#141414]">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className={cn("p-3 pointer-events-auto bg-[#141414]")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Observações</label>
            <Textarea
              className="bg-[#141414] border-[#141414]"
              placeholder="Observações adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700"
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#ff3335] hover:bg-red-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Confirmar Retirada
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
