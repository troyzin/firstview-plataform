
import React from "react";
import { X, Calendar, Clock, Users, FileText, MapPin, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

type Production = {
  id: string;
  name: string;
  client: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  briefingFile: string | null;
  teamMembers: TeamMember[];
  createdAt: Date;
};

type ProductionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (production: any) => void;
  onDelete?: (productionId: string) => void;
  editMode?: boolean;
  production?: Production;
};

const ProductionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  editMode = false,
  production
}: ProductionModalProps) => {
  const { hasAction } = useAuth();
  const canEdit = hasAction('edit_production');
  const canAdd = hasAction('add_production');
  const canCancel = hasAction('cancel_production');

  const [productionName, setProductionName] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("18:00");
  const [location, setLocation] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [briefingFile, setBriefingFile] = React.useState<File | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = React.useState("");
  const [newMemberRole, setNewMemberRole] = React.useState("filmmaker");

  const availableTeamMembers = [
    { id: "1", name: "Filipe Silva" },
    { id: "2", name: "Joao Gustavo" },
    { id: "3", name: "Arthur Leite" },
    { id: "4", name: "Matheus Worish" },
    { id: "5", name: "Felipe Vieira" },
    { id: "6", name: "Paulo Flecha" },
  ];

  const roleOptions = [
    { value: "coordenador", label: "Coordenador" },
    { value: "filmmaker", label: "Filmmaker" },
    { value: "fotografo", label: "Fotógrafo" },
    { value: "ajudante", label: "Ajudante" },
    { value: "storymaker", label: "Storymaker" },
  ];

  React.useEffect(() => {
    if (editMode && production) {
      setProductionName(production.name);
      setClientName(production.client);
      setDate(new Date(production.date));
      setStartTime(production.startTime);
      setEndTime(production.endTime);
      setLocation(production.location);
      setNotes(production.notes);
      setTeamMembers(production.teamMembers);
    } else {
      resetForm();
    }
  }, [editMode, production, isOpen]);

  const handleAddTeamMember = () => {
    if (selectedMember === "") return;
    
    const memberToAdd = availableTeamMembers.find(m => m.id === selectedMember);
    if (!memberToAdd) return;
    
    if (teamMembers.some(member => member.id === memberToAdd.id)) {
      toast.error("Este membro já foi adicionado à equipe");
      return;
    }
    
    const newMember = {
      id: memberToAdd.id,
      name: memberToAdd.name,
      role: newMemberRole,
    };
    
    setTeamMembers([...teamMembers, newMember]);
    setSelectedMember("");
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBriefingFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if ((editMode && !canEdit) || (!editMode && !canAdd)) {
      toast.error("Você não tem permissão para realizar esta ação");
      onClose();
      return;
    }

    const productionData = {
      id: editMode && production ? production.id : Date.now().toString(),
      name: productionName,
      client: clientName,
      date: date,
      startTime,
      endTime,
      location,
      notes,
      briefingFile: briefingFile ? briefingFile.name : production?.briefingFile || null,
      teamMembers,
      createdAt: editMode && production ? production.createdAt : new Date(),
    };
    
    onSave(productionData);
    toast.success(editMode ? "Produção atualizada com sucesso!" : "Produção criada com sucesso!");
    resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (!canCancel) {
      toast.error("Você não tem permissão para cancelar produções");
      return;
    }

    if (onDelete && production) {
      onDelete(production.id);
      toast.success("Produção cancelada com sucesso!");
      onClose();
    }
  };

  const resetForm = () => {
    setProductionName("");
    setClientName("");
    setDate(new Date());
    setStartTime("09:00");
    setEndTime("18:00");
    setLocation("");
    setNotes("");
    setBriefingFile(null);
    setTeamMembers([]);
    setSelectedMember("");
    setNewMemberRole("filmmaker");
  };

  const isFormDisabled = (editMode && !canEdit) || (!editMode && !canAdd);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#000000] border border-gray-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{editMode ? "Editar Produção" : "Nova Produção"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {editMode 
              ? "Edite as informações da produção."
              : "Preencha as informações para criar uma nova produção."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="productionName" className="block text-sm font-medium mb-1">
                Nome da Produção *
              </label>
              <Input
                id="productionName"
                value={productionName}
                onChange={(e) => setProductionName(e.target.value)}
                className="bg-[#141414] border-gray-700"
                placeholder="Nome da produção"
                required
                disabled={isFormDisabled}
              />
            </div>
            
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium mb-1">
                Nome do Cliente *
              </label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-[#141414] border-gray-700"
                placeholder="Nome do cliente"
                required
                disabled={isFormDisabled}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Data da Produção *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#141414] border-gray-700",
                      !date && "text-muted-foreground"
                    )}
                    disabled={isFormDisabled}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#141414] border-gray-700">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={isFormDisabled}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium mb-1">
                  Horário de Início *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-[#141414] border-gray-700 pl-10"
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium mb-1">
                  Horário de Término *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-[#141414] border-gray-700 pl-10"
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Local da Produção
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-[#141414] border-gray-700 pl-10"
                  placeholder="Endereço do local"
                  disabled={isFormDisabled}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="briefing" className="block text-sm font-medium mb-1">
                Anexar Briefing
              </label>
              <Input
                id="briefing"
                type="file"
                onChange={handleFileChange}
                className="bg-[#141414] border-gray-700"
                disabled={isFormDisabled}
              />
              {(briefingFile || (production && production.briefingFile)) && (
                <p className="text-xs mt-1 text-gray-400">
                  Arquivo: {briefingFile ? briefingFile.name : production?.briefingFile}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Adicionar Equipe
              </label>
              <div className="flex gap-2 mb-2">
                <Select value={selectedMember} onValueChange={setSelectedMember} disabled={isFormDisabled}>
                  <SelectTrigger className="bg-[#141414] border-gray-700">
                    <SelectValue placeholder="Selecionar membro" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-gray-700">
                    {availableTeamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newMemberRole} onValueChange={setNewMemberRole} disabled={isFormDisabled}>
                  <SelectTrigger className="w-[180px] bg-[#141414] border-gray-700">
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-gray-700">
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddTeamMember} size="icon" disabled={isFormDisabled}>
                  +
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto border border-gray-700 rounded-md p-2">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-2">
                    Nenhum membro adicionado
                  </p>
                ) : (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-[#141414] p-2 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-400">
                          {roleOptions.find((r) => r.value === member.role)?.label || member.role}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTeamMember(member.id)}
                        className="h-6 w-6"
                        disabled={isFormDisabled}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Anotações
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-[#141414] border-gray-700 min-h-[150px]"
                placeholder="Informações adicionais sobre a produção..."
                disabled={isFormDisabled}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            {editMode && onDelete && canCancel && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="bg-red-700 hover:bg-red-800"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar Produção
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <DialogClose asChild>
              <Button variant="outline" className="bg-[#141414] border-gray-700">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={handleSubmit}
              disabled={!productionName || !clientName || !date || !startTime || !endTime || isFormDisabled}
              className="bg-red-600 hover:bg-red-700"
            >
              Salvar Produção
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductionModal;
