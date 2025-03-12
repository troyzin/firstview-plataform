
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
          equipment:equipment_id(id, name),
          user:user_id(id, full_name),
          production:production_id(id, title)
        `);

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }
      
      const { data, error } = await query.order('withdrawal_date', { ascending: false });

      if (error) throw error;
      
      // Ensure all related data is properly formatted
      const processedData = (data || []).map(item => ({
        ...item,
        user: item.user || { id: item.user_id, full_name: 'Usuário não encontrado' },
        equipment: item.equipment || { id: item.equipment_id, name: 'Equipamento não encontrado' },
        production: item.production_id 
          ? (item.production || { id: item.production_id, title: 'Produção não encontrada' }) 
          : null,
        // Ensure status is one of the allowed types
        status: item.status as "withdrawn" | "overdue" | "returned" | "returned_late"
      }));
      
      return processedData as EquipmentWithdrawal[];
    },
  });
};
