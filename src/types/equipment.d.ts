export interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: string;
  scheduleToEdit?: EquipmentSchedule;
  onSuccess: () => void;
}

export interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentWithdrawal?: EquipmentWithdrawal;
  onSuccess: () => void;
}

export interface Receipt {
  id: string;
  withdrawal_date: string;
  equipment: {
    name: string;
    id: string;
  };
  user: {
    full_name: string;
    id: string;
  };
  production?: {
    title: string;
    id: string;
  } | null;
  expected_return_date: string;
  is_personal_use: boolean;
  notes: string | null;
  created_at: string;
  return_notes: string | null;
}
