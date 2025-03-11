
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EquipmentModal from "@/components/equipment/EquipmentModal";
import MainLayout from "@/components/layout/MainLayout";

export default function Equipment() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const queryClient = useQueryClient();

  // Fetching equipment data
  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erro ao carregar equipamentos");
        throw error;
      }
      return data || [];
    },
  });

  // Delete equipment mutation
  const deleteEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("equipment")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Equipamento removido com sucesso");
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
    onError: (error) => {
      toast.error(`Erro ao remover equipamento: ${error.message}`);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este equipamento?")) {
      deleteEquipment.mutate(id);
    }
  };

  const handleEdit = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedEquipment(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEquipment(null);
  };

  return (
    <MainLayout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Equipamentos</h1>
          <Button 
            variant="default" 
            onClick={handleAddNew}
            className="bg-[#ff3335] hover:bg-[#cc292b] text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Equipamento
          </Button>
        </div>

        <Card className="bg-[#141414] border-0 text-white">
          <CardHeader>
            <CardTitle>Lista de Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Carregando equipamentos...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Nome</TableHead>
                    <TableHead className="text-white">Categoria</TableHead>
                    <TableHead className="text-white">Marca</TableHead>
                    <TableHead className="text-white">Modelo</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Quantidade</TableHead>
                    <TableHead className="text-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment && equipment.length > 0 ? (
                    equipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category || "-"}</TableCell>
                        <TableCell>{item.brand || "-"}</TableCell>
                        <TableCell>{item.model || "-"}</TableCell>
                        <TableCell>{item.status || "-"}</TableCell>
                        <TableCell>{item.quantity || 1}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4 text-[#ff3335]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-[#ff3335]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-4"
                      >
                        Nenhum equipamento encontrado. Adicione um equipamento para começar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {isModalOpen && (
          <EquipmentModal 
            isOpen={isModalOpen} 
            onClose={handleModalClose} 
            equipment={selectedEquipment} 
          />
        )}
      </div>
    </MainLayout>
  );
}
