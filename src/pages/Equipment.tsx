
import React, { useState } from "react";
import { Plus, Search, Filter, Package, Calendar, LogOut, CheckCircle, AlertTriangle, ShoppingCart, History, Clock, Users } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

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
  quantity?: number;
  quantityInUse?: number;
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
  returnedDate?: Date;
};

// Tipo para histórico de eventos
type HistoryEvent = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  eventType: "checkout" | "return" | "schedule" | "maintenance";
  date: Date;
  responsibleName: string;
  productionName?: string;
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
    quantity: 3,
    quantityInUse: 0,
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
    quantity: 2,
    quantityInUse: 1,
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
    quantity: 1,
    quantityInUse: 0,
  },
  {
    id: "e4",
    name: "Tripé Manfrotto 055XPRO3",
    type: "support",
    status: "available",
    serialNumber: "MF055-34567890",
    purchaseDate: new Date(2021, 7, 25),
    notes: "Cabeça fluida incluída.",
    quantity: 5,
    quantityInUse: 0,
  },
  {
    id: "e5",
    name: "Kit Iluminação Aputure 300d",
    type: "lighting",
    status: "available",
    serialNumber: "AP300D-45678901",
    purchaseDate: new Date(2022, 1, 18),
    lastMaintenance: new Date(2023, 4, 12),
    notes: "Inclui softbox e grid.",
    quantity: 4,
    quantityInUse: 2,
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
    responsibleName: "João Silva",
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
    responsibleName: "João Silva",
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
    responsibleName: "João Silva",
    status: "returned",
    notes: "Devolvido em perfeito estado.",
    returnedDate: new Date(new Date().setDate(new Date().getDate() - 2))
  }
];

// Dados de exemplo para histórico
const initialHistoryEvents: HistoryEvent[] = [
  {
    id: "h1",
    equipmentId: "e2",
    equipmentName: "DJI Ronin 4D",
    eventType: "checkout",
    date: new Date(),
    responsibleName: "João Silva",
    productionName: "Campanha de Marketing - Verão 2023",
    notes: "Retirada para uso externo"
  },
  {
    id: "h2",
    equipmentId: "e1",
    equipmentName: "Canon EOS R5",
    eventType: "schedule",
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    responsibleName: "João Silva",
    productionName: "Vídeo Institucional"
  },
  {
    id: "h3",
    equipmentId: "e5",
    equipmentName: "Kit Iluminação Aputure 300d",
    eventType: "return",
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    responsibleName: "João Silva",
    productionName: "Ensaio Fotográfico Produto",
    notes: "Devolvido em perfeito estado"
  },
  {
    id: "h4",
    equipmentId: "e3",
    equipmentName: "Sony Alpha a7S III",
    eventType: "maintenance",
    date: new Date(new Date().setDate(new Date().getDate() - 7)),
    responsibleName: "Técnico Externo",
    notes: "Enviado para reparo do visor eletrônico"
  }
];

// Dados de exemplo para produções
const productionOptions = [
  { id: "1", name: "Campanha de Marketing - Verão 2023", date: new Date(2023, 11, 15) },
  { id: "2", name: "Vídeo Institucional", date: new Date(2023, 10, 5) },
  { id: "3", name: "Ensaio Fotográfico Produto", date: new Date(2023, 9, 20) },
  { id: "4", name: "Documentário Social", date: new Date(2023, 8, 10) },
];

