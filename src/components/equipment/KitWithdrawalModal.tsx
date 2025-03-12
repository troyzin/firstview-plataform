
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types/equipment";

interface KitWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const KitWithdrawalModal: React.FC<KitWithdrawalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [selectedProduction, setSelectedProduction] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPersonalUse, setIsPersonalUse] = useState(false);

  // Fetch available equipment
  const { data: availableEquipments = [] } = useQuery<Equipment[]>({
    queryKey: ["available-equipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("status", "disponível")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch productions
  const { data: productions = [] } = useQuery({
    queryKey: ["productions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productions")
        .select("id, title")
        .order("title");

      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = async () => {
    if (!returnDate) {
      toast.error("Por favor, selecione uma data de devolução esperada");
      return;
    }

    if (!isPersonalUse && !selectedProduction) {
      toast.error("Por favor, selecione uma produção");
      return;
    }

    if (selectedEquipments.length === 0) {
      toast.error("Por favor, selecione pelo menos um equipamento");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Create withdrawals for each selected equipment
      for (const equipmentId of selectedEquipments) {
        const withdrawalData = {
          equipment_id: equipmentId,
          user_id: user.id,
          production_id: isPersonalUse ? null : selectedProduction,
          expected_return_date: returnDate.toISOString(),
          notes: notes,
          status: "withdrawn",
          is_personal_use: isPersonalUse,
        };

        // Create withdrawal record
        const { error: withdrawalError } = await supabase
          .from("equipment_withdrawals")
          .insert(withdrawalData);

        if (withdrawalError) throw withdrawalError;

        // Update equipment status
        const { error: equipmentError } = await supabase
          .from("equipment")
          .update({ status: "em uso" })
          .eq("id", equipmentId);

        if (equipmentError) throw equipmentError;
      }

      toast.success(`${selectedEquipments.length} equipamentos retirados com sucesso!`);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Erro ao processar retirada:", error);
      toast.error("Ocorreu um erro ao processar a retirada");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedEquipments([]);
    setReturnDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setSelectedProduction("");
    setNotes("");
    setIsPersonalUse(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Retirar Kit de Equipamentos</DialogTitle>
          <DialogDescription className="text-gray-400">
            Selecione os equipamentos que deseja retirar em conjunto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {availableEquipments.map((equipment) => (
              <div key={equipment.id} className="flex items-center space-x-2">
                <Checkbox
                  id={equipment.id}
                  checked={selectedEquipments.includes(equipment.id)}
                  onCheckedChange={(checked) => {
                    setSelectedEquipments(prev =>
                      checked
                        ? [...prev, equipment.id]
                        : prev.filter(id => id !== equipment.id)
                    );
                  }}
                />
                <Label htmlFor={equipment.id} className="cursor-pointer">
                  {equipment.name}
                </Label>
              </div>
            ))}
          </div>

          <div>
            <Label className="text-sm font-medium mb-1 block">Tipo de Uso</Label>
            <Select
              value={isPersonalUse ? "personal" : "production"}
              onValueChange={(value) => setIsPersonalUse(value === "personal")}
            >
              <SelectTrigger className="w-full bg-[#141414] border-[#141414]">
                <SelectValue placeholder="Selecione o tipo de uso" />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-[#141414]">
                <SelectItem value="production">Produção</SelectItem>
                <SelectItem value="personal">Uso Pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isPersonalUse && (
            <div>
              <Label className="text-sm font-medium mb-1 block">Produção</Label>
              <Select value={selectedProduction} onValueChange={setSelectedProduction}>
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
            <Label className="text-sm font-medium mb-1 block">
              Data Esperada de Devolução
            </Label>
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
                  className={cn("p-3 bg-[#141414]")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1 block">Observações</Label>
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
            onClick={handleClose}
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
                <Package className="h-4 w-4 mr-2" />
                Confirmar Retirada
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
