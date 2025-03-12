
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

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: string;
  equipmentName: string;
  onSuccess: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  onSuccess,
}) => {
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{id: string, full_name: string | null} | null>(null);
  const [isLate, setIsLate] = useState(false);

  // Fetch current user and active withdrawal
  useEffect(() => {
    const fetchData = async () => {
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

      // Get active withdrawal for this equipment
      const { data: withdrawalData } = await supabase
        .from('equipment_withdrawals')
        .select('id, expected_return_date, status')
        .eq('equipment_id', equipmentId)
        .eq('status', 'withdrawn')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (withdrawalData) {
        setWithdrawalId(withdrawalData.id);
        
        // Check if return is late
        const expectedDate = new Date(withdrawalData.expected_return_date);
        const now = new Date();
        setIsLate(now > expectedDate);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, equipmentId]);

  const handleSubmit = async () => {
    if (!withdrawalId) {
      toast.error("Não foi encontrada uma retirada ativa para este equipamento");
      return;
    }

    if (!currentUser) {
      toast.error("Usuário não encontrado");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update withdrawal record
      const { error: withdrawalError } = await supabase
        .from("equipment_withdrawals")
        .update({
          returned_date: new Date().toISOString(),
          return_notes: notes,
          status: isLate ? "returned_late" : "returned",
        })
        .eq("id", withdrawalId);

      if (withdrawalError) throw withdrawalError;

      // Update equipment status to "disponível"
      const { error: equipmentError } = await supabase
        .from("equipment")
        .update({
          status: "disponível",
        })
        .eq("id", equipmentId);

      if (equipmentError) throw equipmentError;

      toast.success(`${equipmentName} devolvido com sucesso!`);
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
            {equipmentName
              ? `Confirmar devolução de: ${equipmentName}`
              : "Confirme a devolução deste equipamento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {isLate && (
            <div className="p-3 bg-[#ff3335]/10 border border-[#ff3335]/20 rounded-md text-[#ff3335]">
              <p className="text-sm">
                <strong>Atenção:</strong> Esta devolução está atrasada em relação à data esperada.
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
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={isSubmitting || !withdrawalId}
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
