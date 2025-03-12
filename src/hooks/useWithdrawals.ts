
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentWithdrawal } from '@/types/equipment';

export const useWithdrawals = () => {
  return useQuery({
    queryKey: ['withdrawals'],
    queryFn: async (): Promise<EquipmentWithdrawal[]> => {
      const { data, error } = await supabase
        .from('equipment_withdrawals')
        .select(`
          *,
          equipment:equipment_id(id, name),
          user:user_id(id, full_name),
          production:production_id(id, title)
        `)
        .order('withdrawal_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};
