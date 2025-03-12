
export interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: string;
  equipmentName?: string;
  scheduleToEdit?: EquipmentSchedule;
  onSuccess: () => void;
  isScheduling?: boolean;  // Add this to distinguish between scheduling and withdrawal
}

export interface WithdrawalType {
  id: string;
  formatted_id: string;  // For #0001 format
}

export interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId?: string;
  equipmentName?: string;
  equipmentWithdrawal?: EquipmentWithdrawal;
  onSuccess: () => void;
  withdrawalType?: 'schedule' | 'immediate';
}

export interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal?: any;  // We'll keep this for backward compatibility
  receipt?: Receipt;  // Add this new property
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
  returned_date: string | null;
  status: "withdrawn" | "overdue" | "returned" | "returned_late";
}

export interface EquipmentSchedule {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id?: string | null;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string | null;
  equipment?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    full_name: string;
  };
  production?: {
    id: string;
    title: string;
  } | null;
}

export interface EquipmentWithdrawal {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id?: string | null;
  withdrawal_date: string | null;
  expected_return_date: string;
  returned_date: string | null;
  status: "withdrawn" | "overdue" | "returned" | "returned_late";
  notes: string | null;
  is_personal_use: boolean | null;
  equipment?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    full_name: string;
  };
  production?: {
    id: string;
    title: string;
  } | null;
  is_scheduled?: boolean;
}
