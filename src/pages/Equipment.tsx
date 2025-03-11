import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Package, Calendar, LogOut, CheckCircle, AlertTriangle, ShoppingCart, History, Clock, Users, Edit, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EquipmentModal from "@/components/equipment/EquipmentModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Tipo de equipamento
type Equipment = {
  id: string;
  name: string;
  category: string;
  status: string;
  serial_number?: string;
  acquisition_date?: string;
  notes?: string;
  image_url?: string;
  quantity: number;
  brand?: string;
  model?: string;
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

// Dados de exemplo para produções
const productionOptions = [
  { id: "1", name: "Campanha de Marketing - Verão 2023", date: new Date(2023, 11, 15) },
  { id: "2", name: "Vídeo Institucional", date: new Date(2023, 10, 5) },
  { id: "3", name: "Ensaio Fotográfico Produto", date: new Date(2023, 9, 20) },
  { id: "4", name: "Documentário Social", date: new Date(2023, 8, 10) },
];

// Função para buscar equipamentos do Supabase
const fetchEquipments = async (): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .order("name");

  if (error) {
    console.error("Erro ao buscar equipamentos:", error);
    throw new Error(error.message);
  }

  return data || [];
};

const Equipment = () => {
  const queryClient = useQueryClient();
  
  // Consulta para buscar equipamentos
  const { data: equipments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["equipments"],
    queryFn: fetchEquipments,
  });

  // Estados
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState("inventory");
  
  // Estados para modais
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isKitCheckoutModalOpen, setIsKitCheckoutModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
  
  // Estado para o kit de equipamentos
  const [kitEquipments, setKitEquipments] = useState<{id: string; quantity: number}[]>([]);
  
  // Estados para agendamento
  const [scheduleData, setScheduleData] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    productionId: "",
    responsibleName: "João Silva", // Nome do usuário logado
    notes: "",
    personalUse: false,
  });
  
  // Efeito para adicionar UsageRecords e HistoryEvents
  useEffect(() => {
    setUsageRecords([
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
    ]);

    setHistoryEvents([
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
    ]);
  }, []);
  
  // Estatísticas de equipamentos
  const equipmentStats = {
    total: equipments.reduce((acc, equipment) => acc + (equipment.quantity || 0), 0),
    available: equipments.reduce((acc, equipment) => acc + ((equipment.status === 'disponível' ? equipment.quantity : 0) || 0), 0),
    inUse: equipments.reduce((acc, equipment) => acc + ((equipment.status === 'em uso' ? equipment.quantity : 0) || 0), 0),
    maintenance: equipments.reduce((acc, equipment) => acc + ((equipment.status === 'manutenção' ? equipment.quantity : 0) || 0), 0),
  };
  
  // Filtragem de equipamentos
  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch = searchTerm === "" || 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (equipment.serial_number && equipment.serial_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "available" && equipment.status === "disponível") ||
      (statusFilter === "in_use" && equipment.status === "em uso") ||
      (statusFilter === "maintenance" && equipment.status === "manutenção");
    
    const matchesType = typeFilter === "all" || equipment.category === typeFilter;
    
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
  const handleEditEquipment = (equipment: Equipment) => {
    setEquipmentToEdit(equipment);
    setIsNewEquipmentModalOpen(true);
  };

  const handleDeleteEquipment = async () => {
    if (!selectedEquipment) return;

    try {
      // Se houver uma imagem, exclui do storage
      if (selectedEquipment.image_url) {
        const imagePath = selectedEquipment.image_url.split('/').pop();
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
        .eq('id', selectedEquipment.id);

      if (error) {
        throw error;
      }

      toast.success('Equipamento excluído com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      toast.error('Ocorreu um erro ao excluir o equipamento');
    } finally {
      setIsDeleteConfirmOpen(false);
      setSelectedEquipment(null);
    }
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
  const renderStatus = (status: string) => {
    switch (status) {
      case "disponível":
        return <Badge className="bg-green-600">Disponível</Badge>;
      case "em uso":
        return <Badge className="bg-blue-600">Em Uso</Badge>;
      case "manutenção":
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

  // Função para renderizar o tipo do equipamento
  const renderEquipmentType = (type: string) => {
    switch (type) {
      case 'camera': return 'Câmera';
      case 'lens': return 'Lente';
      case 'stabilizer': return 'Estabilizador';
      case 'audio': return 'Áudio';
      case 'lighting': return 'Iluminação';
      case 'support': return 'Suporte';
      case 'accessory': return 'Acessório';
      default: return type;
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
              className="bg-[#141414] hover:bg-[#1f1f1f]"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Retirar KIT
            </Button>
            <Button 
              onClick={() => {
                setEquipmentToEdit(null);
                setIsNewEquipmentModalOpen(true);
              }} 
              className="bg-[#ff3335] hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Equipamento
            </Button>
          </div>
        </div>
        
        {/* Dashboard de Status */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#141414] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Equipamentos</p>
              <p className="text-2xl font-bold">{equipmentStats.total}</p>
            </div>
            <Package className="h-8 w-8 text-gray-500" />
          </div>
          
          <div className="bg-[#141414] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Disponíveis</p>
              <p className="text-2xl font-bold text-green-500">{equipmentStats.available}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          
          <div className="bg-[#141414] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Em Uso</p>
              <p className="text-2xl font-bold text-blue-500">{equipmentStats.inUse}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          
          <div className="bg-[#141414] rounded-lg p-4 flex items-center justify-between">
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
            <div className="bg-[#141414] rounded-lg p-4">
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
                    .filter(e => e.status === "em uso")
                    .map(equipment => (
                      <TableRow key={`in-use-${equipment.id}`}>
                        <TableCell>{equipment.name}</TableCell>
                        <TableCell className="text-right">{equipment.quantity}</TableCell>
                      </TableRow>
                    ))}
                  {equipments.filter(e => e.status === "em uso").length === 0 && (
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
            <div className="bg-[#141414] rounded-lg p-4">
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
                    .filter(e => e.status === "disponível")
                    .map(equipment => (
                      <TableRow key={`available-${equipment.id}`}>
                        <TableCell>{equipment.name}</TableCell>
                        <TableCell className="text-right">{equipment.quantity}</TableCell>
                      </TableRow>
                    ))}
                  {equipments.filter(e => e.status === "disponível").length === 0 && (
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
                <SelectTrigger className="w-[180px] bg-[#141414] border-gray-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-gray-700">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="in_use">Em Uso</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-[#141414] border-gray-700">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-gray-700">
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
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipments.length === 0 ? (
                  <div className="col-span-full bg-[#141414] rounded-lg p-8 text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-gray-300 mb-2">Nenhum equipamento encontrado</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      {searchTerm ? 
                        `Não encontramos equipamentos com o termo "${searchTerm}"` : 
                        "Não há equipamentos que correspondam aos filtros selecionados"}
                    </p>
                    <Button 
                      onClick={() => {
                        setEquipmentToEdit(null);
                        setIsNewEquipmentModalOpen(true);
                      }} 
                      className="mt-4 bg-[#ff3335] hover:bg-red-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Novo Equipamento
                    </Button>
                  </div>
                ) : (
                  filteredEquipments.map((equipment) => (
                    <div 
                      key={equipment.id}
                      className="bg-[#141414] border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all"
                    >
                      <div className="h-40 bg-gray-700 flex items-center justify-center">
                        {equipment.image_url ? (
                          <img 
                            src={equipment.image_url} 
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
                          {equipment.brand && (
                            <span className="text-gray-400">
                              <span className="font-medium">Marca: </span>
                              {equipment.brand}
                            </span>
                          )}
                        </div>
                        
                        {equipment.serial_number && (
                          <p className="text-sm text-gray-400 mb-2">
                            <span className="font-medium">S/N: </span>
                            {equipment.serial_number}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-400 mb-4">
                          <span className="font-medium">Tipo: </span>
                          {renderEquipmentType(equipment.category)}
                        </p>
                        
                        <div className="flex space-x-2">
                          {/* Botão de editar */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-gray-600"
                            onClick={() => handleEditEquipment(equipment)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>

                          {/* Botão de excluir */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-gray-600 hover:bg-red-900/20 hover:text-red-400 hover:border-red-800"
                            onClick={() => {
                              setSelectedEquipment(equipment);
                              setIsDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>

                        <div className="flex space-x-2 mt-2">
                          {equipment.status === "disponível" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 border-gray-600"
                                onClick={() => openScheduleModal(equipment)}
                              >
                                <Calendar className="h-4 w-4 mr-1" />
                                Agendar
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-[#ff3335] hover:bg-red-700"
                                onClick={() => openCheckoutModal(equipment)}
                              >
                                <LogOut className="h-4 w-4 mr-1" />
                                Retirar
                              </Button>
                            </>
                          )}
                          {equipment.status === "disponível" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 bg-[#141414] hover:bg-[#1f1f1f] text-white border-gray-600"
                              onClick={() => addToKit(equipment)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Kit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="bg-[#141414] rounded-lg p-8 text-center">
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
                    className="bg-[#141414] border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all"
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
                              {record
