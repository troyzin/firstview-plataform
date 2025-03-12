
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PackageCheck, Trash, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ReturnModal } from '@/components/equipment/ReturnModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EquipmentWithdrawal } from '@/types/equipment';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { supabase } from '@/integrations/supabase/client';
import ReceiptModal from '@/components/equipment/ReceiptModal';

interface WithdrawalsListProps {
  equipmentId: string;
}

const WithdrawalsList: React.FC<WithdrawalsListProps> = ({ equipmentId }) => {
  const { data: withdrawals = [], isLoading, refetch } = useWithdrawals(equipmentId);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<EquipmentWithdrawal | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<string | null>(null);

  const handleOpen = (id: string) => {
    setOpen(true);
    setWithdrawalToDelete(id);
  };

  const handleClose = () => {
    setOpen(false);
    setWithdrawalToDelete(null);
  };

  const confirmDelete = async () => {
    if (!withdrawalToDelete) return;

    try {
      console.log("Deleting withdrawal with ID:", withdrawalToDelete);
      const { error } = await supabase
        .from('equipment_withdrawals')
        .delete()
        .eq('id', withdrawalToDelete);

      if (error) {
        console.error("Error deleting withdrawal:", error);
        throw error;
      }

      toast.success('Retirada excluída com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao excluir retirada:', error);
      toast.error('Ocorreu um erro ao excluir a retirada');
    } finally {
      handleClose();
    }
  };

  const openReturnModal = (withdrawal: EquipmentWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsReturnModalOpen(true);
  };

  const closeReturnModal = () => {
    setIsReturnModalOpen(false);
    setSelectedWithdrawal(null);
  };
  
  const openReceiptModal = (withdrawal: EquipmentWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsReceiptModalOpen(true);
  };
  
  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedWithdrawal(null);
  };

  const formatWithdrawalId = (id: string) => {
    if (!id) return '#0000';
    const parts = id.split('-');
    if (!parts || parts.length === 0) return `#${id.substring(0, 4)}`;
    const numericId = parseInt(parts[0], 10) || 0;
    return `#${numericId.toString().padStart(4, '0')}`;
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Retiradas</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff3335]"></div>
        </div>
      ) : withdrawals && withdrawals.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data Retirada</TableHead>
                <TableHead>Data Esperada</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    {withdrawal.is_scheduled ? '--' : formatWithdrawalId(withdrawal.id)}
                  </TableCell>
                  <TableCell>
                    {withdrawal.withdrawal_date 
                      ? format(new Date(withdrawal.withdrawal_date), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{format(new Date(withdrawal.expected_return_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{withdrawal.user?.full_name || withdrawal.user_id}</TableCell>
                  <TableCell>{withdrawal.notes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openReturnModal(withdrawal)}
                      className="hover:bg-[#141414]"
                    >
                      <PackageCheck className="h-4 w-4 text-[#ff3335]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openReceiptModal(withdrawal)}
                      className="hover:bg-[#141414]"
                    >
                      <ReceiptText className="h-4 w-4 text-[#ff3335]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpen(withdrawal.id)}
                      className="hover:bg-[#141414]"
                    >
                      <Trash className="h-4 w-4 text-[#ff3335]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          Nenhuma retirada encontrada para este equipamento.
        </div>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-[#000000] border border-[#141414] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir esta retirada?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose} className="bg-[#141414] text-white hover:bg-[#292929] border-[#292929]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-[#ff3335] hover:bg-[#cc2a2b]">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedWithdrawal && (
        <>
          <ReturnModal
            isOpen={isReturnModalOpen}
            onClose={closeReturnModal}
            equipmentWithdrawal={selectedWithdrawal}
            onSuccess={() => {
              refetch();
              closeReturnModal();
            }}
          />
          
          <ReceiptModal 
            isOpen={isReceiptModalOpen}
            onClose={closeReceiptModal}
            withdrawal={selectedWithdrawal}
          />
        </>
      )}
    </div>
  );
};

export default WithdrawalsList;
