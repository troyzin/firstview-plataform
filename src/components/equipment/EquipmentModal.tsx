
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, ImageIcon } from "lucide-react";

// Form validation schema
const equipmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  status: z.string().default("disponível"),
  acquisition_date: z.string().optional(),
  notes: z.string().optional(),
});

const EquipmentModal = ({ isOpen, onClose, equipment }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();

  // Set up form with default values
  const form = useForm({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      model: "",
      serial_number: "",
      quantity: 1,
      status: "disponível",
      acquisition_date: "",
      notes: "",
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (equipment) {
      form.reset({
        name: equipment.name || "",
        category: equipment.category || "",
        brand: equipment.brand || "",
        model: equipment.model || "",
        serial_number: equipment.serial_number || "",
        quantity: equipment.quantity || 1,
        status: equipment.status || "disponível",
        acquisition_date: equipment.acquisition_date 
          ? new Date(equipment.acquisition_date).toISOString().split("T")[0]
          : "",
        notes: equipment.notes || "",
      });
      
      if (equipment.image_url) {
        setImagePreview(equipment.image_url);
      }
    }
  }, [equipment, form]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file, equipmentId) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${equipmentId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // First, create the storage bucket if it doesn't exist
    const { error: storageError } = await supabase
      .storage
      .createBucket('equipment-images', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
      })
      .catch(() => ({ error: null })); // Ignore error if bucket already exists
      
    const { data, error } = await supabase
      .storage
      .from('equipment-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // Generate public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('equipment-images')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  // Save equipment mutation
  const saveEquipment = useMutation({
    mutationFn: async (formData) => {
      let imageUrl = equipment?.image_url || null;
      let equipmentId = equipment?.id || null;
      
      // First, insert/update the equipment to get the ID
      if (equipment) {
        // Update existing equipment
        const { data, error } = await supabase
          .from('equipment')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', equipment.id)
          .select();
        
        if (error) throw error;
        equipmentId = equipment.id;
      } else {
        // Create new equipment
        const { data, error } = await supabase
          .from('equipment')
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();
        
        if (error) throw error;
        equipmentId = data[0].id;
      }
      
      // If there's a new image, upload it
      if (imageFile) {
        setIsUploading(true);
        imageUrl = await uploadImage(imageFile, equipmentId);
        
        // Update the equipment with the image URL
        const { error } = await supabase
          .from('equipment')
          .update({ image_url: imageUrl })
          .eq('id', equipmentId);
        
        if (error) throw error;
      }
      
      return { ...formData, id: equipmentId, image_url: imageUrl };
    },
    onSuccess: () => {
      toast.success(equipment 
        ? "Equipamento atualizado com sucesso" 
        : "Equipamento adicionado com sucesso"
      );
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      onClose();
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Erro ao salvar: ${error.message}`);
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      saveEquipment.mutate(data);
    } catch (error) {
      console.error(error);
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#141414] text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {equipment ? "Editar Equipamento" : "Adicionar Equipamento"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do equipamento" {...field} />
                    </FormControl>
                    <FormMessage className="text-[#ff3335]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Câmera">Câmera</SelectItem>
                          <SelectItem value="Áudio">Áudio</SelectItem>
                          <SelectItem value="Iluminação">Iluminação</SelectItem>
                          <SelectItem value="Estabilização">Estabilização</SelectItem>
                          <SelectItem value="Acessório">Acessório</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Marca" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Modelo" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Série</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de Série" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Quantidade"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponível">Disponível</SelectItem>
                          <SelectItem value="em uso">Em uso</SelectItem>
                          <SelectItem value="em manutenção">Em manutenção</SelectItem>
                          <SelectItem value="indisponível">Indisponível</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acquisition_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Aquisição</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Image upload section */}
            <div className="my-4">
              <FormLabel>Imagem do Equipamento</FormLabel>
              
              {imagePreview ? (
                <div className="mt-2 relative w-full h-[200px] border rounded-md overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 bg-[#ff3335] text-white rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed border-gray-400 rounded-md p-6 flex flex-col items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400 mb-4">
                    Arraste ou clique para selecionar uma imagem
                  </p>
                  <label htmlFor="image-upload">
                    <Button type="button" variant="secondary">
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Imagem
                    </Button>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                disabled={saveEquipment.isPending || isUploading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saveEquipment.isPending || isUploading}
              >
                {saveEquipment.isPending || isUploading ? (
                  "Salvando..."
                ) : equipment ? (
                  "Atualizar"
                ) : (
                  "Adicionar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentModal;
