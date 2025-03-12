
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
import { Loader2 } from "lucide-react";
import { Equipment } from "@/types/equipment";

export type EquipmentFormData = Omit<Equipment, 'id'> & { id?: string };

interface EquipmentFormProps {
  initialData?: EquipmentFormData;
  onSubmit: (data: EquipmentFormData) => Promise<void>;
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
      status: "disponível",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
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
          className="bg-[#141414] border-[#141414]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger className="bg-[#141414] border-[#141414]">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-[#141414]">
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
            <SelectTrigger className="bg-[#141414] border-[#141414]">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-[#141414]">
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
            className="bg-[#141414] border-[#141414]"
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
            className="bg-[#141414] border-[#141414]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serial_number">Número de Série</Label>
        <Input
          id="serial_number"
          name="serial_number"
          value={formData.serial_number || ""}
          onChange={handleChange}
          placeholder="Ex: CR5-12345678"
          className="bg-[#141414] border-[#141414]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="acquisition_date">Data de Aquisição</Label>
        <Input
          id="acquisition_date"
          name="acquisition_date"
          type="date"
          value={formData.acquisition_date || ""}
          onChange={handleChange}
          className="bg-[#141414] border-[#141414]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Detalhes adicionais sobre o equipamento..."
          className="bg-[#141414] border-[#141414] min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="bg-[#ff3335] hover:bg-red-700 w-full mt-4"
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
