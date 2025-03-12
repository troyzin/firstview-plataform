
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentSchedule } from '@/types/equipment';

export const useSchedules = (equipmentId?: string | null) => {
  return useQuery({
    queryKey: ['schedules', equipmentId],
    queryFn: async (): Promise<EquipmentSchedule[]> => {
      console.log('Fetching schedules with equipmentId:', equipmentId);
      
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

      if (error) {
        console.error('Error fetching schedules:', error);
        throw error;
      }
      
      console.log('Schedules data:', data);
      
      // Get all user profiles separately to avoid join issues
      const userIds = [...new Set((data || []).map(item => item.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      // Ensure all related data is properly formatted
      const processedData = (data || []).map(item => {
        const userProfile = profilesMap.get(item.user_id) || { id: item.user_id, full_name: 'Usuário não encontrado' };
        
        return {
          ...item,
          user: userProfile,
          equipment: item.equipment || { id: item.equipment_id, name: 'Equipamento não encontrado' },
          production: item.production_id 
            ? (item.production || { id: item.production_id, title: 'Produção não encontrada' }) 
            : null
        };
      });
      
      return processedData as EquipmentSchedule[];
    },
  });
};
