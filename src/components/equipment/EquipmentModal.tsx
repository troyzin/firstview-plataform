
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {equipment?.id ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {equipment?.id
              ? "Altere as informações do equipamento conforme necessário."
              : "Preencha as informações para adicionar um novo equipamento ao inventário."}
          </DialogDescription>
        </DialogHeader>

        <EquipmentForm
          initialData={equipment}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentModal;
