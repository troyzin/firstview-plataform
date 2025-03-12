
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment?: EquipmentFormData;
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

  const handleSubmit = async (data: EquipmentFormData, file: File | null) => {
    setIsSubmitting(true);
    try {
      let imageUrl = data.image_url;

      // Se tiver um arquivo para upload, faz o upload da imagem
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('equipment')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          toast.error('Erro ao fazer upload da imagem');
          setIsSubmitting(false);
          return;
        }

        // Obter a URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('equipment')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Prepara os dados para salvar
      const equipmentData = {
        ...data,
        image_url: imageUrl,
      };

      // Verifica se é uma atualização ou criação
      if (equipment?.id) {
        // Atualiza o equipamento existente
        const { error } = await supabase
          .from('equipment')
          .update(equipmentData)
          .eq('id', equipment.id);

        if (error) {
          console.error('Erro ao atualizar equipamento:', error);
          toast.error('Erro ao atualizar equipamento');
          return;
        }

        toast.success('Equipamento atualizado com sucesso!');
      } else {
        // Cria um novo equipamento
        const { error } = await supabase
          .from('equipment')
          .insert([equipmentData]);

        if (error) {
          console.error('Erro ao adicionar equipamento:', error);
          toast.error('Erro ao adicionar equipamento');
          return;
        }

        toast.success('Equipamento adicionado com sucesso!');
      }

      // Fecha o modal e atualiza a lista
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
    try {
      // Se houver uma imagem, exclui do storage
      if (equipment.image_url) {
        const imagePath = equipment.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('equipment')
            .remove([imagePath]);
        }
      }

      // Exclui o equipamento do banco de dados
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipment.id);

      if (error) {
        throw error;
      }

      toast.success('Equipamento excluído com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      toast.error('Ocorreu um erro ao excluir o equipamento');
    } finally {
      setIsSubmitting(false);
      setIsDeleteAlertOpen(false);
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
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-red-900/20 hover:text-red-400"
                  onClick={() => setIsDeleteAlertOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
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
              Tem certeza que deseja excluir o equipamento <span className="text-white font-medium">{equipment?.name}</span>?
              <br />Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEquipment}
              className="bg-[#ff3335] hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EquipmentModal;
