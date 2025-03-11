
import React from "react";
import { X, Calendar, Clock, Users, Clipboard, MapPin } from "lucide-react";
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

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

type ProductionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (production: any) => void;
};

const ProductionModal = ({ isOpen, onClose, onSave }: ProductionModalProps) => {
  const [productionName, setProductionName] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("18:00");
  const [location, setLocation] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [briefingFile, setBriefingFile] = React.useState<File | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = React.useState("");
  const [newMemberRole, setNewMemberRole] = React.useState("filmmaker");

  const roleOptions = [
    { value: "coordenador", label: "Coordenador" },
    { value: "filmmaker", label: "Filmmaker" },
    { value: "fotografo", label: "Fotógrafo" },
    { value: "ajudante", label: "Ajudante" },
    { value: "storymaker", label: "Storymaker" },
  ];

  const handleAddTeamMember = () => {
    if (newMemberName.trim() === "") return;
    
    const newMember = {
      id: Date.now().toString(),
      name: newMemberName,
      role: newMemberRole,
    };
    
    setTeamMembers([...teamMembers, newMember]);
    setNewMemberName("");
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
    const production = {
      id: Date.now().toString(),
      name: productionName,
      client: clientName,
      date: date,
      startTime,
      endTime,
      location,
      notes,
      briefingFile: briefingFile ? briefingFile.name : null,
      teamMembers,
      createdAt: new Date(),
    };
    
    onSave(production);
    resetForm();
    onClose();
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
    setNewMemberName("");
    setNewMemberRole("filmmaker");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova Produção</DialogTitle>
          <DialogDescription className="text-gray-400">
            Preencha as informações para criar uma nova produção.
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
                className="bg-gray-800 border-gray-700"
                placeholder="Nome da produção"
                required
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
                className="bg-gray-800 border-gray-700"
                placeholder="Nome do cliente"
                required
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
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
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
                    className="bg-gray-800 border-gray-700 pl-10"
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
                    className="bg-gray-800 border-gray-700 pl-10"
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
                  className="bg-gray-800 border-gray-700 pl-10"
                  placeholder="Endereço do local"
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
                className="bg-gray-800 border-gray-700"
              />
              {briefingFile && (
                <p className="text-xs mt-1 text-gray-400">
                  Arquivo: {briefingFile.name}
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
                <Input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Nome do membro"
                />
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddTeamMember} size="icon">
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
                      className="flex items-center justify-between bg-gray-800 p-2 rounded-md"
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
                className="bg-gray-800 border-gray-700 min-h-[150px]"
                placeholder="Informações adicionais sobre a produção..."
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="bg-gray-800 border-gray-700">
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit}
            disabled={!productionName || !clientName || !date || !startTime || !endTime}
            className="bg-red-600 hover:bg-red-700"
          >
            Salvar Produção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductionModal;
