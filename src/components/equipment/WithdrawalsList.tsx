import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ReturnModal } from '@/components/equipment/ReturnModal';
import ReceiptModal from '@/components/equipment/ReceiptModal';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentWithdrawal } from '@/types/equipment';
import { useWithdrawals } from '@/hooks/useWithdrawals';

interface WithdrawalsListProps {
  refetch: () => void;
}

const WithdrawalsList: React.FC<WithdrawalsListProps> = ({ refetch }) => {
  const navigate = useNavigate();
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<EquipmentWithdrawal | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
  const { withdrawals, isLoading, isError } = useWithdrawals();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleDeleteWithdrawal = async () => {
    if (!withdrawalToDelete) return;
  
    try {
      const { error } = await supabase
        .from('equipment_withdrawals')
        .delete()
        .eq('id', withdrawalToDelete);
  
      if (error) {
        throw error;
      }
  
      toast.success('Retirada excluída com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao excluir retirada:', error);
      toast.error('Ocorreu um erro ao excluir a retirada');
    } finally {
      setIsDeleteAlertOpen(false);
      setWithdrawalToDelete(null);
    }
  };

  const openReturnModal = (withdrawal: EquipmentWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsReturnModalOpen(true);
  };

  const closeReturnModal = () => {
    setSelectedWithdrawal(null);
    setIsReturnModalOpen(false);
  };

  const openReceiptModal = (withdrawalId: string) => {
    setSelectedWithdrawalId(withdrawalId);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setSelectedWithdrawalId(null);
    setIsReceiptModalOpen(false);
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando retiradas...</div>;
  }

  if (isError) {
    return <div className="text-center py-4">Erro ao carregar retiradas.</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Lista de Retiradas</h2>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Equipamento</TableHead>
              <TableHead>Data de Retirada</TableHead>
              <TableHead>Devolução Prevista</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>{withdrawal.equipment_id}</TableCell>
                <TableCell>{formatDate(withdrawal.withdrawal_date || '')}</TableCell>
                <TableCell>{formatDate(withdrawal.expected_return_date)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{withdrawal.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openReceiptModal(withdrawal.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openReturnModal(withdrawal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => {
                        setWithdrawalToDelete(withdrawal.id);
                        setIsDeleteAlertOpen(true);
                      }}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-[#000000] border border-[#141414] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta ação irá excluir a retirada permanentemente. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
                setIsDeleteAlertOpen(false);
                setWithdrawalToDelete(null);
              }} className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWithdrawal} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Return Modal */}
      {selectedWithdrawal && (
        <ReturnModal
          isOpen={isReturnModalOpen}
          onClose={closeReturnModal}
          withdrawal={selectedWithdrawal}
          onSuccess={refetch}
        />
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        withdrawalId={selectedWithdrawalId}
        onClose={closeReceiptModal}
      />
    </div>
  );
};

export default WithdrawalsList;
