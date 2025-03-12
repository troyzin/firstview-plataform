
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentSchedule } from '@/types/equipment';

export const useSchedules = () => {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async (): Promise<EquipmentSchedule[]> => {
      const { data, error } = await supabase
        .from('equipment_schedules')
        .select(`
          *,
          equipment:equipment_id(id, name),
          user:user_id(id, full_name),
          production:production_id(id, title)
        `);

      if (error) throw error;
      
      // Certifique-se de que user e production estão presentes mesmo que null
      const processedData = (data || []).map(item => ({
        ...item,
        user: item.user || { id: item.user_id, full_name: 'Usuário não encontrado' },
        equipment: item.equipment || { id: item.equipment_id, name: 'Equipamento não encontrado' },
        production: item.production || (item.production_id ? { id: item.production_id, title: 'Produção não encontrada' } : null)
      }));
      
      return processedData as EquipmentSchedule[];
    },
  });
};
