import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Package, Calendar, LogOut, CheckCircle, AlertTriangle, ShoppingCart, History, Users, Edit, ArrowLeft, FileText, Info, Receipt, ReceiptText } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Receipt as ReceiptType, Equipment as EquipmentType, HistoryEvent } from "@/types/equipment";
import SchedulesList from "@/components/equipment/SchedulesList";
import WithdrawalsList from "@/components/equipment/WithdrawalsList";
import EquipmentModal from "@/components/equipment/EquipmentModal";
import ReceiptModal from "@/components/equipment/ReceiptModal";

// Component imports
import EquipmentHeader from "@/components/equipment/EquipmentHeader";
import EquipmentStats from "@/components/equipment/EquipmentStats";
import StatusTables from "@/components/equipment/StatusTables";
import InventoryTab from "@/components/equipment/InventoryTab";
import HistoryTab from "@/components/equipment/HistoryTab";
import ReceiptsTab from "@/components/equipment/ReceiptsTab";

// Dados de exemplo para produções
const productionOptions = [
  { id: "1", name: "Campanha de Marketing - Verão 2023", date: new Date(2023, 11, 15) },
  { id: "2", name: "Vídeo Institucional", date: new Date(2023, 10, 5) },
  { id: "3", name: "Ensaio Fotográfico Produto", date: new Date(2023, 9, 20) },
  { id: "4", name: "Documentário Social", date: new Date(2023, 8, 10) },
];

// Função para buscar equipamentos do Supabase
const fetchEquipments = async (): Promise<EquipmentType[]> => {
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
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [equipmentToEdit, setEquipmentToEdit] = useState<EquipmentType | null>(null);
  
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
  const handleEditEquipment = (equipment: EquipmentType) => {
    setEquipmentToEdit(equipment);
    setIsNewEquipmentModalOpen(true);
  };

  const confirmDeleteEquipment = (equipment: EquipmentType) => {
    setSelectedEquipment(equipment);
    setIsDeleteConfirmOpen(true);
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
  const openCheckoutModal = (equipment: EquipmentType) => {
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
  const openReturnModal = (equipment: EquipmentType) => {
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
  
  const openScheduleModal = (equipment: EquipmentType) => {
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

  // Função para fechar o modal de kit
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

  // Função para abrir modal de novo equipamento
  const openNewEquipmentModal = () => {
    setEquipmentToEdit(null);
    setIsNewEquipmentModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <EquipmentHeader 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          openKitModal={openKitModal}
          openNewEquipmentModal={openNewEquipmentModal}
        />
        
        <EquipmentStats 
          total={equipmentStats.total}
          available={equipmentStats.available}
          inUse={equipmentStats.inUse}
          maintenance={equipmentStats.maintenance}
        />
        
        <StatusTables 
          equipments={equipments}
          receipts={receipts}
          openReceiptModal={openReceiptModal}
          findEquipmentProduction={findEquipmentProduction}
          renderEquipmentType={renderEquipmentType}
        />
        
        <Tabs defaultValue="inventory" value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="mb-4 flex overflow-x-auto md:flex-nowrap">
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
            <TabsTrigger value="receipts">Recibos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <InventoryTab 
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              filteredEquipments={filteredEquipments}
              handleEditEquipment={handleEditEquipment}
              handleDeleteEquipment={confirmDeleteEquipment}
              renderStatus={renderStatus}
              renderEquipmentType={renderEquipmentType}
              openCheckoutModal={openCheckoutModal}
              openReturnModal={openReturnModal}
              openScheduleModal={openScheduleModal}
            />
          </TabsContent>
          
          <TabsContent value="schedules">
            <SchedulesList equipmentId={selectedEquipment?.id} />
          </TabsContent>
          
          <TabsContent value="receipts">
            <ReceiptsTab 
              receipts={filteredReceipts}
              openReceiptModal={openReceiptModal}
              renderReceiptStatus={renderReceiptStatus}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <HistoryTab 
              historyEvents={filteredHistoryEvents}
              renderEventType={renderEventType}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modals */}
      <EquipmentModal 
        open={isNewEquipmentModalOpen}
        onOpenChange={setIsNewEquipmentModalOpen}
        equipmentToEdit={equipmentToEdit}
        refetchEquipments={refetch}
      />
      
      <ReceiptModal
        open={isReceiptModalOpen}
        onOpenChange={closeReceiptModal}
        receipt={selectedReceipt}
      />
      
      {/* Other modals would go here */}
    </MainLayout>
  );
};

export default Equipment;
