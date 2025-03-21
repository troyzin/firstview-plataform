
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentWithdrawal } from '@/types/equipment';

export const useWithdrawals = (equipmentId?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['withdrawals', equipmentId],
    queryFn: async (): Promise<EquipmentWithdrawal[]> => {
      try {
        console.log("Fetching withdrawals for equipment ID:", equipmentId);
        
        let query = supabase
          .from('equipment_withdrawals')
          .select(`
            *,
            equipment:equipment_id(*)
          `);

        if (equipmentId) {
          query = query.eq('equipment_id', equipmentId);
        }
        
        const { data, error } = await query.order('withdrawal_date', { ascending: false });

        if (error) {
          console.error("Error fetching withdrawals:", error);
          throw error;
        }
        
        console.log("Raw withdrawals data:", data?.length || 0);
        
        // Get all user profiles separately 
        const userIds = [...new Set((data || []).map(item => item.user_id))];
        
        console.log("User IDs to fetch:", userIds.length);
        
        if (userIds.length === 0) {
          console.log("No user IDs to fetch profiles for");
          return [];
        }
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        console.log("Profiles data:", profilesData?.length || 0);
        
        const profilesMap = new Map();
        (profilesData || []).forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
        
        // Get productions separately
        const productionIds = [...new Set((data || [])
          .filter(item => item.production_id)
          .map(item => item.production_id))];
          
        let productionsMap = new Map();
        
        if (productionIds.length > 0) {
          const { data: productionsData, error: productionsError } = await supabase
            .from('productions')
            .select('id, title')
            .in('id', productionIds as string[]);
            
          if (productionsError) {
            console.error("Error fetching productions:", productionsError);
          } else {
            (productionsData || []).forEach(prod => {
              productionsMap.set(prod.id, prod);
            });
          }
        }
        
        // Format the data with proper relationships
        const processedData = (data || []).map(item => {
          const userProfile = profilesMap.get(item.user_id) || { id: item.user_id, full_name: 'Usuário não encontrado' };
          const production = item.production_id ? productionsMap.get(item.production_id) : null;
          
          return {
            ...item,
            user: userProfile,
            equipment: item.equipment || { id: item.equipment_id, name: 'Equipamento não encontrado' },
            production: production || (item.production_id ? { id: item.production_id, title: 'Produção não encontrada' } : null),
            status: item.status as "withdrawn" | "overdue" | "returned" | "returned_late",
            // Ensure created_at exists
            created_at: item.withdrawal_date || new Date().toISOString(),
            // We'll determine if it's scheduled based on withdrawal_date
            // If withdrawal_date is null, it's likely a scheduled item
            is_scheduled: item.withdrawal_date === null
          };
        });
        
        console.log("Processed withdrawals data:", processedData.length);
        return processedData as EquipmentWithdrawal[];
      } catch (error) {
        console.error("Error in useWithdrawals:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3
  });
};
