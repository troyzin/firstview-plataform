
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ScheduleModal } from '@/components/equipment/ScheduleModal';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentSchedule } from '@/types/equipment';
import { useSchedules } from '@/hooks/useSchedules';
import { useQueryClient } from '@tanstack/react-query';

interface SchedulesListProps {
  equipmentId: string | null;
}

const SchedulesList: React.FC<SchedulesListProps> = ({ equipmentId }) => {
  const { data: schedules = [], isLoading, refetch } = useSchedules(equipmentId);
  const [open, setOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<EquipmentSchedule | null>(null);
  const [isStartingUse, setIsStartingUse] = useState(false);
  const queryClient = useQueryClient();

  const handleOpen = (id: string) => {
    setOpen(true);
    setScheduleToDelete(id);
  };

  const handleClose = () => {
    setOpen(false);
    setScheduleToDelete(null);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      const { error } = await supabase
        .from('equipment_schedules')
        .delete()
        .eq('id', scheduleToDelete);

      if (error) {
        throw error;
      }

      toast.success('Agendamento excluído com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Ocorreu um erro ao excluir o agendamento');
    } finally {
      handleClose();
    }
  };

  const handleEditSchedule = (schedule: EquipmentSchedule) => {
    setScheduleToEdit(schedule);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setScheduleToEdit(null);
  };

  // Function to start using scheduled equipment
  const startUsingEquipment = async (schedule: EquipmentSchedule) => {
    if (isStartingUse) return;
    
    setIsStartingUse(true);
    try {
      // First, check if equipment is available
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('status')
        .eq('id', schedule.equipment_id)
        .single();
      
      if (equipmentError) {
        throw equipmentError;
      }
      
      if (equipmentData.status !== 'disponível') {
        toast.error('Este equipamento não está disponível para uso no momento.');
        return;
      }
      
      // Create a withdrawal record
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('equipment_withdrawals')
        .insert({
          equipment_id: schedule.equipment_id,
          user_id: schedule.user_id,
          production_id: schedule.production_id,
          withdrawal_date: new Date().toISOString(),
          expected_return_date: schedule.end_date,
          notes: schedule.notes || 'Retirado de um agendamento',
          status: 'withdrawn'
        })
        .select()
        .single();
        
      if (withdrawalError) {
        throw withdrawalError;
      }
      
      // Update equipment status to "em uso"
      const { error: updateError } = await supabase
        .from('equipment')
        .update({ status: 'em uso' })
        .eq('id', schedule.equipment_id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Delete the schedule since it's now being used
      const { error: deleteError } = await supabase
        .from('equipment_schedules')
        .delete()
        .eq('id', schedule.id);
        
      if (deleteError) {
        throw deleteError;
      }
      
      toast.success(`${schedule.equipment?.name || 'Equipamento'} agora está em uso!`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({queryKey: ['schedules']});
      queryClient.invalidateQueries({queryKey: ['withdrawals']});
      queryClient.invalidateQueries({queryKey: ['equipments']});
      queryClient.invalidateQueries({queryKey: ['receipts']});
      
    } catch (error) {
      console.error('Erro ao iniciar uso do equipamento:', error);
      toast.error('Ocorreu um erro ao iniciar o uso do equipamento');
    } finally {
      setIsStartingUse(false);
    }
  };

  const isScheduleActive = (schedule: EquipmentSchedule) => {
    const now = new Date();
    const startDate = new Date(schedule.start_date);
    const endDate = new Date(schedule.end_date);
    
    return now >= startDate && now <= endDate;
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Agendamentos</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff3335]"></div>
        </div>
      ) : schedules && schedules.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{format(new Date(schedule.start_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{format(new Date(schedule.end_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>{schedule.equipment?.name || schedule.equipment_id}</TableCell>
                  <TableCell>{schedule.user?.full_name || schedule.user_id}</TableCell>
                  <TableCell>{schedule.notes || '-'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {isScheduleActive(schedule) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-[#ff3335] hover:text-white hover:bg-[#ff3335]"
                        onClick={() => startUsingEquipment(schedule)}
                        title="Iniciar Uso"
                        disabled={isStartingUse}
                      >
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEditSchedule(schedule)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(schedule.id)}>
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
          <Badge variant="outline" className="border-dashed">Nenhum agendamento encontrado para este equipamento.</Badge>
        </div>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-[#000000] border border-[#141414] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir este agendamento?
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

      {/* Edit Schedule Modal */}
      {scheduleToEdit && (
        <ScheduleModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          equipmentId={scheduleToEdit.equipment_id}
          scheduleToEdit={scheduleToEdit}
          onSuccess={() => {
            refetch();
            handleCloseEditModal();
          }}
        />
      )}
    </div>
  );
};

export default SchedulesList;
