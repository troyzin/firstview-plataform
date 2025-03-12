export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  serial_number?: string;
  acquisition_date?: string;
  notes?: string;
  image_url?: string;
  quantity: number;
  brand?: string;
  model?: string;
}

export interface UsageRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  startDate: Date;
  endDate: Date;
  productionId?: string;
  productionName?: string;
  responsibleName: string;
  status: "scheduled" | "in_progress" | "returned" | "overdue";
  notes?: string;
  returnedDate?: Date;
}

export interface HistoryEvent {
  id: string;
  equipmentId: string;
  equipmentName: string;
  eventType: "checkout" | "return" | "schedule" | "maintenance";
  date: Date;
  responsibleName: string;
  productionName?: string;
  notes?: string;
}

export interface Receipt {
  id: string;
  withdrawal_date: string;
  equipment_id: string;
  equipment?: {
    id: string;
    name: string;
  };
  user_id: string;
  user?: {
    id: string;
    full_name: string;
  };
  production_id: string;
  production?: {
    id: string;
    title: string;
  };
  expected_return_date: string;
  returned_date?: string;
  is_personal_use: boolean;
  notes?: string;
  status: "withdrawn" | "overdue" | "returned" | "returned_late";
  created_at: string;
}

export interface EquipmentWithdrawal {
  id: string;
  withdrawal_date: string;
  equipment_id: string;
  equipment?: {
    id: string;
    name: string;
  };
  user_id: string;
  user?: {
    id: string;
    full_name: string;
  };
  production_id: string;
  production?: {
    id: string;
    title: string;
  };
  expected_return_date: string;
  returned_date?: string;
  is_personal_use: boolean;
  notes?: string;
  status: "withdrawn" | "overdue" | "returned" | "returned_late";
  created_at: string;
  is_scheduled: boolean;
}
