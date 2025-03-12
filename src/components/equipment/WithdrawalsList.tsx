
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Plus, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EquipmentWithdrawal } from '@/types/equipment';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { format, isAfter, parseISO } from 'date-fns';
import ReturnModal from './ReturnModal';
import ReceiptModal from './ReceiptModal';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

const WithdrawalsList: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<EquipmentWithdrawal[]>([]);
  const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<string | null>(null);
  
  const { data: withdrawalsData, isLoading, error, refetch } = useWithdrawals();

  useEffect(() => {
    if (withdrawalsData) {
      // Ensure we have properly formatted data
      const processedData = withdrawalsData.map(item => ({
        ...item,
        user: item.user || { id: item.user_id, full_name: 'Usuário não encontrado' },
        equipment: item.equipment || { id: item.equipment_id, name: 'Equipamento não encontrado' },
        production: item.production || (item.production_id ? { id: item.production_id, title: 'Produção não encontrada' } : null)
      }));

      processWithdrawals(processedData);
    }
  }, [withdrawalsData]);

  const processWithdrawals = (data: EquipmentWithdrawal[]) => {
    // Process withdrawals to check for overdue items
    const processed = data.map(withdrawal => {
      let status = withdrawal.status;
      
      // Check if it's overdue and not returned yet
      if (status === 'withdrawn' && isAfter(new Date(), parseISO(withdrawal.expected_return_date))) {
        status = 'overdue';
      }
      
      // Check if it was returned late
      if (status === 'returned' && withdrawal.returned_date && 
          isAfter(parseISO(withdrawal.returned_date), parseISO(withdrawal.expected_return_date))) {
        status = 'returned_late';
      }
      
      return {
        ...withdrawal,
        status
      };
    });
    
    setWithdrawals(processed as EquipmentWithdrawal[]);
  };

  const handleOpenReturnModal = (id: string) => {
    setSelectedWithdrawalId(id);
    setReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setSelectedWithdrawalId(null);
    setReturnModalOpen(false);
    refetch();
  };

  const handleOpenReceiptModal = (id: string) => {
    setSelectedReceiptId(id);
    setReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setSelectedReceiptId(null);
    setReceiptModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!withdrawalToDelete) return;
    
    try {
      const { error } = await supabase
        .from('equipment_withdrawals')
        .delete()
        .eq('id', withdrawalToDelete);
        
      if (error) throw error;
      
      setWithdrawals(prevWithdrawals => 
        prevWithdrawals.filter(withdrawal => withdrawal.id !== withdrawalToDelete) as EquipmentWithdrawal[]
      );
      
      toast.success('Retirada excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir retirada:', error);
      toast.error('Erro ao excluir retirada');
    } finally {
      setDeleteDialogOpen(false);
      setWithdrawalToDelete(null);
    }
  };

  const handleDelete = (id: string) => {
    setWithdrawalToDelete(id);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'withdrawn':
        return <Badge className="bg-yellow-500">Em uso</Badge>;
      case 'overdue':
        return <Badge className="bg-[#ff3335]">Atrasado</Badge>;
      case 'returned':
        return <Badge className="bg-green-500">Devolvido</Badge>;
      case 'returned_late':
        return <Badge className="bg-orange-500">Devolvido com atraso</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Carregando retiradas...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erro ao carregar retiradas</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Retiradas de Equipamentos</h2>
        <Button 
          onClick={() => window.location.href='/equipment/new-withdrawal'} 
          variant="default" 
          className="bg-[#ff3335] hover:bg-red-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Retirada
        </Button>
      </div>
      
      {withdrawals.length === 0 ? (
        <Card className="bg-[#141414] border-0 text-white">
          <CardContent className="pt-6 text-center">
            Nenhuma retirada encontrada
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id} className="bg-[#141414] border-0 text-white overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-white truncate">
                    {withdrawal.equipment?.name}
                  </CardTitle>
                  <div>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {withdrawal.user?.full_name}
                </div>
                
                {withdrawal.is_personal_use ? (
                  <div className="text-sm text-gray-400">
                    Uso pessoal
                  </div>
                ) : (
                  withdrawal.production?.title && (
                    <div className="text-sm text-gray-400">
                      Produção: {withdrawal.production.title}
                    </div>
                  )
                )}
              </CardHeader>
              
              <CardContent className="pb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Retirada:</span>
                  <span>{withdrawal.withdrawal_date ? format(new Date(withdrawal.withdrawal_date), 'dd/MM/yyyy') : '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Devolução Prevista:</span>
                  <span>{format(new Date(withdrawal.expected_return_date), 'dd/MM/yyyy')}</span>
                </div>
                
                {withdrawal.returned_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Devolvido em:</span>
                    <span>{format(new Date(withdrawal.returned_date), 'dd/MM/yyyy')}</span>
                  </div>
                )}
                
                {withdrawal.notes && (
                  <>
                    <Separator className="my-2 bg-gray-700" />
                    <div className="text-sm">
                      <span className="text-gray-400">Observações:</span>
                      <p className="mt-1 text-white">{withdrawal.notes}</p>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    onClick={() => handleOpenReceiptModal(withdrawal.id)}
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-[#333]"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {withdrawal.status === 'withdrawn' || withdrawal.status === 'overdue' ? (
                    <Button
                      onClick={() => handleOpenReturnModal(withdrawal.id)}
                      variant="outline" 
                      size="sm"
                      className="border-green-500 text-green-500 hover:bg-green-950 hover:text-green-400"
                    >
                      Devolver
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleDelete(withdrawal.id)}
                      variant="ghost" 
                      size="sm"
                      className="text-white hover:bg-[#333]"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {returnModalOpen && selectedWithdrawalId && (
        <ReturnModal
          open={returnModalOpen}
          onClose={handleCloseReturnModal}
          withdrawalId={selectedWithdrawalId}
        />
      )}
      
      {receiptModalOpen && selectedReceiptId && (
        <ReceiptModal
          withdrawalId={selectedReceiptId}
          onClose={handleCloseReceiptModal}
        />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#141414] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir esta retirada? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white bg-gray-700 hover:bg-gray-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-[#ff3335] hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WithdrawalsList;
