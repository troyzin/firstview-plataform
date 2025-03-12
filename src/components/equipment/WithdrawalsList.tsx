import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, PackageCheck, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ReturnModal } from '@/components/equipment/ReturnModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EquipmentWithdrawal } from '@/types/equipment';
import { useWithdrawals } from '@/hooks/useWithdrawals';

interface WithdrawalsListProps {
  equipmentId: string;
}

const WithdrawalsList: React.FC<WithdrawalsListProps> = ({ equipmentId }) => {
  const { data: withdrawals = [], isLoading, refetch } = useWithdrawals(equipmentId);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<EquipmentWithdrawal | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
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
      // const { error } = await supabase
      //   .from('equipment_withdrawals')
      //   .delete()
      //   .eq('id', withdrawalToDelete);

      // if (error) {
      //   throw error;
      // }

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

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Retiradas</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
        </div>
      ) : withdrawals && withdrawals.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell>{format(new Date(withdrawal.withdrawal_date || ''), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{format(new Date(withdrawal.expected_return_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{withdrawal.user_id}</TableCell>
                  <TableCell>{withdrawal.notes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openReturnModal(withdrawal)}>
                      <PackageCheck className="h-4 w-4 mr-2" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(withdrawal.id)}>
                      <Trash className="h-4 w-4 text-red-500" />
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
            <AlertDialogCancel onClick={handleClose} className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Return Modal */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedWithdrawal(null);
        }}
        equipmentWithdrawal={selectedWithdrawal || undefined}
        onSuccess={() => {
          refetch();
          setIsReturnModalOpen(false);
          setSelectedWithdrawal(null);
        }}
      />
    </div>
  );
};

export default WithdrawalsList;
