
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HistoryEvent } from "@/types/equipment";
import { format } from "date-fns";

export const useEquipmentHistory = () => {
  return useQuery({
    queryKey: ["equipment-history"],
    queryFn: async (): Promise<HistoryEvent[]> => {
      try {
        // Fetch withdrawals and returns
        const { data: withdrawals, error: withdrawalsError } = await supabase
          .from("equipment_withdrawals")
          .select(`
            id,
            withdrawal_date,
            returned_date,
            equipment:equipment_id(id, name),
            user:user_id(id),
            user_profile:user_id(full_name),
            production:production_id(id, title),
            notes,
            return_notes,
            status,
            is_personal_use
          `)
          .order('withdrawal_date', { ascending: false });

        if (withdrawalsError) throw withdrawalsError;

        // Transform the data into HistoryEvent format
        const events: HistoryEvent[] = [];

        withdrawals?.forEach(withdrawal => {
          // Add withdrawal event
          events.push({
            id: `${withdrawal.id}-withdrawal`,
            equipmentId: withdrawal.equipment?.id || '',
            equipmentName: withdrawal.equipment?.name || 'Unknown Equipment',
            eventType: "checkout",
            date: new Date(withdrawal.withdrawal_date),
            responsibleName: withdrawal.user_profile?.full_name || 'Unknown User',
            productionName: withdrawal.is_personal_use ? 'Personal Use' : (withdrawal.production?.title || undefined),
            notes: withdrawal.notes || undefined
          });

          // If there's a return date, add return event
          if (withdrawal.returned_date) {
            events.push({
              id: `${withdrawal.id}-return`,
              equipmentId: withdrawal.equipment?.id || '',
              equipmentName: withdrawal.equipment?.name || 'Unknown Equipment',
              eventType: "return",
              date: new Date(withdrawal.returned_date),
              responsibleName: withdrawal.user_profile?.full_name || 'Unknown User',
              productionName: withdrawal.is_personal_use ? 'Personal Use' : (withdrawal.production?.title || undefined),
              notes: withdrawal.return_notes || undefined
            });
          }
        });

        return events;
      } catch (error) {
        console.error("Error fetching equipment history:", error);
        return [];
      }
    }
  });
};
