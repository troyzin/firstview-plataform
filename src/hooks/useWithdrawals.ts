
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentWithdrawal } from '@/types/equipment';

export const useWithdrawals = (equipmentId?: string) => {
  return useQuery({
    queryKey: ['withdrawals', equipmentId],
    queryFn: async (): Promise<EquipmentWithdrawal[]> => {
      let query = supabase
        .from('equipment_withdrawals')
        .select(`
          *,
          equipment:equipment_id(*),
          user_id,
          production:production_id(*)
        `);

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }
      
      const { data, error } = await query.order('withdrawal_date', { ascending: false });

      if (error) throw error;
      
      // Get all user profiles separately to avoid join issues
      const userIds = [...new Set((data || []).map(item => item.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      // Format the data with proper relationships
      const processedData: EquipmentWithdrawal[] = (data || []).map(item => {
        const userProfile = profilesMap.get(item.user_id) || { id: item.user_id, full_name: 'Usuário não encontrado' };
        
        return {
          ...item,
          user: userProfile,
          equipment: item.equipment || { id: item.equipment_id, name: 'Equipamento não encontrado' },
          production: item.production_id 
            ? (item.production || { id: item.production_id, title: 'Produção não encontrada' }) 
            : null,
          status: item.status as "withdrawn" | "overdue" | "returned" | "returned_late",
          // We'll determine if it's scheduled based on withdrawal_date
          // If withdrawal_date is null, it's likely a scheduled item
          is_scheduled: item.withdrawal_date === null
        };
      });
      
      return processedData;
    },
  });
};
