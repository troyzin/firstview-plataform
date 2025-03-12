
export interface Equipment {
  id: string;
  name: string;
  category?: string;
  status?: string;
  serial_number?: string;
  acquisition_date?: string;
  notes?: string;
  image_url?: string;
  brand?: string;
  model?: string;
}

export interface EquipmentSchedule {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id?: string;
  start_date: string;
  end_date: string;
  notes?: string;
  created_at: string;
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
  };
}

export interface EquipmentWithdrawal {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id?: string;
  withdrawal_date: string;
  expected_return_date: string;
  returned_date?: string;
  status: 'withdrawn' | 'overdue' | 'returned' | 'returned_late';
  notes?: string;
  is_personal_use: boolean;
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
  };
}

export interface Receipt {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id?: string;
  withdrawal_date: string;
  expected_return_date: string;
  returned_date?: string;
  status: string;
  notes?: string;
  return_notes?: string;
  created_at: string;
  is_personal_use: boolean;
  equipment_name: string;
  user_name: string;
  production_name?: string;
}
