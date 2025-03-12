
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentSchedule } from '@/types/equipment';

export const useSchedules = (equipmentId?: string) => {
  return useQuery({
    queryKey: ['schedules', equipmentId],
    queryFn: async (): Promise<EquipmentSchedule[]> => {
      let query = supabase
        .from('equipment_schedules')
        .select(`
          *,
          equipment:equipment_id(id, name),
          user:user_id(id, full_name),
          production:production_id(id, title)
        `);

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }
      
      const { data, error } = await query.order('start_date', { ascending: false });

      if (error) throw error;
      
      // Ensure all related data is properly formatted
      const processedData = (data || []).map(item => ({
        ...item,
        user: item.user || { id: item.user_id, full_name: 'Usuário não encontrado' },
        equipment: item.equipment || { id: item.equipment_id, name: 'Equipamento não encontrado' },
        production: item.production_id 
          ? (item.production || { id: item.production_id, title: 'Produção não encontrada' }) 
          : null
      }));
      
      return processedData as EquipmentSchedule[];
    },
  });
};
