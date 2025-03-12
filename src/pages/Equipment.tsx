
import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Package, Calendar, LogOut, CheckCircle, AlertTriangle, ShoppingCart, History, Users, Edit, ArrowLeft, FileText, Info, Receipt, ReceiptText } from "lucide-react";
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
  DialogTrigger,
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
import ReceiptModal from "@/components/equipment/ReceiptModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Receipt as ReceiptType } from "@/types/equipment";
import SchedulesList from "@/components/equipment/SchedulesList";
import WithdrawalsList from "@/components/equipment/WithdrawalsList";

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

// Função para buscar recibos do Supabase
const fetchReceipts = async (): Promise<ReceiptType[]> => {
  const { data, error } = await supabase
    .from("equipment_withdrawals")
    .select(`
      id,
      withdrawal_date,
      equipment_id,
      equipment:equipment_id (id, name),
      user_id,
      user:user_id (id, full_name),
      production_id,
      production:production_id (id, title),
      expected_return_date,
      returned_date,
      is_personal_use,
      notes,
      status,
      created_at:withdrawal_date
    `)
    .order("withdrawal_date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar recibos:", error);
    throw new Error(error.message);
  }

  return (data as unknown as ReceiptType[]) || [];
};

// Função para buscar produções do Supabase
const fetchProductions = async () => {
  const { data, error } = await supabase
    .from("productions")
    .select("id, title")
    .order("title");

  if (error) {
    console.error("Erro ao buscar produções:", error);
    throw new Error(error.message);
  }

  return data || [];
};

