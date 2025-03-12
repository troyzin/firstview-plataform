
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { EquipmentSchedule } from "@/types/equipment";

interface Production {
  id: string;
  title: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: string;
  equipmentName?: string;
  scheduleToEdit?: EquipmentSchedule;
  onSuccess: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName = "",
  scheduleToEdit,
  onSuccess,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 7 days from now
  );
  const [selectedProduction, setSelectedProduction] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: string, full_name: string | null} | null>(null);

  // Set form values when editing
  useEffect(() => {
    if (scheduleToEdit) {
      setStartDate(new Date(scheduleToEdit.start_date));
      setEndDate(new Date(scheduleToEdit.end_date));
      setSelectedProduction(scheduleToEdit.production_id || "");
      setNotes(scheduleToEdit.notes || "");
    } else {
      // Reset form for new schedule
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setSelectedProduction("");
      setNotes("");
    }
  }, [scheduleToEdit, isOpen]);

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

    fetchCurrentUser();
  }, []);

  // Fetch productions
  const { data: productions = [] } = useQuery<Production[]>({
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
    if (!startDate || !endDate) {
      toast.error("Por favor, selecione as datas de início e fim");
      return;
    }

    if (!selectedProduction) {
      toast.error("Por favor, selecione uma produção");
      return;
    }

    if (!currentUser) {
      toast.error("Usuário não encontrado");
      return;
    }

    setIsSubmitting(true);

    try {
      if (scheduleToEdit) {
        // Update existing schedule
        const { error } = await supabase
          .from("equipment_schedules")
          .update({
            production_id: selectedProduction,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            notes: notes,
          })
          .eq('id', scheduleToEdit.id);

        if (error) throw error;
        toast.success(`Agendamento atualizado com sucesso!`);
      } else {
        // Create a new schedule record
        const { error } = await supabase
          .from("equipment_schedules")
          .insert([
            {
              equipment_id: equipmentId,
              user_id: currentUser.id,
              production_id: selectedProduction,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              notes: notes,
            },
          ]);

        if (error) throw error;
        toast.success(`${equipmentName || "Equipamento"} agendado com sucesso!`);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao agendar equipamento:", error);
      toast.error("Ocorreu um erro ao agendar o equipamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = scheduleToEdit ? "Editar Agendamento" : "Agendar Equipamento";
  const buttonText = scheduleToEdit ? "Salvar Alterações" : "Agendar";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {equipmentName
              ? `${scheduleToEdit ? 'Editar agendamento' : 'Agendamento'} para: ${equipmentName}`
              : scheduleToEdit ? "Editar agendamento" : "Agende a utilização deste equipamento"}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-[#141414] border-[#141414]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#141414] border-[#141414]">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date < new Date() && !scheduleToEdit}
                    className={cn("p-3 pointer-events-auto bg-[#141414]")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-[#141414] border-[#141414]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#141414] border-[#141414]">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate && date < startDate}
                    className={cn("p-3 pointer-events-auto bg-[#141414]")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Produção</label>
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
                <Calendar className="h-4 w-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
