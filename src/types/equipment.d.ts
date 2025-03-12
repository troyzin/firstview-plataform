
export interface Equipment {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  quantity?: number;
  acquisition_date?: string;
  status?: string;
  notes?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EquipmentSchedule {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id?: string;
  start_date: string;
  end_date: string;
  notes?: string;
  created_at?: string;
  equipment?: { id: string; name: string };
  user?: { id: string; full_name: string } | any; // Aceita erro temporariamente
  production?: { id: string; title: string } | any; // Aceita erro temporariamente
}

export interface EquipmentWithdrawal {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id?: string;
  withdrawal_date?: string;
  expected_return_date: string;
  returned_date?: string;
  status: string; // Alterado para aceitar string em vez de union type
  notes?: string;
  is_personal_use?: boolean;
  equipment?: { id: string; name: string };
  user?: { id: string; full_name: string } | any; // Aceita erro temporariamente
  production?: { id: string; title: string } | any; // Aceita erro temporariamente
}

export interface Receipt extends EquipmentWithdrawal {
  created_at?: string;
  return_notes?: string;
}
