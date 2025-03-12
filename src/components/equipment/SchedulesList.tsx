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
    toast.error('Agendamentos temporariamente desativados');
  };

  const handleEditSchedule = (schedule: EquipmentSchedule) => {
    toast.error('Agendamentos temporariamente desativados');
  };

  const startUsingEquipment = async (schedule: EquipmentSchedule) => {
    toast.error('Agendamentos temporariamente desativados');
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

  const handleClose = () => {
    setOpen(false);
    setScheduleToDelete(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setScheduleToEdit(null);
  };

  const isScheduleActive = (schedule: EquipmentSchedule) => {
    const now = new Date();
    const startDate = new Date(schedule.start_date);
    const endDate = new Date(schedule.end_date);
    
    return now >= startDate && now <= endDate;
  };

  return (
    <div className="opacity-50">
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
                        variant="default"
                        className="bg-[#ff3335] hover:bg-[#cc2a2b] text-white"
                        onClick={() => startUsingEquipment(schedule)}
                        disabled={true}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Iniciar Uso
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditSchedule(schedule)}
                      className="hover:bg-[#141414]"
                      disabled={true}
                    >
                      <Edit className="h-4 w-4 text-[#ff3335]" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpen(schedule.id)}
                      className="hover:bg-[#141414]"
                      disabled={true}
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
          <Badge variant="outline" className="border-dashed">Agendamentos temporariamente desativados</Badge>
        </div>
      )}

      {/* Keep modals but ensure they can't be opened */}
      <AlertDialog open={false} onOpenChange={() => {}}>
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

      {scheduleToEdit && (
        <ScheduleModal
          isOpen={false}
          onClose={() => {}}
          equipmentId={scheduleToEdit.equipment_id}
          scheduleToEdit={scheduleToEdit}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default SchedulesList;
