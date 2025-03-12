
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
        `)
        .returns<EquipmentSchedule[]>();

      if (error) throw error;
      return data || [];
    },
  });
};
