
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface ScheduleData {
  id: string;
  equipment_id: string;
  user_id: string;
  production_id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string;
  equipment: {
    name: string;
  };
  user: {
    full_name: string;
  };
  production: {
    title: string;
  };
}

export const SchedulesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["equipment_schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_schedules")
        .select(`
          *,
          equipment:equipment_id(name),
          user:user_id(full_name),
          production:production_id(title)
        `)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredSchedules = schedules.filter((schedule) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      schedule.equipment?.name.toLowerCase().includes(searchLower) ||
      schedule.user?.full_name.toLowerCase().includes(searchLower) ||
      schedule.production?.title.toLowerCase().includes(searchLower)
    );
  });

  const getScheduleStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isAfter(now, end)) {
      return (
        <Badge className="bg-gray-600">
          <CheckCircle className="h-3 w-3 mr-1" /> Concluído
        </Badge>
      );
    } else if (isAfter(now, start) && isBefore(now, end)) {
      return (
        <Badge className="bg-[#ff3335]">
          <Clock className="h-3 w-3 mr-1" /> Em Andamento
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-600">
          <Calendar className="h-3 w-3 mr-1" /> Agendado
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center bg-[#141414] rounded-md px-3 py-2 w-full">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <Input
          placeholder="Buscar agendamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-[#141414]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipamento</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Produção</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  Nenhum agendamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {schedule.equipment?.name || "N/A"}
                  </TableCell>
                  <TableCell>{schedule.user?.full_name || "N/A"}</TableCell>
                  <TableCell>{schedule.production?.title || "N/A"}</TableCell>
                  <TableCell>
                    {format(new Date(schedule.start_date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(schedule.end_date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {getScheduleStatus(schedule.start_date, schedule.end_date)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
