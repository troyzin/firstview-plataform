
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EquipmentWithdrawal } from "@/types/equipment";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId?: string;
  equipmentName?: string;
  equipmentWithdrawal?: EquipmentWithdrawal;
  onSuccess: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  equipmentWithdrawal,
  onSuccess,
}) => {
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{id: string, full_name: string | null} | null>(null);
  const [isLate, setIsLate] = useState(false);
  const [actualEquipmentId, setActualEquipmentId] = useState<string | undefined>(equipmentId);
  const [actualEquipmentName, setActualEquipmentName] = useState<string | undefined>(equipmentName);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from props when component mounts or when props change
  useEffect(() => {
    if (equipmentWithdrawal) {
      setWithdrawalId(equipmentWithdrawal.id);
      setActualEquipmentId(equipmentWithdrawal.equipment_id);
      setActualEquipmentName(equipmentWithdrawal.equipment?.name);
      
      // Check if return is late
      const expectedDate = new Date(equipmentWithdrawal.expected_return_date);
      const now = new Date();
      setIsLate(now > expectedDate);
      setIsLoading(false);
    }
  }, [equipmentWithdrawal, isOpen]);

  // Fetch current user and active withdrawal
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setCurrentUser(profileData);
          }
        }

        // Only fetch withdrawal if not already provided through props
        if (!equipmentWithdrawal && actualEquipmentId) {
          console.log("Fetching active withdrawal for equipment ID:", actualEquipmentId);
          
          const { data: withdrawalData, error } = await supabase
            .from('equipment_withdrawals')
            .select('*, equipment:equipment_id(*)')
            .eq('equipment_id', actualEquipmentId)
            .eq('status', 'withdrawn')
            .order('withdrawal_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) {
            console.error("Error fetching withdrawal:", error);
            toast.error("Erro ao buscar retirada ativa");
            return;
          }

          console.log("Withdrawal data found:", withdrawalData);
          
          if (withdrawalData) {
            setWithdrawalId(withdrawalData.id);
            
            // Check if return is late
            const expectedDate = new Date(withdrawalData.expected_return_date);
            const now = new Date();
            setIsLate(now > expectedDate);
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, actualEquipmentId, equipmentWithdrawal]);

  const handleSubmit = async () => {
    if (!withdrawalId) {
      toast.error("Não foi encontrada uma retirada ativa para este equipamento");
      return;
    }

    if (!currentUser) {
      toast.error("Usuário não encontrado");
      return;
    }

    if (!actualEquipmentId) {
      toast.error("ID do equipamento não encontrado");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Processing return for withdrawal:", withdrawalId);
      
      // Update withdrawal record
      const returnData = {
        returned_date: new Date().toISOString(),
        return_notes: notes,
        status: isLate ? "returned_late" : "returned",
      };

      console.log("Return data:", returnData);
      
      const { data: updatedWithdrawal, error: withdrawalError } = await supabase
        .from("equipment_withdrawals")
        .update(returnData)
        .eq("id", withdrawalId)
        .select()
        .single();

      if (withdrawalError) {
        console.error("Error updating withdrawal:", withdrawalError);
        throw withdrawalError;
      }

      console.log("Successfully updated withdrawal:", updatedWithdrawal);
      console.log("Now updating equipment status");

      // Update equipment status to "disponível"
      const { error: equipmentError } = await supabase
        .from("equipment")
        .update({ 
          status: "disponível",
          updated_at: new Date().toISOString()
        })
        .eq("id", actualEquipmentId);

      if (equipmentError) {
        console.error("Error updating equipment:", equipmentError);
        throw equipmentError;
      }

      console.log("Equipment updated successfully");
      toast.success(`${actualEquipmentName || "Equipamento"} devolvido com sucesso!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao processar devolução:", error);
      toast.error("Ocorreu um erro ao processar a devolução");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Devolver Equipamento</DialogTitle>
          <DialogDescription className="text-gray-400">
            {actualEquipmentName
              ? `Confirmar devolução de: ${actualEquipmentName}`
              : "Confirme a devolução deste equipamento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#ff3335]" />
            </div>
          ) : (
            <>
              {isLate && (
                <div className="p-3 bg-[#ff3335]/10 border border-[#ff3335]/20 rounded-md text-[#ff3335]">
                  <p className="text-sm">
                    <strong>Atenção:</strong> Esta devolução está atrasada em relação à data esperada.
                  </p>
                </div>
              )}

              {!withdrawalId && !isLoading && (
                <div className="p-3 bg-[#ff3335]/10 border border-[#ff3335]/20 rounded-md text-[#ff3335]">
                  <p className="text-sm">
                    <strong>Atenção:</strong> Não foi encontrada uma retirada ativa para este equipamento.
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">Responsável</label>
                <Input
                  className="bg-[#141414] border-[#141414]"
                  value={currentUser?.full_name || "Usuário não identificado"}
                  readOnly
                  disabled
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Observações sobre a condição do equipamento (opcional)
                </label>
                <Textarea
                  className="bg-[#141414] border-[#141414]"
                  placeholder="Exemplo: Equipamento em bom estado, pequeno arranhão na lente..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-[#141414] text-white hover:bg-[#292929] border-[#292929]"
          >
            Cancelar
          </Button>
          <Button
            className="bg-[#ff3335] hover:bg-[#cc2a2b]"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || !withdrawalId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Confirmar Devolução
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
