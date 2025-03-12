
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export type EquipmentFormData = {
  id?: string;
  name: string;
  category?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  acquisition_date?: string | null;
  notes?: string;
  quantity?: number;
  status?: string;
  image_url?: string | null;
};

interface EquipmentFormProps {
  initialData?: EquipmentFormData;
  onSubmit: (data: EquipmentFormData, file?: File | null) => Promise<void>;
  isSubmitting: boolean;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<EquipmentFormData>(
    initialData || {
      name: "",
      category: "camera",
      brand: "",
      model: "",
      serial_number: "",
      acquisition_date: "",
      notes: "",
      quantity: 1,
      status: "disponível",
      image_url: null,
    }
  );

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(formData.image_url || null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData, file);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      toast.error("Ocorreu um erro ao salvar o equipamento");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Equipamento *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Canon EOS R5"
          required
          className="bg-gray-800 border-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="camera">Câmera</SelectItem>
              <SelectItem value="lens">Lente</SelectItem>
              <SelectItem value="stabilizer">Estabilizador</SelectItem>
              <SelectItem value="audio">Áudio</SelectItem>
              <SelectItem value="lighting">Iluminação</SelectItem>
              <SelectItem value="support">Suporte</SelectItem>
              <SelectItem value="accessory">Acessório</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="disponível">Disponível</SelectItem>
              <SelectItem value="em uso">Em Uso</SelectItem>
              <SelectItem value="manutenção">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            name="brand"
            value={formData.brand || ""}
            onChange={handleChange}
            placeholder="Ex: Canon"
            className="bg-gray-800 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            name="model"
            value={formData.model || ""}
            onChange={handleChange}
            placeholder="Ex: EOS R5"
            className="bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serial_number">Número de Série</Label>
          <Input
            id="serial_number"
            name="serial_number"
            value={formData.serial_number || ""}
            onChange={handleChange}
            placeholder="Ex: CR5-12345678"
            className="bg-gray-800 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity || 1}
            onChange={(e) => handleNumberChange("quantity", e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="acquisition_date">Data de Aquisição</Label>
        <Input
          id="acquisition_date"
          name="acquisition_date"
          type="date"
          value={formData.acquisition_date || ""}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Imagem do Equipamento</Label>
        <div className="flex flex-col items-center space-y-4">
          {preview && (
            <div className="w-full h-40 bg-gray-700 rounded-md overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          <label 
            htmlFor="image" 
            className="flex items-center justify-center w-full h-12 px-4 py-2 bg-gray-800 border border-gray-600 border-dashed rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span>{file ? file.name : "Selecionar imagem"}</span>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Detalhes adicionais sobre o equipamento..."
          className="bg-gray-800 border-gray-700 min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="bg-red-600 hover:bg-red-700 w-full mt-4"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Equipamento'
        )}
      </Button>
    </form>
  );
};

export default EquipmentForm;
