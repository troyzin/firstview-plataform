
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ScheduleModal } from '@/components/equipment/ScheduleModal';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentSchedule } from '@/types/equipment';
import { useSchedules } from '@/hooks/useSchedules';

interface SchedulesListProps {
  equipmentId: string | null;
}

const SchedulesList: React.FC<SchedulesListProps> = ({ equipmentId }) => {
  const { data: schedules = [], isLoading, refetch } = useSchedules(equipmentId);
  const [open, setOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<EquipmentSchedule | null>(null);

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

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Agendamentos</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
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
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditSchedule(schedule)}>
                      <Edit className="h-4 w-4 mr-2" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(schedule.id)}>
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
            <AlertDialogCancel onClick={handleClose} className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
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
