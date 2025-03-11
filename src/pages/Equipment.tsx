
import React, { useState } from "react";
import { Plus, Search, Filter, Package, Calendar, LogOut, CheckCircle, AlertTriangle, ShoppingCart } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { Textarea } from "../components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Checkbox } from "../components/ui/checkbox";

// Tipo de equipamento
type Equipment = {
  id: string;
  name: string;
  type: string;
  status: "available" | "in_use" | "maintenance";
  serialNumber: string;
  purchaseDate: Date;
  lastMaintenance?: Date;
  notes?: string;
  image?: string;
};

// Tipo de registro de uso
type UsageRecord = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  startDate: Date;
  endDate: Date;
  productionId?: string;
  productionName?: string;
  responsibleName: string;
  status: "scheduled" | "in_progress" | "returned" | "overdue";
  notes?: string;
};

// Dados de exemplo para equipamentos
const initialEquipments: Equipment[] = [
  {
    id: "e1",
    name: "Canon EOS R5",
    type: "camera",
    status: "available",
    serialNumber: "CR5-12345678",
    purchaseDate: new Date(2022, 5, 15),
    lastMaintenance: new Date(2023, 2, 10),
    notes: "Bateria extra na bolsa. Limpeza de sensor recente.",
    image: "https://www.cameralabs.com/wp-content/uploads/2020/07/canon-eos-r5-hero-1.jpg",
  },
  {
    id: "e2",
    name: "DJI Ronin 4D",
    type: "stabilizer",
    status: "in_use",
    serialNumber: "DJR4D-87654321",
    purchaseDate: new Date(2022, 8, 20),
    lastMaintenance: new Date(2023, 6, 5),
    notes: "Bateria dura aproximadamente 3 horas de uso contínuo.",
  },
  {
    id: "e3",
    name: "Sony Alpha a7S III",
    type: "camera",
    status: "maintenance",
    serialNumber: "SA7S3-23456789",
    purchaseDate: new Date(2021, 3, 10),
    lastMaintenance: new Date(2023, 5, 15),
    notes: "Em manutenção para resolução de problema no visor eletrônico.",
  },
  {
    id: "e4",
    name: "Tripé Manfrotto 055XPRO3",
    type: "support",
    status: "available",
    serialNumber: "MF055-34567890",
    purchaseDate: new Date(2021, 7, 25),
    notes: "Cabeça fluida incluída."
  },
  {
    id: "e5",
    name: "Kit Iluminação Aputure 300d",
    type: "lighting",
    status: "available",
    serialNumber: "AP300D-45678901",
    purchaseDate: new Date(2022, 1, 18),
    lastMaintenance: new Date(2023, 4, 12),
    notes: "Inclui softbox e grid."
  },
];

// Dados de exemplo para registros de uso
const initialUsageRecords: UsageRecord[] = [
  {
    id: "u1",
    equipmentId: "e2",
    equipmentName: "DJI Ronin 4D",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    productionId: "1",
    productionName: "Campanha de Marketing - Verão 2023",
    responsibleName: "Carlos Santos",
    status: "in_progress",
    notes: "Utilizar com cuidado em locais com areia."
  },
  {
    id: "u2",
    equipmentId: "e1",
    equipmentName: "Canon EOS R5",
    startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    productionId: "2",
    productionName: "Vídeo Institucional",
    responsibleName: "Pedro Alves",
    status: "scheduled",
    notes: "Reservar baterias extras."
  },
  {
    id: "u3",
    equipmentId: "e5",
    equipmentName: "Kit Iluminação Aputure 300d",
    startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    endDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    productionId: "3",
    productionName: "Ensaio Fotográfico Produto",
    responsibleName: "Roberto Dias",
    status: "returned",
    notes: "Devolvido em perfeito estado."
  }
];

// Dados de exemplo para produções
const productionOptions = [
  { id: "1", name: "Campanha de Marketing - Verão 2023" },
  { id: "2", name: "Vídeo Institucional" },
  { id: "3", name: "Ensaio Fotográfico Produto" },
  { id: "4", name: "Documentário Social" },
];

