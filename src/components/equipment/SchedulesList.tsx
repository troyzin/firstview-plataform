
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Plus } from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import ScheduleModal from './ScheduleModal';
import { EquipmentSchedule } from '@/types/equipment';
import { useSchedules } from '@/hooks/useSchedules';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
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

const SchedulesList: React.FC = () => {
  const [schedules, setSchedules] = useState<EquipmentSchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<EquipmentSchedule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  
  const { data: schedulesData, isLoading, error, refetch } = useSchedules();

  useEffect(() => {
    if (schedulesData) {
      // Converte cada schedule para o formato esperado
      const processedData = schedulesData.map(item => ({
        ...item,
        user: item.user || { id: item.user_id, full_name: 'Usuário não encontrado' },
        equipment: item.equipment || { id: item.equipment_id, name: 'Equipamento não encontrado' },
        production: item.production || (item.production_id ? { id: item.production_id, title: 'Produção não encontrada' } : null)
      }));
      
      setSchedules(processedData as EquipmentSchedule[]);
    }
  }, [schedulesData]);

  const handleOpenModal = (schedule?: EquipmentSchedule) => {
    setSelectedSchedule(schedule || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    
    try {
      const { error } = await supabase
        .from('equipment_schedules')
        .delete()
        .eq('id', scheduleToDelete);
        
      if (error) throw error;
      
      setSchedules(prevSchedules => 
        prevSchedules.filter(schedule => schedule.id !== scheduleToDelete)
      );
      
      toast.success('Agendamento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error('Erro ao excluir agendamento');
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleDelete = (id: string) => {
    setScheduleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const getScheduleStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (isAfter(now, end)) {
      return 'Concluído';
    } else if (isAfter(now, start) && isBefore(now, end)) {
      return 'Em andamento';
    } else {
      return 'Agendado';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'text-green-500';
      case 'Em andamento':
        return 'text-[#ff3335]';
      default:
        return 'text-yellow-500';
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Carregando agendamentos...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erro ao carregar agendamentos</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Agendamentos</h2>
        <Button 
          onClick={() => handleOpenModal()} 
          variant="default" 
          className="bg-[#ff3335] hover:bg-red-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
        </Button>
      </div>
      
      {schedules.length === 0 ? (
        <Card className="bg-[#141414] border-0 text-white">
          <CardContent className="pt-6 text-center">
            Nenhum agendamento encontrado
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="bg-[#141414] border-0 text-white overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-white truncate">
                    {schedule.equipment?.name}
                  </CardTitle>
                  <div 
                    className={`text-sm font-medium ${getStatusColor(
                      getScheduleStatus(schedule.start_date, schedule.end_date)
                    )}`}
                  >
                    {getScheduleStatus(schedule.start_date, schedule.end_date)}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {schedule.user?.full_name}
                </div>
                {schedule.production?.title && (
                  <div className="text-sm text-gray-400">
                    Produção: {schedule.production.title}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Início:</span>
                  <span>{format(new Date(schedule.start_date), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Término:</span>
                  <span>{format(new Date(schedule.end_date), 'dd/MM/yyyy')}</span>
                </div>
                
                {schedule.notes && (
                  <>
                    <Separator className="my-2 bg-gray-700" />
                    <div className="text-sm">
                      <span className="text-gray-400">Observações:</span>
                      <p className="mt-1 text-white">{schedule.notes}</p>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    onClick={() => handleOpenModal(schedule)}
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-[#333]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(schedule.id)}
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-[#333]"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {isModalOpen && (
        <ScheduleModal
          open={isModalOpen}
          onClose={() => {
            handleCloseModal();
            refetch();
          }}
          schedule={selectedSchedule}
        />
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#141414] text-white border-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
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

export default SchedulesList;
