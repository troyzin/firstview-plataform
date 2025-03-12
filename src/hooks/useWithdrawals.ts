
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
      
      // Certifique-se de que user e production estão presentes mesmo que null
      const processedData = (data || []).map(item => ({
        ...item,
        user: item.user || { id: item.user_id, full_name: 'Usuário não encontrado' },
        equipment: item.equipment || { id: item.equipment_id, name: 'Equipamento não encontrado' },
        production: item.production || (item.production_id ? { id: item.production_id, title: 'Produção não encontrada' } : null)
      }));
      
      return processedData as EquipmentWithdrawal[];
    },
  });
};