const Equipment = () => {
  // Estados
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>(initialUsageRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState("inventory");
  
  // Estados para modais
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  // Estados para formulário de novo equipamento
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: "",
    type: "camera",
    status: "available",
    serialNumber: "",
    purchaseDate: new Date(),
    notes: "",
  });
  
  // Estados para agendamento
  const [scheduleData, setScheduleData] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    productionId: "",
    responsibleName: "",
    notes: "",
    personalUse: false,
  });
  
  // Filtragem de equipamentos
  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch = searchTerm === "" || 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || equipment.status === statusFilter;
    const matchesType = typeFilter === "all" || equipment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Filtragem de registros
  const filteredRecords = usageRecords.filter((record) => {
    const matchesSearch = searchTerm === "" || 
      record.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.productionName && record.productionName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });
  
  // Manipuladores de eventos
  const handleAddEquipment = () => {
    const newItem: Equipment = {
      id: `e${equipments.length + 1}`,
      name: newEquipment.name || "",
      type: newEquipment.type || "camera",
      status: newEquipment.status || "available",
      serialNumber: newEquipment.serialNumber || "",
      purchaseDate: newEquipment.purchaseDate || new Date(),
      lastMaintenance: newEquipment.lastMaintenance,
      notes: newEquipment.notes,
    };
    
    setEquipments([...equipments, newItem]);
    setIsNewEquipmentModalOpen(false);
    setNewEquipment({
      name: "",
      type: "camera",
      status: "available",
      serialNumber: "",
      purchaseDate: new Date(),
      notes: "",
    });
  };
  
  const handleScheduleEquipment = () => {
    if (!selectedEquipment) return;
    
    const newRecord: UsageRecord = {
      id: `u${usageRecords.length + 1}`,
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      startDate: scheduleData.startDate,
      endDate: scheduleData.endDate,
      productionId: scheduleData.personalUse ? undefined : scheduleData.productionId,
      productionName: scheduleData.personalUse 
        ? undefined 
        : productionOptions.find(p => p.id === scheduleData.productionId)?.name,
      responsibleName: scheduleData.responsibleName,
      status: "scheduled",
      notes: scheduleData.notes,
    };
    
    setUsageRecords([...usageRecords, newRecord]);
    setIsScheduleModalOpen(false);
    resetScheduleForm();
  };
  
  const handleCheckoutEquipment = () => {
    if (!selectedEquipment) return;
    
    // Atualiza o status do equipamento
    const updatedEquipments = equipments.map(equipment => 
      equipment.id === selectedEquipment.id 
        ? { ...equipment, status: "in_use" as const } 
        : equipment
    );
    
    // Cria um novo registro de uso
    const newRecord: UsageRecord = {
      id: `u${usageRecords.length + 1}`,
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      startDate: new Date(),
      endDate: scheduleData.endDate,
      productionId: scheduleData.personalUse ? undefined : scheduleData.productionId,
      productionName: scheduleData.personalUse 
        ? undefined 
        : productionOptions.find(p => p.id === scheduleData.productionId)?.name,
      responsibleName: scheduleData.responsibleName,
      status: "in_progress",
      notes: scheduleData.notes,
    };
    
    setEquipments(updatedEquipments);
    setUsageRecords([...usageRecords, newRecord]);
    setIsCheckoutModalOpen(false);
    resetScheduleForm();
  };
  
  const resetScheduleForm = () => {
    setScheduleData({
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      productionId: "",
      responsibleName: "",
      notes: "",
      personalUse: false,
    });
    setSelectedEquipment(null);
  };
  
  const openScheduleModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsScheduleModalOpen(true);
  };
  
  const openCheckoutModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsCheckoutModalOpen(true);
  };
  
  // Função para renderizar o status com as cores corretas
  const renderStatus = (status: Equipment["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-600">Disponível</Badge>;
      case "in_use":
        return <Badge className="bg-blue-600">Em Uso</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-600">Manutenção</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };
  
  // Função para renderizar o status de registro com as cores corretas
  const renderRecordStatus = (status: UsageRecord["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-purple-600">Agendado</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600">Em Uso</Badge>;
      case "returned":
        return <Badge className="bg-green-600">Devolvido</Badge>;
      case "overdue":
        return <Badge className="bg-red-600">Atrasado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Equipamentos</h1>
            
            <div className="flex items-center bg-gray-800 rounded-md px-3 py-2">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <Input
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-60"
              />
            </div>
            
            <Button variant="outline" className="bg-gray-800 border-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsNewEquipmentModalOpen(true)} 
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Equipamento
          </Button>
        </div>
        
        <Tabs defaultValue="inventory" value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="schedule">Agendamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex space-x-4 mb-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="in_use">Em Uso</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="camera">Câmeras</SelectItem>
                  <SelectItem value="lens">Lentes</SelectItem>
                  <SelectItem value="stabilizer">Estabilizadores</SelectItem>
                  <SelectItem value="audio">Áudio</SelectItem>
                  <SelectItem value="lighting">Iluminação</SelectItem>
                  <SelectItem value="support">Suportes</SelectItem>
                  <SelectItem value="accessory">Acessórios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipments.length === 0 ? (
                <div className="col-span-full bg-gray-800 rounded-lg p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Nenhum equipamento encontrado</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {searchTerm ? 
                      `Não encontramos equipamentos com o termo "${searchTerm}"` : 
                      "Não há equipamentos que correspondam aos filtros selecionados"}
                  </p>
                  <Button 
                    onClick={() => setIsNewEquipmentModalOpen(true)} 
                    className="mt-4 bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Novo Equipamento
                  </Button>
                </div>
              ) : (
                filteredEquipments.map((equipment) => (
                  <div 
                    key={equipment.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all"
                  >
                    <div className="h-40 bg-gray-700 flex items-center justify-center">
                      {equipment.image ? (
                        <img 
                          src={equipment.image} 
                          alt={equipment.name} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{equipment.name}</h3>
                        {renderStatus(equipment.status)}
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">
                        <span className="font-medium">S/N: </span>
                        {equipment.serialNumber}
                      </p>
                      
                      <p className="text-sm text-gray-400 mb-4">
                        <span className="font-medium">Tipo: </span>
                        {(() => {
                          switch (equipment.type) {
                            case 'camera': return 'Câmera';
                            case 'lens': return 'Lente';
                            case 'stabilizer': return 'Estabilizador';
                            case 'audio': return 'Áudio';
                            case 'lighting': return 'Iluminação';
                            case 'support': return 'Suporte';
                            case 'accessory': return 'Acessório';
                            default: return equipment.type;
                          }
                        })()}
                      </p>
                      
                      <div className="flex space-x-2">
                        {equipment.status === "available" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => openScheduleModal(equipment)}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Agendar
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 bg-red-600 hover:bg-red-700"
                              onClick={() => openCheckoutModal(equipment)}
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              Retirar
                            </Button>
                          </>
                        )}
                        {equipment.status === "in_use" && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Devolver
                          </Button>
                        )}
                        {equipment.status === "maintenance" && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                            disabled
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Indisponível
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">Nenhum agendamento encontrado</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {searchTerm ? 
                    `Não encontramos agendamentos com o termo "${searchTerm}"` : 
                    "Não há agendamentos registrados no sistema"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div 
                    key={record.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{record.equipmentName}</h3>
                        {record.productionName ? (
                          <p className="text-gray-400">
                            <span className="text-gray-500">Produção:</span> {record.productionName}
                          </p>
                        ) : (
                          <p className="text-yellow-500 text-sm">Uso pessoal</p>
                        )}
                      </div>
                      <div>{renderRecordStatus(record.status)}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-400">
                          <span className="font-medium">Responsável: </span>
                          {record.responsibleName}
                        </p>
                        <p className="text-sm text-gray-400">
                          <span className="font-medium">Data Retirada: </span>
                          {format(new Date(record.startDate), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-sm text-gray-400">
                          <span className="font-medium">Data Devolução: </span>
                          {format(new Date(record.endDate), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      
                      {record.notes && (
                        <div>
                          <p className="text-sm text-gray-400">
                            <span className="font-medium">Observações: </span>
                            {record.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {record.status === "scheduled" && (
                      <div className="flex justify-end mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="mr-2"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Iniciar Uso
                        </Button>
                      </div>
                    )}
                    
                    {record.status === "in_progress" && (
                      <div className="flex justify-end mt-4">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Devolver
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal para adicionar novo equipamento */}
      <Dialog open={isNewEquipmentModalOpen} onOpenChange={setIsNewEquipmentModalOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Novo Equipamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Preencha as informações para adicionar um novo equipamento ao inventário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="equipmentName" className="block text-sm font-medium mb-1">
                Nome do Equipamento *
              </label>
              <Input
                id="equipmentName"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                className="bg-gray-800 border-gray-700"
                placeholder="Ex: Canon EOS R5"
                required
              />
            </div>
            
            <div>
              <label htmlFor="equipmentType" className="block text-sm font-medium mb-1">
                Tipo de Equipamento *
              </label>
              <Select 
                value={newEquipment.type} 
                onValueChange={(value) => setNewEquipment({...newEquipment, type: value})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione o tipo" />
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
            
            <div>
              <label htmlFor="serialNumber" className="block text-sm font-medium mb-1">
                Número de Série *
              </label>
              <Input
                id="serialNumber"
                value={newEquipment.serialNumber}
                onChange={(e) => setNewEquipment({...newEquipment, serialNumber: e.target.value})}
                className="bg-gray-800 border-gray-700"
                placeholder="Ex: CR5-12345678"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Data de Aquisição *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                      !newEquipment.purchaseDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newEquipment.purchaseDate 
                      ? format(new Date(newEquipment.purchaseDate), "dd/MM/yyyy", { locale: ptBR }) 
                      : <span>Escolha uma data</span>
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <CalendarComponent
                    mode="single"
                    selected={newEquipment.purchaseDate}
                    onSelect={(date) => setNewEquipment({...newEquipment, purchaseDate: date})}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Observações
              </label>
              <Textarea
                id="notes"
                value={newEquipment.notes}
                onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                className="bg-gray-800 border-gray-700 min-h-[100px]"
                placeholder="Detalhes adicionais sobre o equipamento..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-700">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={handleAddEquipment}
              disabled={!newEquipment.name || !newEquipment.serialNumber}
              className="bg-red-600 hover:bg-red-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar ao Inventário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para agendar equipamento */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Agendar Equipamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedEquipment?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data de Início *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                        !scheduleData.startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduleData.startDate 
                        ? format(scheduleData.startDate, "dd/MM/yyyy", { locale: ptBR }) 
                        : <span>Escolha uma data</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <CalendarComponent
                      mode="single"
                      selected={scheduleData.startDate}
                      onSelect={(date) => date && setScheduleData({...scheduleData, startDate: date})}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data de Término *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                        !scheduleData.endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduleData.endDate 
                        ? format(scheduleData.endDate, "dd/MM/yyyy", { locale: ptBR }) 
                        : <span>Escolha uma data</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <CalendarComponent
                      mode="single"
                      selected={scheduleData.endDate}
                      onSelect={(date) => date && setScheduleData({...scheduleData, endDate: date})}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 my-4">
              <Checkbox
                id="personalUse"
                checked={scheduleData.personalUse}
                onCheckedChange={(checked) => 
                  setScheduleData({...scheduleData, personalUse: checked === true})
                }
              />
              <label
                htmlFor="personalUse"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Retirar por minha conta e risco (Uso pessoal)
              </label>
            </div>
            
            {!scheduleData.personalUse && (
              <div>
                <label htmlFor="production" className="block text-sm font-medium mb-1">
                  Produção *
                </label>
                <Select 
                  value={scheduleData.productionId} 
                  onValueChange={(value) => setScheduleData({...scheduleData, productionId: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Selecione a produção" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {productionOptions.map((production) => (
                      <SelectItem key={production.id} value={production.id}>
                        {production.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label htmlFor="responsibleName" className="block text-sm font-medium mb-1">
                Responsável *
              </label>
              <Input
                id="responsibleName"
                value={scheduleData.responsibleName}
                onChange={(e) => setScheduleData({...scheduleData, responsibleName: e.target.value})}
                className="bg-gray-800 border-gray-700"
                placeholder="Nome do responsável"
                required
              />
            </div>
            
            <div>
              <label htmlFor="scheduleNotes" className="block text-sm font-medium mb-1">
                Observações
              </label>
              <Textarea
                id="scheduleNotes"
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                className="bg-gray-800 border-gray-700"
                placeholder="Informações adicionais sobre o agendamento..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-700">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={handleScheduleEquipment}
              disabled={
                !scheduleData.responsibleName || 
                (!scheduleData.personalUse && !scheduleData.productionId)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para retirar equipamento */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Retirar Equipamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedEquipment?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Data de Devolução Prevista *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                      !scheduleData.endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {scheduleData.endDate 
                      ? format(scheduleData.endDate, "dd/MM/yyyy", { locale: ptBR }) 
                      : <span>Escolha uma data</span>
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <CalendarComponent
                    mode="single"
                    selected={scheduleData.endDate}
                    onSelect={(date) => date && setScheduleData({...scheduleData, endDate: date})}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center space-x-2 my-4">
              <Checkbox
                id="personalUseCheckout"
                checked={scheduleData.personalUse}
                onCheckedChange={(checked) => 
                  setScheduleData({...scheduleData, personalUse: checked === true})
                }
              />
              <label
                htmlFor="personalUseCheckout"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Retirar por minha conta e risco (Uso pessoal)
              </label>
            </div>
            
            {!scheduleData.personalUse && (
              <div>
                <label htmlFor="productionCheckout" className="block text-sm font-medium mb-1">
                  Produção *
                </label>
                <Select 
                  value={scheduleData.productionId} 
                  onValueChange={(value) => setScheduleData({...scheduleData, productionId: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Selecione a produção" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {productionOptions.map((production) => (
                      <SelectItem key={production.id} value={production.id}>
                        {production.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label htmlFor="responsibleNameCheckout" className="block text-sm font-medium mb-1">
                Responsável *
              </label>
              <Input
                id="responsibleNameCheckout"
                value={scheduleData.responsibleName}
                onChange={(e) => setScheduleData({...scheduleData, responsibleName: e.target.value})}
                className="bg-gray-800 border-gray-700"
                placeholder="Nome do responsável"
                required
              />
            </div>
            
            <div>
              <label htmlFor="checkoutNotes" className="block text-sm font-medium mb-1">
                Observações
              </label>
              <Textarea
                id="checkoutNotes"
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                className="bg-gray-800 border-gray-700"
                placeholder="Informações adicionais sobre a retirada..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-700">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={handleCheckoutEquipment}
              disabled={
                !scheduleData.responsibleName || 
                (!scheduleData.personalUse && !scheduleData.productionId)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Retirar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Equipment;