const Equipment = () => {
  // Estados
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>(initialUsageRecords);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>(initialHistoryEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState("inventory");
  
  // Estados para modais
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isKitCheckoutModalOpen, setIsKitCheckoutModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  // Estado para o kit de equipamentos
  const [kitEquipments, setKitEquipments] = useState<{id: string; quantity: number}[]>([]);
  
  // Estados para formulário de novo equipamento
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: "",
    type: "camera",
    status: "available",
    serialNumber: "",
    purchaseDate: new Date(),
    notes: "",
    quantity: 1,
    quantityInUse: 0,
  });
  
  // Estados para agendamento
  const [scheduleData, setScheduleData] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    productionId: "",
    responsibleName: "João Silva", // Nome do usuário logado
    notes: "",
    personalUse: false,
  });
  
  // Estatísticas de equipamentos
  const equipmentStats = {
    total: equipments.reduce((acc, equipment) => acc + (equipment.quantity || 0), 0),
    available: equipments.reduce((acc, equipment) => acc + ((equipment.quantity || 0) - (equipment.quantityInUse || 0)), 0),
    inUse: equipments.reduce((acc, equipment) => acc + (equipment.quantityInUse || 0), 0),
    maintenance: equipments.filter(e => e.status === "maintenance").reduce((acc, equipment) => acc + (equipment.quantity || 0), 0),
  };
  
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
  
  // Filtragem de eventos de histórico
  const filteredHistoryEvents = historyEvents.filter((event) => {
    const matchesSearch = searchTerm === "" || 
      event.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.productionName && event.productionName.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
      quantity: newEquipment.quantity || 1,
      quantityInUse: 0,
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
      quantity: 1,
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
    
    // Adiciona um evento no histórico
    const newHistoryEvent: HistoryEvent = {
      id: `h${historyEvents.length + 1}`,
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      eventType: "schedule",
      date: new Date(),
      responsibleName: scheduleData.responsibleName,
      productionName: productionOptions.find(p => p.id === scheduleData.productionId)?.name,
      notes: scheduleData.notes,
    };
    
    setUsageRecords([...usageRecords, newRecord]);
    setHistoryEvents([...historyEvents, newHistoryEvent]);
    setIsScheduleModalOpen(false);
    resetScheduleForm();
  };
  
  const handleCheckoutEquipment = () => {
    if (!selectedEquipment) return;
    
    // Atualiza o status do equipamento
    const updatedEquipments = equipments.map(equipment => 
      equipment.id === selectedEquipment.id 
        ? { 
            ...equipment, 
            status: "in_use" as const,
            quantityInUse: (equipment.quantityInUse || 0) + 1 
          } 
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
    
    // Adiciona um evento no histórico
    const newHistoryEvent: HistoryEvent = {
      id: `h${historyEvents.length + 1}`,
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      eventType: "checkout",
      date: new Date(),
      responsibleName: scheduleData.responsibleName,
      productionName: productionOptions.find(p => p.id === scheduleData.productionId)?.name,
      notes: scheduleData.notes,
    };
    
    setEquipments(updatedEquipments);
    setUsageRecords([...usageRecords, newRecord]);
    setHistoryEvents([...historyEvents, newHistoryEvent]);
    setIsCheckoutModalOpen(false);
    resetScheduleForm();
  };
  
  const handleKitCheckout = () => {
    if (kitEquipments.length === 0) return;
    
    // Para cada equipamento no kit, criamos um registro e atualizamos o status
    const updatedEquipments = [...equipments];
    const newRecords: UsageRecord[] = [];
    const newHistoryEvents: HistoryEvent[] = [];
    
    kitEquipments.forEach(item => {
      const equipment = equipments.find(e => e.id === item.id);
      if (!equipment) return;
      
      // Atualiza o status do equipamento
      const equipmentIndex = updatedEquipments.findIndex(e => e.id === item.id);
      updatedEquipments[equipmentIndex] = {
        ...updatedEquipments[equipmentIndex],
        status: "in_use" as const,
        quantityInUse: (updatedEquipments[equipmentIndex].quantityInUse || 0) + item.quantity
      };
      
      // Cria um novo registro de uso
      const newRecord: UsageRecord = {
        id: `u${usageRecords.length + newRecords.length + 1}`,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        startDate: new Date(),
        endDate: scheduleData.endDate,
        productionId: scheduleData.personalUse ? undefined : scheduleData.productionId,
        productionName: scheduleData.personalUse 
          ? undefined 
          : productionOptions.find(p => p.id === scheduleData.productionId)?.name,
        responsibleName: scheduleData.responsibleName,
        status: "in_progress",
        notes: `Retirada em kit. ${scheduleData.notes}`,
      };
      
      // Adiciona um evento no histórico
      const newHistoryEvent: HistoryEvent = {
        id: `h${historyEvents.length + newHistoryEvents.length + 1}`,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        eventType: "checkout",
        date: new Date(),
        responsibleName: scheduleData.responsibleName,
        productionName: productionOptions.find(p => p.id === scheduleData.productionId)?.name,
        notes: `Retirada em kit. ${scheduleData.notes}`,
      };
      
      newRecords.push(newRecord);
      newHistoryEvents.push(newHistoryEvent);
    });
    
    setEquipments(updatedEquipments);
    setUsageRecords([...usageRecords, ...newRecords]);
    setHistoryEvents([...historyEvents, ...newHistoryEvents]);
    setIsKitCheckoutModalOpen(false);
    setKitEquipments([]);
    resetScheduleForm();
  };

  const handleReturnEquipment = (recordId: string) => {
    const record = usageRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // Atualiza o status do registro
    const updatedRecords = usageRecords.map(r => 
      r.id === recordId 
        ? { ...r, status: "returned" as const, returnedDate: new Date() } 
        : r
    );
    
    // Atualiza o status do equipamento
    const updatedEquipments = equipments.map(equipment => 
      equipment.id === record.equipmentId 
        ? { 
            ...equipment, 
            quantityInUse: Math.max(0, (equipment.quantityInUse || 0) - 1),
            status: ((equipment.quantityInUse || 0) - 1) <= 0 ? "available" as const : equipment.status
          } 
        : equipment
    );
    
    // Adiciona um evento no histórico
    const newHistoryEvent: HistoryEvent = {
      id: `h${historyEvents.length + 1}`,
      equipmentId: record.equipmentId,
      equipmentName: record.equipmentName,
      eventType: "return",
      date: new Date(),
      responsibleName: record.responsibleName,
      productionName: record.productionName,
      notes: "Equipamento devolvido",
    };
    
    setUsageRecords(updatedRecords);
    setEquipments(updatedEquipments);
    setHistoryEvents([...historyEvents, newHistoryEvent]);
  };
  
  const handleStartUseScheduled = (recordId: string) => {
    const record = usageRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // Atualiza o status do registro
    const updatedRecords = usageRecords.map(r => 
      r.id === recordId 
        ? { ...r, status: "in_progress" as const, startDate: new Date() } 
        : r
    );
    
    // Atualiza o status do equipamento
    const updatedEquipments = equipments.map(equipment => 
      equipment.id === record.equipmentId 
        ? { 
            ...equipment, 
            status: "in_use" as const,
            quantityInUse: (equipment.quantityInUse || 0) + 1 
          } 
        : equipment
    );
    
    setUsageRecords(updatedRecords);
    setEquipments(updatedEquipments);
  };
  
  const resetScheduleForm = () => {
    setScheduleData({
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      productionId: "",
      responsibleName: "João Silva", // Nome do usuário logado
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
  
  const addToKit = (equipment: Equipment) => {
    const existing = kitEquipments.find(item => item.id === equipment.id);
    if (existing) {
      // Atualiza a quantidade se já estiver no kit
      setKitEquipments(
        kitEquipments.map(item => 
          item.id === equipment.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      );
    } else {
      // Adiciona ao kit se for novo
      setKitEquipments([...kitEquipments, { id: equipment.id, quantity: 1 }]);
    }
  };
  
  const removeFromKit = (equipmentId: string) => {
    setKitEquipments(kitEquipments.filter(item => item.id !== equipmentId));
  };
  
  const updateKitItemQuantity = (equipmentId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromKit(equipmentId);
      return;
    }
    
    setKitEquipments(
      kitEquipments.map(item => 
        item.id === equipmentId 
          ? { ...item, quantity } 
          : item
      )
    );
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
  
  // Função para renderizar o tipo do evento do histórico
  const renderEventType = (eventType: HistoryEvent["eventType"]) => {
    switch (eventType) {
      case "checkout":
        return <Badge className="bg-blue-600">Retirada</Badge>;
      case "return":
        return <Badge className="bg-green-600">Devolução</Badge>;
      case "schedule":
        return <Badge className="bg-purple-600">Agendamento</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-600">Manutenção</Badge>;
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
          
          <div className="flex space-x-3">
            <Button 
              onClick={() => setIsKitCheckoutModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Retirar KIT
            </Button>
            <Button 
              onClick={() => setIsNewEquipmentModalOpen(true)} 
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Equipamento
            </Button>
          </div>
        </div>
        
        {/* Dashboard de Status */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Equipamentos</p>
              <p className="text-2xl font-bold">{equipmentStats.total}</p>
            </div>
            <Package className="h-8 w-8 text-gray-500" />
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Disponíveis</p>
              <p className="text-2xl font-bold text-green-500">{equipmentStats.available}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Em Uso</p>
              <p className="text-2xl font-bold text-blue-500">{equipmentStats.inUse}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Em Manutenção</p>
              <p className="text-2xl font-bold text-yellow-500">{equipmentStats.maintenance}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        {/* Lista de equipamentos em uso e disponíveis */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Status de Disponibilidade</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Tabela de equipamentos em uso */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-md font-medium mb-2 text-blue-400">Equipamentos em Uso</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipments
                    .filter(e => (e.quantityInUse || 0) > 0)
                    .map(equipment => (
                      <TableRow key={`in-use-${equipment.id}`}>
                        <TableCell>{equipment.name}</TableCell>
                        <TableCell className="text-right">{equipment.quantityInUse}</TableCell>
                      </TableRow>
                    ))}
                  {equipments.filter(e => (e.quantityInUse || 0) > 0).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-gray-500">
                        Nenhum equipamento em uso
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Tabela de equipamentos disponíveis */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-md font-medium mb-2 text-green-400">Equipamentos Disponíveis</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipments
                    .filter(e => ((e.quantity || 0) - (e.quantityInUse || 0)) > 0)
                    .map(equipment => (
                      <TableRow key={`available-${equipment.id}`}>
                        <TableCell>{equipment.name}</TableCell>
                        <TableCell className="text-right">{(equipment.quantity || 0) - (equipment.quantityInUse || 0)}</TableCell>
                      </TableRow>
                    ))}
                  {equipments.filter(e => ((e.quantity || 0) - (e.quantityInUse || 0)) > 0).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-gray-500">
                        Nenhum equipamento disponível
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="inventory" value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="schedule">Agendamentos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
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
                      
                      {/* Exibindo quantidade do item */}
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-400">
                          <span className="font-medium">Quantidade: </span>
                          {equipment.quantity || 0}
                        </span>
                        <span className="text-gray-400">
                          <span className="font-medium">Em uso: </span>
                          {equipment.quantityInUse || 0}
                        </span>
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
                        {equipment.status === "available" && ((equipment.quantity || 0) - (equipment.quantityInUse || 0)) > 0 && (
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
                        {equipment.status === "available" && ((equipment.quantity || 0) - (equipment.quantityInUse || 0)) > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => addToKit(equipment)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Kit
                          </Button>
                        )}
                        {equipment.status === "in_use" && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              // Encontrar o registro mais recente deste equipamento que está em uso
                              const record = usageRecords
                                .filter(r => r.equipmentId === equipment.id && r.status === "in_progress")
                                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
                              
                              if (record) {
                                handleReturnEquipment(record.id);
                              }
                            }}
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
                        
                        {/* Modificando a exibição da data de devolução conforme solicitado */}
                        {record.status === "returned" ? (
                          <>
                            <p className="text-sm text-gray-400">
                              <span className="font-medium">Data Prevista: </span>
                              {format(new Date(record.endDate), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-sm text-green-400">
                              <span className="font-medium">Devolvido em: </span>
                              {record.returnedDate && format(new Date(record.returnedDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">
                            <span className="font-medium">Data Prevista: </span>
                            {format(new Date(record.endDate), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
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
                          onClick={() => handleStartUseScheduled(record.id)}
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
                          onClick={() => handleReturnEquipment(record.id)}
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
          
          <TabsContent value="history" className="space-y-4">
            {filteredHistoryEvents.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <History className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">Nenhum registro no histórico</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {searchTerm ? 
                    `Não encontramos eventos com o termo "${searchTerm}"` : 
                    "Não há eventos registrados no histórico do sistema"}
                </p>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Produção</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistoryEvents
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(event.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell>{event.equipmentName}</TableCell>
                          <TableCell>{renderEventType(event.eventType)}</TableCell>
                          <TableCell>{event.responsibleName}</TableCell>
                          <TableCell>{event.productionName || "-"}</TableCell>
                          <TableCell>{event.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
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
              <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                Quantidade *
              </label>
              <Input
                id="quantity"
                type="number"
                value={newEquipment.quantity?.toString() || "1"}
                onChange={(e) => setNewEquipment({...newEquipment, quantity: parseInt(e.target.value) || 1})}
                className="bg-gray-800 border-gray-700"
                min="1"
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
                    {productionOptions
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((production) => (
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
                Responsável
              </label>
              <Input
                id="responsibleName"
                value={scheduleData.responsibleName}
                readOnly
                className="bg-gray-700 border-gray-700 cursor-not-allowed"
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
              disabled={!scheduleData.personalUse && !scheduleData.productionId}
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
                    {productionOptions
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((production) => (
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
                Responsável
              </label>
              <Input
                id="responsibleNameCheckout"
                value={scheduleData.responsibleName}
                readOnly
                className="bg-gray-700 border-gray-700 cursor-not-allowed"
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
              disabled={!scheduleData.personalUse && !scheduleData.productionId}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Retirar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para Retirar KIT */}
      <Dialog open={isKitCheckoutModalOpen} onOpenChange={setIsKitCheckoutModalOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Retirar KIT de Equipamentos</DialogTitle>
            <DialogDescription className="text-gray-400">
              Selecione os equipamentos para montar o kit
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Equipamentos no KIT</h3>
              {kitEquipments.length === 0 ? (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-400">Nenhum equipamento adicionado ao KIT</p>
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kitEquipments.map(item => {
                        const equipment = equipments.find(e => e.id === item.id);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{equipment?.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => updateKitItemQuantity(item.id, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span>{item.quantity}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => updateKitItemQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => removeFromKit(item.id)}
                              >
                                ×
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Selecionar Equipamentos</h3>
              <div className="h-40 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg p-2">
                {equipments
                  .filter(e => e.status !== "maintenance" && ((e.quantity || 0) - (e.quantityInUse || 0)) > 0)
                  .map(equipment => (
                    <div 
                      key={equipment.id} 
                      className="flex justify-between items-center p-2 hover:bg-gray-700 rounded-md cursor-pointer"
                      onClick={() => addToKit(equipment)}
                    >
                      <div>
                        <span>{equipment.name}</span>
                        <div className="text-sm text-gray-400">
                          Disponíveis: {((equipment.quantity || 0) - (equipment.quantityInUse || 0))}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToKit(equipment);
                        }}
                      >
                        +
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
            
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
                id="personalUseKit"
                checked={scheduleData.personalUse}
                onCheckedChange={(checked) => 
                  setScheduleData({...scheduleData, personalUse: checked === true})
                }
              />
              <label
                htmlFor="personalUseKit"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Retirar por minha conta e risco (Uso pessoal)
              </label>
            </div>
            
            {!scheduleData.personalUse && (
              <div>
                <label htmlFor="productionKit" className="block text-sm font-medium mb-1">
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
                    {productionOptions
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((production) => (
                        <SelectItem key={production.id} value={production.id}>
                          {production.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label htmlFor="responsibleNameKit" className="block text-sm font-medium mb-1">
                Responsável
              </label>
              <Input
                id="responsibleNameKit"
                value={scheduleData.responsibleName}
                readOnly
                className="bg-gray-700 border-gray-700 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="kitNotes" className="block text-sm font-medium mb-1">
                Observações
              </label>
              <Textarea
                id="kitNotes"
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                className="bg-gray-800 border-gray-700"
                placeholder="Informações adicionais sobre o KIT..."
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
              onClick={handleKitCheckout}
              disabled={kitEquipments.length === 0 || (!scheduleData.personalUse && !scheduleData.productionId)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Retirar KIT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Equipment;
