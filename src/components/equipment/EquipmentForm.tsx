
import React, { useState, useRef } from "react";
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
import { Loader2, Upload, Crop } from "lucide-react";
import { toast } from "sonner";
import ReactCrop, { Crop as CropArea, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export type EquipmentFormData = {
  id?: string;
  name: string;
  category?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  acquisition_date?: string | null;
  notes?: string;
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
      status: "disponível",
      image_url: null,
    }
  );

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(formData.image_url || null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [crop, setCrop] = useState<CropArea>();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect: number) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgSrc = event.target?.result as string;
        setImageSrc(imgSrc);
        setIsCropping(true);
        
        // Initialize the crop area when image loads
        const image = new Image();
        image.src = imgSrc;
        image.onload = () => {
          const aspect = 1; // Square crop
          setCrop(centerAspectCrop(image.width, image.height, aspect));
        };
      };
      reader.readAsDataURL(selectedFile);
      setFile(selectedFile);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: CropArea): Promise<File> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width!;
    canvas.height = crop.height!;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No 2d context');
    }
    
    ctx.drawImage(
      image,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width!,
      crop.height!
    );
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        
        // Create a new file from the blob
        const croppedFile = new File([blob], file?.name || 'cropped-image.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(croppedFile);
        
        resolve(croppedFile);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !crop || !crop.width || !crop.height) {
      toast.error("Please select a crop area");
      return;
    }
    
    try {
      const croppedFile = await getCroppedImg(imgRef.current, crop);
      setFile(croppedFile);
      setIsCropping(false);
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error("Erro ao cortar a imagem");
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setFile(null);
    setImageSrc(null);
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
        <Label htmlFor="image">Imagem do Equipamento</Label>
        <div className="flex flex-col items-center space-y-4">
          {isCropping && imageSrc ? (
            <div className="w-full space-y-4">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={1}
                className="bg-[#141414] rounded-md overflow-hidden"
              >
                <img 
                  ref={imgRef} 
                  src={imageSrc} 
                  alt="Preview for crop" 
                  className="max-w-full h-auto"
                />
              </ReactCrop>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelCrop}
                  className="bg-[#141414] border-[#141414]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleCropComplete}
                  className="bg-[#ff3335] hover:bg-red-700"
                >
                  <Crop className="h-4 w-4 mr-2" />
                  Cortar Imagem
                </Button>
              </div>
            </div>
          ) : (
            <>
              {preview && (
                <div className="w-full h-40 bg-[#141414] rounded-md overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <label 
                htmlFor="image" 
                className="flex items-center justify-center w-full h-12 px-4 py-2 bg-[#141414] border border-[#141414] border-dashed rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
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
            </>
          )}
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
          className="bg-[#141414] border-[#141414] min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || isCropping} 
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
