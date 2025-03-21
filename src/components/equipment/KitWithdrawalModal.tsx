
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [selectedProduction, setSelectedProduction] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPersonalUse, setIsPersonalUse] = useState(false);
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

  // Fetch available equipment
  const { 
    data: availableEquipments = [], 
    isLoading: isLoadingEquipment, 
    refetch: refetchEquipment,
    isError
  } = useQuery({
    queryKey: ["available-equipments"],
    queryFn: async () => {
      console.log("Fetching available equipment");
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("status", "disponível")
        .order("name");

      if (error) {
        console.error("Error fetching equipment:", error);
        throw error;
      }
      console.log("Fetched equipment:", data?.length || 0);
      return data || [];
    },
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 0, // Always fetch fresh data
    retry: 3,
  });

  // Reset and refetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("Modal is open, refetching equipment");
      setSelectedEquipments([]);
      // Force a refetch when modal opens
      queryClient.invalidateQueries({ queryKey: ["available-equipments"] });
      refetchEquipment();
    }
  }, [isOpen, refetchEquipment, queryClient]);

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

    if (!currentUser) {
      toast.error("Usuário não encontrado");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create withdrawals for each selected equipment
      for (const equipmentId of selectedEquipments) {
        const withdrawalData = {
          equipment_id: equipmentId,
          user_id: currentUser.id,
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

  // Debug logs
  console.log("KitWithdrawalModal isOpen:", isOpen);
  console.log("Available equipments count:", availableEquipments?.length);
  console.log("Equipment loading state:", isLoadingEquipment);
  console.log("Equipment error state:", isError);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Retirar Kit de Equipamentos</DialogTitle>
          <DialogDescription className="text-gray-400">
            Selecione os equipamentos que deseja retirar em conjunto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Equipment Selection Section */}
          <div className="space-y-2">
            <Label className="text-lg font-medium border-b border-[#141414] pb-2 w-full block">
              Equipamentos Disponíveis ({availableEquipments.length})
            </Label>
            
            {isLoadingEquipment ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#ff3335]" />
                <span className="ml-2">Carregando equipamentos...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-gray-400 border border-dashed border-[#141414] rounded-md">
                <p>Erro ao carregar equipamentos. Tente novamente.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => refetchEquipment()}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : availableEquipments.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border border-dashed border-[#141414] rounded-md">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                <p>Não há equipamentos disponíveis para retirada no momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 py-2 border border-[#141414] rounded-md p-3">
                {availableEquipments.map((equipment) => (
                  <div 
                    key={equipment.id} 
                    className="flex items-center space-x-2 p-2 rounded bg-[#141414] hover:bg-[#1f1f1f] transition-colors"
                    onClick={() => {
                      setSelectedEquipments(prev =>
                        prev.includes(equipment.id)
                          ? prev.filter(id => id !== equipment.id)
                          : [...prev, equipment.id]
                      );
                    }}
                  >
                    <Checkbox
                      id={`equipment-${equipment.id}`}
                      checked={selectedEquipments.includes(equipment.id)}
                      onCheckedChange={(checked) => {
                        setSelectedEquipments(prev =>
                          checked
                            ? [...prev, equipment.id]
                            : prev.filter(id => id !== equipment.id)
                        );
                      }}
                      className="border-[#ff3335] data-[state=checked]:bg-[#ff3335] data-[state=checked]:border-[#ff3335]"
                    />
                    <Label 
                      htmlFor={`equipment-${equipment.id}`} 
                      className="cursor-pointer flex-1 text-sm truncate"
                    >
                      {equipment.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#141414]">
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

        <DialogFooter className="mt-4">
          <div className="flex w-full justify-between items-center">
            <div className="text-sm">
              {selectedEquipments.length > 0 ? (
                <span className="text-[#ff3335] font-medium">{selectedEquipments.length} equipamento(s) selecionado(s)</span>
              ) : (
                <span className="text-gray-400">Nenhum equipamento selecionado</span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#ff3335] hover:bg-red-700"
                onClick={handleSubmit}
                disabled={isSubmitting || selectedEquipments.length === 0}
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
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
