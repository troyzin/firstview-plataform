
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EquipmentForm, { EquipmentFormData } from "./EquipmentForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Equipment } from "@/types/equipment";

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment?: Equipment;
  onSuccess: () => void;
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hasAssociatedReceipts, setHasAssociatedReceipts] = useState(false);
  const [associatedReceiptsCount, setAssociatedReceiptsCount] = useState(0);

  const handleSubmit = async (data: EquipmentFormData) => {
    setIsSubmitting(true);
    try {
      // Remove quantity field if it exists in the data
      const { quantity, ...dataWithoutQuantity } = data as any;
      
      if (equipment?.id) {
        const { error } = await supabase
          .from('equipment')
          .update(dataWithoutQuantity)
          .eq('id', equipment.id);

        if (error) throw error;
        toast.success('Equipamento atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('equipment')
          .insert([dataWithoutQuantity]);

        if (error) throw error;
        toast.success('Equipamento adicionado com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar equipamento:', error);
      toast.error('Ocorreu um erro ao processar sua solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!equipment?.id) return;

    setIsSubmitting(true);
    setDeleteError(null);
    try {
      if (hasAssociatedReceipts) {
        // First delete associated withdrawals
        const { error: withdrawalsError } = await supabase
          .from('equipment_withdrawals')
          .delete()
          .eq('equipment_id', equipment.id);
        
        if (withdrawalsError) throw withdrawalsError;
      }

      // Then delete the equipment
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipment.id);

      if (error) throw error;

      toast.success('Equipamento excluído com sucesso!');
      onSuccess();
      onClose();
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      setDeleteError("Ocorreu um erro ao excluir o equipamento. Este equipamento pode estar sendo referenciado em outras partes do sistema.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkAssociatedReceipts = async () => {
    if (!equipment?.id) return;

    try {
      const { data, error, count } = await supabase
        .from('equipment_withdrawals')
        .select('id', { count: 'exact' })
        .eq('equipment_id', equipment.id);
      
      if (error) throw error;
      
      const hasReceipts = !!data && data.length > 0;
      setHasAssociatedReceipts(hasReceipts);
      setAssociatedReceiptsCount(count || 0);
      setIsDeleteAlertOpen(true);
    } catch (error) {
      console.error('Erro ao verificar recibos associados:', error);
      toast.error('Ocorreu um erro ao verificar recibos associados');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {equipment?.id ? "Editar Equipamento" : "Novo Equipamento"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {equipment?.id
                  ? "Altere as informações do equipamento conforme necessário."
                  : "Preencha as informações para adicionar um novo equipamento ao inventário."}
              </DialogDescription>
            </div>
            
            {equipment?.id && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-red-900/20 hover:text-red-400"
                onClick={checkAssociatedReceipts}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </DialogHeader>

          <EquipmentForm
            initialData={equipment}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-[#000000] border border-[#141414] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {hasAssociatedReceipts ? (
                <>
                  <p>O equipamento <span className="text-white font-medium">{equipment?.name}</span> está associado a {associatedReceiptsCount} recibo(s) de retirada.</p>
                  <p className="mt-2 text-[#ff3335] font-medium">Atenção: Se você excluir este equipamento, todos os recibos relacionados a ele também serão excluídos permanentemente.</p>
                  <p className="mt-2">Esta ação não pode ser desfeita. Deseja continuar?</p>
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir o equipamento <span className="text-white font-medium">{equipment?.name}</span>?
                  <br />Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
            
            {deleteError && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-md text-[#ff3335]">
                {deleteError}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEquipment}
              disabled={isSubmitting}
              className="bg-[#ff3335] hover:bg-red-700"
            >
              {isSubmitting ? "Excluindo..." : hasAssociatedReceipts ? "Excluir Tudo" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EquipmentModal;
