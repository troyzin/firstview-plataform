
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, ClipboardCheck, CalendarIcon, MapPin, ClockIcon, UsersIcon, FileText } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import ProductionModal from "@/components/productions/ProductionModal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

type Production = {
  id: string;
  name: string;
  client: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  briefingFile: string | null;
  teamMembers: TeamMember[];
  createdAt: Date;
};

const Productions = () => {
  const { hasAction, user } = useAuth();
  const canAddProduction = hasAction('add_production');
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch productions from Supabase
  const { data: productions = [], isLoading, error } = useQuery({
    queryKey: ['productions'],
    queryFn: async () => {
      try {
        console.log("Fetching productions from Supabase...");
        const { data, error } = await supabase
          .from('productions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        console.log("Fetched productions:", data);
        // Transform the data to match our Production type
        return data.map((item: any) => ({
          id: item.id,
          name: item.title,
          client: item.client_name || "Unknown Client",
          date: new Date(item.start_date),
          startTime: item.start_time || "09:00",
          endTime: item.end_time || "17:00",
          location: item.location || "",
          notes: item.description || "",
          briefingFile: item.briefing_file || null,
          teamMembers: item.team_members || [],
          createdAt: new Date(item.created_at)
        }));
      } catch (error) {
        console.error("Error fetching productions:", error);
        toast.error("Erro ao carregar produções!");
        return [];
      }
    }
  });
  
  // Add production mutation
  const addProductionMutation = useMutation({
    mutationFn: async (production: Production) => {
      const { data, error } = await supabase
        .from('productions')
        .insert({
          id: production.id,
          title: production.name,
          client_name: production.client,
          start_date: production.date.toISOString(),
          start_time: production.startTime,
          end_time: production.endTime,
          location: production.location,
          description: production.notes,
          briefing_file: production.briefingFile,
          team_members: production.teamMembers
        })
        .select();
        
      if (error) {
        console.error("Error adding production:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
      setIsModalOpen(false);
      setEditingProduction(null);
      toast.success("Produção criada com sucesso!");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Erro ao criar produção!");
    }
  });
  
  // Update production mutation
  const updateProductionMutation = useMutation({
    mutationFn: async (production: Production) => {
      const { data, error } = await supabase
        .from('productions')
        .update({
          title: production.name,
          client_name: production.client,
          start_date: production.date.toISOString(),
          start_time: production.startTime,
          end_time: production.endTime,
          location: production.location,
          description: production.notes,
          briefing_file: production.briefingFile,
          team_members: production.teamMembers
        })
        .eq('id', production.id)
        .select();
        
      if (error) {
        console.error("Error updating production:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
      setIsModalOpen(false);
      setEditingProduction(null);
      toast.success("Produção atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Erro ao atualizar produção!");
    }
  });
  
  // Delete production mutation
  const deleteProductionMutation = useMutation({
    mutationFn: async (productionId: string) => {
      const { error } = await supabase
        .from('productions')
        .delete()
        .eq('id', productionId);
        
      if (error) {
        console.error("Error deleting production:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
      setIsModalOpen(false);
      setEditingProduction(null);
      toast.success("Produção cancelada com sucesso!");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Erro ao cancelar produção!");
    }
  });

  const handleAddProduction = (production: Production) => {
    console.log("Saving production:", production);
    
    if (editingProduction) {
      updateProductionMutation.mutate(production);
    } else {
      // Create new production
      addProductionMutation.mutate(production);
    }
  };

  const handleDeleteProduction = (productionId: string) => {
    deleteProductionMutation.mutate(productionId);
  };

  const handleEditProduction = (production: Production) => {
    setEditingProduction(production);
    setIsModalOpen(true);
  };

  const filteredProductions = productions.filter((production: Production) => 
    production.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    production.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupProductionsByDate = (productions: Production[]) => {
    const groups: { [key: string]: Production[] } = {};
    
    productions.forEach(production => {
      const dateKey = format(new Date(production.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(production);
    });
    
    return Object.keys(groups)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(dateKey => ({
        date: new Date(dateKey),
        productions: groups[dateKey]
      }));
  };

  const groupedProductions = groupProductionsByDate(filteredProductions);

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (isSameDay(date, today)) {
      return "Hoje";
    } else if (isSameDay(date, tomorrow)) {
      return "Amanhã";
    } else {
      return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <ClipboardCheck className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Erro ao carregar produções</h3>
          <p className="text-gray-500 mb-6">Ocorreu um erro ao tentar carregar as produções</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['productions'] })}
            className="bg-red-600 hover:bg-red-700"
          >
            Tentar novamente
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Produções</h2>
        {canAddProduction && (
          <Button className="bg-red-600 hover:bg-red-700" onClick={() => {
            setEditingProduction(null);
            setIsModalOpen(true);
          }}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Nova Produção
          </Button>
        )}
      </div>

      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 bg-gray-800 border-gray-700"
            placeholder="Buscar produção ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-8">
        {groupedProductions.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg">
            <ClipboardCheck className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhuma produção encontrada</h3>
            <p className="text-gray-500 mb-6">Crie uma nova produção para começar</p>
            {canAddProduction && (
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setEditingProduction(null);
                  setIsModalOpen(true);
                }}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Nova Produção
              </Button>
            )}
          </div>
        ) : (
          groupedProductions.map(group => (
            <div key={group.date.toISOString()} className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-800 flex items-center">
                <CalendarIcon className="text-gray-400 mr-2 h-5 w-5" />
                <h3 className="font-medium capitalize">{formatDateHeader(group.date)}</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {group.productions.map(production => (
                  <div 
                    key={production.id} 
                    className="p-4 hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => handleEditProduction(production)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-white">{production.name}</h4>
                        <p className="text-gray-400 text-sm">{production.client}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-300 text-sm">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{production.startTime} - {production.endTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mt-3">
                      {production.location && (
                        <div className="flex items-center text-gray-400">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{production.location}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-400">
                        <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{production.teamMembers.length} membros</span>
                      </div>
                      {production.briefingFile && (
                        <div className="flex items-center text-gray-400">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Briefing anexado</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <ProductionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduction(null);
        }}
        onSave={handleAddProduction}
        onDelete={handleDeleteProduction}
        editMode={!!editingProduction}
        production={editingProduction || undefined}
      />
    </MainLayout>
  );
};

export default Productions;
