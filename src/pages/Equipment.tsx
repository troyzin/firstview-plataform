import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/types/equipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import StatusTables from '@/components/equipment/StatusTables';
import InventoryTab from '@/components/equipment/InventoryTab';
import EquipmentHeader from '@/components/equipment/EquipmentHeader';
import EquipmentModal from '@/components/equipment/EquipmentModal';
import KitWithdrawalModal from '@/components/equipment/KitWithdrawalModal';
import { ReturnModal } from '@/components/equipment/ReturnModal';
import { useAuth } from '@/contexts/AuthContext';
import { WithdrawalModal } from '@/components/equipment/WithdrawalModal';

const EquipmentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>(undefined);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [equipmentToReturn, setEquipmentToReturn] = useState<{ id?: string; name?: string }>({});
  const [equipmentToWithdraw, setEquipmentToWithdraw] = useState<Equipment | null>(null);
  const { hasAction } = useAuth();

  // Fetch equipments using react-query
  const { data: equipments = [], refetch, isLoading } = useQuery({
    queryKey: ['equipments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching equipments:", error);
        toast.error("Erro ao carregar equipamentos");
        return [];
      }
      return data || [];
    },
    refetchOnWindowFocus: false
  });

  // Handlers to open modals
  const openNewEquipmentModal = useCallback(() => {
    setSelectedEquipment(undefined); // Clear any selected equipment
    setIsNewEquipmentModalOpen(true);
  }, []);
  
  const openKitModal = () => setIsKitModalOpen(true);
  const closeNewEquipmentModal = () => setIsNewEquipmentModalOpen(false);
  const closeKitModal = () => setIsKitModalOpen(false);

  // Handler to open edit equipment modal
  const onEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsNewEquipmentModalOpen(true);
  };

  // Handler to schedule equipment
  const onScheduleEquipment = (equipment: Equipment) => {
    toast.info(`Agendamento para ${equipment.name} em breve!`);
  };

  // Handler to checkout equipment (withdraw)
  const onCheckoutEquipment = (equipment: Equipment) => {
    setEquipmentToWithdraw(equipment);
    setIsWithdrawalModalOpen(true);
  };

  // Handler to return equipment
  const onReturnEquipment = (equipment: Equipment) => {
    setEquipmentToReturn({ id: equipment.id, name: equipment.name });
    setIsReturnModalOpen(true);
  };

  // Handler to delete equipment
  const onDeleteEquipment = async (equipment: Equipment) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir ${equipment.name}?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipment.id);

      if (error) {
        console.error("Error deleting equipment:", error);
        toast.error("Erro ao excluir equipamento");
        return;
      }

      toast.success(`${equipment.name} excluído com sucesso!`);
      refetch(); // Refresh equipment list
    } catch (error) {
      console.error("Unexpected error deleting equipment:", error);
      toast.error("Ocorreu um erro ao excluir o equipamento");
    }
  };

  // Close modals
  const closeReturnModal = () => {
    setIsReturnModalOpen(false);
    setEquipmentToReturn({});
  };

  const closeWithdrawalModal = () => {
    setIsWithdrawalModalOpen(false);
    setEquipmentToWithdraw(null);
  };

  // Function to handle successful equipment operations
  const handleEquipmentSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Function to filter equipments based on search term
  const filteredEquipments = equipments?.filter(equipment =>
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (equipment.model?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (equipment.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  // Equipment statistics - with null checks to prevent the length error
  const equipmentStats = {
    total: equipments?.length || 0,
    available: equipments?.filter(eq => eq.status === 'disponível')?.length || 0,
    inUse: equipments?.filter(eq => eq.status === 'em uso')?.length || 0,
    maintenance: equipments?.filter(eq => eq.status === 'manutenção')?.length || 0,
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <p className="text-lg font-medium text-gray-400">Carregando equipamentos...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <EquipmentHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        openKitModal={openKitModal}
        openNewEquipmentModal={openNewEquipmentModal}
      />

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="bg-[#141414]">
          <TabsTrigger 
            value="inventory" 
            className="data-[state=active]:bg-[#000000] data-[state=active]:text-white"
          >
            Inventário
          </TabsTrigger>
          <TabsTrigger 
            value="status" 
            className="data-[state=active]:bg-[#000000] data-[state=active]:text-white"
          >
            Status
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="outline-none">
          <InventoryTab
            equipments={filteredEquipments || []}
            onEditEquipment={onEditEquipment}
            onDeleteEquipment={onDeleteEquipment}
            onScheduleEquipment={onScheduleEquipment}
            onCheckoutEquipment={onCheckoutEquipment}
          />
        </TabsContent>
        <TabsContent value="status" className="outline-none">
          <StatusTables
            equipments={filteredEquipments || []}
            onEditEquipment={onEditEquipment}
            onScheduleEquipment={onScheduleEquipment}
            onCheckoutEquipment={onCheckoutEquipment}
            onReturnEquipment={onReturnEquipment}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EquipmentModal
        isOpen={isNewEquipmentModalOpen}
        onClose={closeNewEquipmentModal}
        equipment={selectedEquipment}
        onSuccess={handleEquipmentSuccess}
      />

      <KitWithdrawalModal
        isOpen={isKitModalOpen}
        onClose={closeKitModal}
        onSuccess={handleEquipmentSuccess}
      />

      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={closeReturnModal}
        equipmentId={equipmentToReturn.id}
        equipmentName={equipmentToReturn.name}
        onSuccess={handleEquipmentSuccess}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={closeWithdrawalModal}
        equipment={equipmentToWithdraw}
        onSuccess={handleEquipmentSuccess}
      />
    </div>
  );
};

export default EquipmentPage;