const Equipment = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  
  // Consulta para buscar equipamentos
  const { data: equipments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["equipments"],
    queryFn: fetchEquipments,
  });

  // Consulta para buscar recibos
  const { data: receipts = [], refetch: refetchReceipts } = useQuery({
    queryKey: ["receipts"],
    queryFn: fetchReceipts,
  });

  // Consulta para buscar produções
  const { data: productions = [] } = useQuery({
    queryKey: ["productions"],
    queryFn: fetchProductions,
  });
  
  // Estados
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState("inventory");
  
  // Estados para modais
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
  
  // Estados para os novos modais
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduleEndDate, setScheduleEndDate] = useState<Date | undefined>(new Date());
  const [selectedProduction, setSelectedProduction] = useState<string>("");
  const [scheduleNotes, setScheduleNotes] = useState<string>("");
  const [isPersonalUse, setIsPersonalUse] = useState<boolean>(false);
  
  // Estados para os modais de retirada e devolução
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [checkoutProduction, setCheckoutProduction] = useState<string>("");
  const [checkoutNotes, setCheckoutNotes] = useState<string>("");
  
  // Estado para o modal de recibo
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);
  
  // Add a new state for withdrawal type selection
  const [isWithdrawalTypeModalOpen, setIsWithdrawalTypeModalOpen] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<'schedule' | 'immediate'>('immediate');
  
  // Efeito para adicionar HistoryEvents
  useEffect(() => {
    setHistoryEvents([
      {
        id: "h1",
        equipmentId: "e2",
        equipmentName: "DJI Ronin 4D",
        eventType: "checkout",
        date: new Date(2023, 2, 10, 23, 47), // 10/03/2023 23:47
        responsibleName: "João Silva",
        productionName: "Campanha de Marketing - Verão 2023",
        notes: "Retirada para uso externo"
      },
      {
        id: "h2",
        equipmentId: "e1",
        equipmentName: "Canon EOS R5",
        eventType: "checkout",
        date: new Date(2023, 2, 10, 23, 56), // 10/03/2023 23:56
        responsibleName: "João Silva",
        productionName: "Vídeo Institucional"
      },
      {
        id: "h3",
        equipmentId: "e1",
        equipmentName: "Canon EOS R5",
        eventType: "return",
        date: new Date(2023, 2, 10, 23, 56), // 10/03/2023 23:56
        responsibleName: "João Silva",
        productionName: "Vídeo Institucional",
        notes: "Equipamento devolvido"
      },
      {
        id: "h4",
        equipmentId: "e2",
        equipmentName: "DJI Ronin 4D",
        eventType: "return",
        date: new Date(2023, 2, 10, 23, 56), // 10/03/2023 23:56
        responsibleName: "João Silva",
        productionName: "Campanha de Marketing - Verão 2023",
        notes: "Equipamento devolvido"
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
  
  // Filtragem de eventos de histórico
  const filteredHistoryEvents = historyEvents.filter((event) => {
    const matchesSearch = searchTerm === "" || 
      event.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.productionName && event.productionName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });
  
  // Filtragem de recibos
  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch = searchTerm === "" || 
      receipt.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.production?.title && receipt.production.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
  
  // Função para renderizar o status com as cores corretas
  const renderStatus = (status: string) => {
    switch (status) {
      case "disponível":
        return <Badge className="bg-green-600">Disponível</Badge>;
      case "em uso":
        return <Badge className="bg-[#ff3335]">Em Uso</Badge>;
      case "manutenção":
        return <Badge className="bg-yellow-600">Manutenção</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };
  
  // Função para renderizar o status do recibo
  const renderReceiptStatus = (status: string) => {
    switch (status) {
      case "withdrawn":
        return <Badge className="bg-[#ff3335]">Em Uso</Badge>;
      case "returned":
        return <Badge className="bg-green-600">Devolvido</Badge>;
      case "overdue":
        return <Badge className="bg-yellow-600">Atrasado</Badge>;
      case "returned_late":
        return <Badge className="bg-purple-600">Devolvido com Atraso</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };
  
  // Função para renderizar o tipo do evento do histórico
  const renderEventType = (eventType: HistoryEvent["eventType"]) => {
    switch (eventType) {
      case "checkout":
        return <Badge className="bg-[#ff3335]">Retirada</Badge>;
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

  // Função para abrir o modal de retirada
  const openCheckoutModal = (equipment: Equipment) => {
    if (equipment.status !== "disponível") {
      toast.error("Este equipamento não está disponível para retirada");
      return;
    }

    setSelectedEquipment(equipment);
    setCheckoutProduction("");
    setCheckoutNotes("");
    setIsPersonalUse(false);
    setIsCheckoutModalOpen(true);
  };

  // Função para confirmar a retirada
  const handleConfirmCheckout = async () => {
    if (!selectedEquipment || !user) return;
    
    try {
      // Dados para criar o recibo
      const withdrawalData = {
        equipment_id: selectedEquipment.id,
        user_id: user.id,
        production_id: isPersonalUse ? null : checkoutProduction || null,
        expected_return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias a partir de hoje
        notes: checkoutNotes || null,
        is_personal_use: isPersonalUse,
        status: 'withdrawn'
      };
      
      // Insere o recibo no banco de dados
      const { data: receiptData, error: receiptError } = await supabase
        .from('equipment_withdrawals')
        .insert(withdrawalData)
        .select()
        .single();
      
      if (receiptError) throw receiptError;
      
      // Atualiza o status do equipamento para "em uso"
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ status: "em uso" })
        .eq('id', selectedEquipment.id);
      
      if (equipmentError) throw equipmentError;
      
      toast.success(`${selectedEquipment.name} retirado com sucesso!`);
      
      // Atualiza as consultas
      refetch();
      refetchReceipts();
      closeCheckoutModal();
      
      // Abre automaticamente o modal de recibo
      setSelectedReceipt(receiptData as unknown as ReceiptType);
      setIsReceiptModalOpen(true);
    } catch (error) {
      console.error('Erro ao retirar equipamento:', error);
      toast.error('Ocorreu um erro ao retirar o equipamento');
    }
  };

  // Função para fechar o modal de retirada
  const closeCheckoutModal = () => {
    setSelectedEquipment(null);
    setIsCheckoutModalOpen(false);
  };

  // Função para abrir o modal de devolução
  const openReturnModal = (equipment: Equipment) => {
    if (equipment.status !== "em uso") {
      toast.error("Este equipamento não está em uso para ser devolvido");
      return;
    }

    setSelectedEquipment(equipment);
    setIsReturnModalOpen(true);
  };

  // Função para confirmar a devolução
  const handleConfirmReturn = async () => {
    if (!selectedEquipment) return;
    
    try {
      // Busca o recibo relacionado ao equipamento
      const { data: receiptData, error: receiptFetchError } = await supabase
        .from('equipment_withdrawals')
        .select('*')
        .eq('equipment_id', selectedEquipment.id)
        .eq('status', 'withdrawn')
        .order('withdrawal_date', { ascending: false })
        .limit(1)
        .single();
      
      if (receiptFetchError) throw receiptFetchError;
      
      // Atualiza o recibo
      const { error: receiptUpdateError } = await supabase
        .from('equipment_withdrawals')
        .update({ 
          status: 'returned',
          returned_date: new Date().toISOString() 
        })
        .eq('id', receiptData.id);
      
      if (receiptUpdateError) throw receiptUpdateError;
      
      // Atualiza o status do equipamento para "disponível"
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ status: "disponível" })
        .eq('id', selectedEquipment.id);
      
      if (equipmentError) throw equipmentError;
      
      toast.success(`${selectedEquipment.name} devolvido com sucesso!`);
      
      // Atualiza as consultas
      refetch();
      refetchReceipts();
      closeReturnModal();
    } catch (error) {
      console.error('Erro ao devolver equipamento:', error);
      toast.error('Ocorreu um erro ao devolver o equipamento');
    }
  };

  // Função para fechar o modal de devolução
  const closeReturnModal = () => {
    setSelectedEquipment(null);
    setIsReturnModalOpen(false);
  };

  // Função para agendar um equipamento
  const handleScheduleEquipment = async () => {
    if (!selectedEquipment || !user || !selectedDate || !scheduleEndDate) return;
    
    try {
      const scheduleData = {
        equipment_id: selectedEquipment.id,
        user_id: user.id,
        production_id: selectedProduction || null,
        start_date: selectedDate.toISOString(),
        end_date: scheduleEndDate.toISOString(),
        notes: scheduleNotes || null
      };
      
      const { error } = await supabase
        .from('equipment_schedules')
        .insert(scheduleData);
      
      if (error) throw error;
      
      toast.success(`${selectedEquipment.name} agendado com sucesso!`);
      
      // Adiciona um novo evento ao histórico
      const newEvent: HistoryEvent = {
        id: `h${historyEvents.length + 1}`,
        equipmentId: selectedEquipment.id,
        equipmentName: selectedEquipment.name,
        eventType: "schedule",
        date: new Date(),
        responsibleName: profile?.full_name || user.email || "Usuário Atual",
        productionName: productions.find(p => p.id === selectedProduction)?.title,
        notes: scheduleNotes
      };
      
      setHistoryEvents(prev => [newEvent, ...prev]);
      closeScheduleModal();
      
      // Atualiza a lista de agendamentos
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    } catch (error) {
      console.error('Erro ao agendar equipamento:', error);
      toast.error('Ocorreu um erro ao agendar o equipamento');
    }
  };

  // Funções para abrir/fechar modais
  const openKitModal = () => {
    setWithdrawalType('immediate'); // Reset to default
    setIsWithdrawalTypeModalOpen(true);
  };

  const closeWithdrawalTypeModal = () => {
    setIsWithdrawalTypeModalOpen(false);
  };

  const handleWithdrawalTypeSelection = (type: 'schedule' | 'immediate') => {
    setWithdrawalType(type);
    setIsWithdrawalTypeModalOpen(false);
    setIsKitModalOpen(true);
  };
  
  const openScheduleModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setSelectedEquipment(null);
    setSelectedDate(new Date());
    setScheduleEndDate(new Date());
    setSelectedProduction("");
    setScheduleNotes("");
    setIsScheduleModalOpen(false);
  };
  
  // Função para abrir o modal de recibo
  const openReceiptModal = (receipt: ReceiptType) => {
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };
  
  // Função para fechar o modal de recibo
  const closeReceiptModal = () => {
    setSelectedReceipt(null);
    setIsReceiptModalOpen(false);
  };

  // Update the closeKitModal function
  const closeKitModal = () => {
    setIsKitModalOpen(false);
  };

  // Encontrar a produção associada a um equipamento em uso
  const findEquipmentProduction = (equipmentId: string) => {
    const withdrawalForEquipment = receipts.find(
      receipt => receipt.equipment?.id === equipmentId && receipt.status === 'withdrawn'
    );
    
    return withdrawalForEquipment?.production?.title || 'Uso Pessoal';
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <h1 className="text-2xl font-bold">Equipamentos</h1>
            
            <div className="flex items-center bg-[#141414] rounded-md px-3 py-2 w-full md:w-auto">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <Input
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full md:w-60"
              />
            </div>
            
            <Button variant="outline" className="bg-[#141414] border-gray-700 w-full md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          <div className="flex space-x-3 w-full md:w-auto">
            <Button 
              variant="secondary"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
              onClick={openKitModal}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Retirar KIT
            </Button>
            <Button 
              onClick={() => {
                setEquipmentToEdit(null);
                setIsNewEquipmentModalOpen(true);
              }} 
              className="bg-[#ff3335] hover:bg-red-700 w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Equipamento
            </Button>
          </div>
        </div>
        
        {/* Dashboard de Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
              <p className="text-2xl font-bold text-[#ff3335]">{equipmentStats.inUse}</p>
            </div>
            <Users className="h-8 w-8 text-[#ff3335]" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tabela de equipamentos em uso */}
            <div className="bg-[#141414] rounded-lg p-4">
              <h3 className="text-md font-medium mb-2 text-[#ff3335]">Equipamentos em Uso</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Produção</TableHead>
                      <TableHead className="text-right">Recibo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipments
                      .filter(e => e.status === "em uso")
                      .map(equipment => {
                        const receipt = receipts.find(
                          r => r.equipment?.id === equipment.id && r.status === 'withdrawn'
                        );
                        
                        return (
                          <TableRow key={`in-use-${equipment.id}`}>
                            <TableCell>{equipment.name}</TableCell>
                            <TableCell>
                              {findEquipmentProduction(equipment.id)}
                            </TableCell>
                            <TableCell className="text-right">
                              {receipt && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openReceiptModal(receipt)}
                                  className="h-8 w-8 rounded-full hover:bg-gray-700"
                                >
                                  <ReceiptText className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {equipments.filter(e => e.status === "em uso").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          Nenhum equipamento em uso
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Tabela de equipamentos disponíveis */}
            <div className="bg-[#141414] rounded-lg p-4">
              <h3 className="text-md font-medium mb-2 text-green-400">Equipamentos Disponíveis</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipments
                      .filter(e => e.status === "disponível")
                      .map(equipment => (
                        <TableRow key={`available-${equipment.id}`}>
                          <TableCell>{equipment.name}</TableCell>
                          <TableCell>{renderEquipmentType(equipment.category || '')}</TableCell>
                          <TableCell className="text-right">{equipment.quantity}</TableCell>
                        </TableRow>
                      ))}
                    {equipments.filter(e => e.status === "disponível").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          Nenhum equipamento disponível
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="inventory" value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="mb-4 flex overflow-x-auto md:flex-nowrap">
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
            <TabsTrigger value="receipts">Recibos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-[#141414] border-gray-700">
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
                <SelectTrigger className="w-full sm:w-[180px] bg-[#141414] border-gray-700">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-gray-700">
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="camera">Câmeras</SelectItem>
                  <SelectItem value="lens">Lentes</SelectItem>
                  <SelectItem value="stabilizer">Estabilizadores</SelectItem>
                  <SelectItem value="audio">Áudio</SelectItem>
                  <SelectItem value="lighting">Iluminação</SelectItem>
                  <SelectItem value="support">Suporte</SelectItem>
                  <SelectItem value="accessory">Acessórios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-[#141414] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                        <p className="mt-2 text-gray-400">Carregando equipamentos...</p>
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <p className="text-red-500">Erro ao carregar equipamentos</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => refetch()}
                        >
                          Tentar novamente
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : filteredEquipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <p className="text-gray-400">Nenhum equipamento encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEquipments.map((equipment) => (
                      <TableRow key={equipment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {equipment.image_url ? (
                              <img 
                                src={equipment.image_url} 
                                alt={equipment.name} 
                                className="w-10 h-10 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{equipment.name}</p>
                              {equipment.serial_number && (
                                <p className="text-xs text-gray-400">S/N: {equipment.serial_number}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderEquipmentType(equipment.category || '')}</TableCell>
                        <TableCell>{renderStatus(equipment.status)}</TableCell>
                        <TableCell>{equipment.quantity}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditEquipment(equipment)}
                                  className="h-8 w-8 rounded-full hover:bg-gray-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                            
                            {equipment.status === "disponível" && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openCheckoutModal(equipment)}
                                  className="h-8 w-8 rounded-full hover:bg-gray-700"
                                >
                                  <LogOut className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openScheduleModal(equipment)}
                                  className="h-8 w-8 rounded-full hover:bg-gray-700"
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {equipment.status === "em uso" && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openReturnModal(equipment)}
                                className="h-8 w-8 rounded-full hover:bg-gray-700 text-green-500"
                              >
                                <ArrowLeft className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedEquipment(equipment);
                                setIsDeleteConfirmOpen(true);
                              }}
                              className="h-8 w-8 rounded-full hover:bg-gray-700 text-red-500"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="schedules">
            <SchedulesList />
          </TabsContent>
          
          <TabsContent value="receipts">
            <WithdrawalsList />
          </TabsContent>
          
          <TabsContent value="history">
            <div className="bg-[#141414] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Produção</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistoryEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <p className="text-gray-400">Nenhum evento no histórico</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistoryEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{format(event.date, 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>{renderEventType(event.eventType)}</TableCell>
                        <TableCell>{event.equipmentName}</TableCell>
                        <TableCell>{event.responsibleName}</TableCell>
                        <TableCell>{event.productionName || "Uso Pessoal"}</TableCell>
                        <TableCell>
                          {event.notes && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Ver
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent side="top" className="w-80 bg-[#141414] border-gray-700">
                                <p className="text-sm">{event.notes}</p>
                              </PopoverContent>
                            </Popover>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Modais */}
        <EquipmentModal 
          isOpen={isNewEquipmentModalOpen}
          onClose={() => setIsNewEquipmentModalOpen(false)}
          equipment={equipmentToEdit}
          onSuccess={() => {
            refetch();
            setIsNewEquipmentModalOpen(false);
            setEquipmentToEdit(null);
          }}
        />
        
        {/* Modal de Recibo */}
        {selectedReceipt && (
          <ReceiptModal 
            isOpen={isReceiptModalOpen}
            onClose={closeReceiptModal}
            receipt={selectedReceipt}
          />
        )}
        
        {/* Confirmação de Exclusão */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent className="bg-[#141414] border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o equipamento
                <strong> {selectedEquipment?.name}</strong> do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 border-gray-600 hover:bg-gray-600">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteEquipment}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Modal de Seleção de Tipo de Retirada */}
        <Dialog open={isWithdrawalTypeModalOpen} onOpenChange={setIsWithdrawalTypeModalOpen}>
          <DialogContent className="bg-[#141414] border-gray-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Selecione o Tipo de Movimentação</DialogTitle>
              <DialogDescription>
                Escolha o tipo de movimentação que deseja realizar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              <Button
                variant="outline"
                onClick={() => handleWithdrawalTypeSelection('immediate')}
                className="flex justify-between items-center p-4"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-3 text-[#ff3335]" />
                  <div className="text-left">
                    <h3 className="font-medium">Retirada Imediata</h3>
                    <p className="text-sm text-gray-400">Retirar equipamentos agora</p>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleWithdrawalTypeSelection('schedule')}
                className="flex justify-between items-center p-4"
              >
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-purple-500" />
                  <div className="text-left">
                    <h3 className="font-medium">Agendamento</h3>
                    <p className="text-sm text-gray-400">Agendar retirada para data futura</p>
                  </div>
                </div>
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={closeWithdrawalTypeModal}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Checkout Modal */}
        <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
          <DialogContent className="bg-[#141414] border-gray-700">
            <DialogHeader>
              <DialogTitle>Retirada de Equipamento</DialogTitle>
              <DialogDescription>
                {selectedEquipment && `Retirar ${selectedEquipment.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="personal-use" 
                    checked={isPersonalUse}
                    onCheckedChange={(checked) => 
                      setIsPersonalUse(checked === true)
                    }
                  />
                  <label
                    htmlFor="personal-use"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Uso Pessoal
                  </label>
                </div>
                <p className="text-sm text-gray-400">
                  Marque esta opção caso o equipamento não esteja vinculado a uma produção.
                </p>
              </div>
              
              {!isPersonalUse && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Produção</label>
                  <Select value={checkoutProduction} onValueChange={setCheckoutProduction}>
                    <SelectTrigger className="bg-[#141414] border-gray-700">
                      <SelectValue placeholder="Selecione a produção" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-gray-700">
                      {productions.map((production) => (
                        <SelectItem key={production.id} value={production.id}>
                          {production.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea 
                  placeholder="Adicione observações sobre a retirada"
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  className="bg-[#141414] border-gray-700"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={closeCheckoutModal}>
                Cancelar
              </Button>
              <Button 
                variant="default" 
                className="bg-[#ff3335] hover:bg-red-700"
                onClick={handleConfirmCheckout}
              >
                Confirmar Retirada
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Return Modal */}
        <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
          <DialogContent className="bg-[#141414] border-gray-700">
            <DialogHeader>
              <DialogTitle>Devolução de Equipamento</DialogTitle>
              <DialogDescription>
                {selectedEquipment && `Devolver ${selectedEquipment.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-300">
                Você está prestes a confirmar a devolução deste equipamento. Após confirmar, o status será alterado para "disponível".
              </p>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={closeReturnModal}>
                Cancelar
              </Button>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleConfirmReturn}
              >
                Confirmar Devolução
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Schedule Modal */}
        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogContent className="bg-[#141414] border-gray-700">
            <DialogHeader>
              <DialogTitle>Agendamento de Equipamento</DialogTitle>
              <DialogDescription>
                {selectedEquipment && `Agendar ${selectedEquipment.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Data de Início</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal bg-[#141414] border-gray-700"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#141414] border-gray-700">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Data de Término</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal bg-[#141414] border-gray-700"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduleEndDate ? (
                        format(scheduleEndDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#141414] border-gray-700">
                    <CalendarComponent
                      mode="single"
                      selected={scheduleEndDate}
                      onSelect={setScheduleEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Produção</label>
                <Select value={selectedProduction} onValueChange={setSelectedProduction}>
                  <SelectTrigger className="bg-[#141414] border-gray-700">
                    <SelectValue placeholder="Selecione a produção" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-gray-700">
                    {productions.map((production) => (
                      <SelectItem key={production.id} value={production.id}>
                        {production.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea 
                  placeholder="Adicione observações sobre o agendamento"
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  className="bg-[#141414] border-gray-700"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={closeScheduleModal}>
                Cancelar
              </Button>
              <Button 
                variant="default" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleScheduleEquipment}
              >
                Agendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Equipment;
