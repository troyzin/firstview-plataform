
import React, { useState } from "react";
import { Plus, Search, Trash2, Edit, Building, Mail, Phone, User } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

// Tipo para clientes
type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  productionsCount: number;
  createdAt: Date;
};

// Dados iniciais de exemplo
const initialClients: Client[] = [
  {
    id: "1",
    name: "Maria Silva",
    company: "Beauty Glow Cosméticos",
    email: "maria.silva@beautyglow.com",
    phone: "(11) 98765-4321",
    address: "Av. Paulista, 1000, São Paulo - SP",
    notes: "Cliente desde 2020. Prefere reuniões presenciais.",
    productionsCount: 3,
    createdAt: new Date(2020, 5, 15),
  },
  {
    id: "2",
    name: "João Pereira",
    company: "Banco Nacional",
    email: "joao.pereira@banconacional.com",
    phone: "(11) 91234-5678",
    address: "Av. Faria Lima, 2000, São Paulo - SP",
    notes: "Contato principal para o departamento de marketing. Sempre muito exigente com os prazos.",
    productionsCount: 2,
    createdAt: new Date(2021, 3, 10),
  },
  {
    id: "3",
    name: "Ana Ferreira",
    company: "Tech Innovations",
    email: "ana.ferreira@techinnovations.com",
    phone: "(21) 99876-5432",
    address: "Rua do Passeio, 50, Rio de Janeiro - RJ",
    notes: "Prefere comunicação por e-mail. Tem interesse em produções de alta tecnologia.",
    productionsCount: 1,
    createdAt: new Date(2022, 1, 8),
  },
  {
    id: "4",
    name: "Carlos Santos",
    company: "ONG Futuro Melhor",
    email: "carlos.santos@futuromelhoor.org",
    phone: "(21) 98765-4321",
    address: "Rua Voluntários da Pátria, 300, Rio de Janeiro - RJ",
    notes: "Organização sem fins lucrativos. Orçamento limitado, mas projetos muito gratificantes.",
    productionsCount: 1,
    createdAt: new Date(2022, 7, 15),
  },
];

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Estado para o formulário
  const [clientForm, setClientForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Filtrar clientes pela busca
  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      searchTerm === "" ||
      client.name.toLowerCase().includes(searchLower) ||
      client.company.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower)
    );
  });

  // Abrir modal para criar novo cliente
  const openCreateModal = () => {
    setClientForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
    setEditMode(false);
    setIsModalOpen(true);
  };

  // Abrir modal para editar cliente
  const openEditModal = (client: Client) => {
    setClientForm({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
    });
    setSelectedClient(client);
    setEditMode(true);
    setIsModalOpen(true);
  };

  // Abrir diálogo de confirmar exclusão
  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  // Atualizar campo do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientForm({
      ...clientForm,
      [name]: value,
    });
  };

  // Criar ou atualizar cliente
  const handleSaveClient = () => {
    if (editMode && selectedClient) {
      // Atualizar cliente existente
      const updatedClients = clients.map((client) =>
        client.id === selectedClient.id
          ? {
              ...client,
              ...clientForm,
            }
          : client
      );
      setClients(updatedClients);
      toast.success("Cliente atualizado com sucesso!");
    } else {
      // Criar novo cliente
      const newClient: Client = {
        id: Date.now().toString(),
        ...clientForm,
        productionsCount: 0,
        createdAt: new Date(),
      };
      setClients([...clients, newClient]);
      toast.success("Cliente criado com sucesso!");
    }
    setIsModalOpen(false);
  };

  // Excluir cliente
  const handleDeleteClient = () => {
    if (selectedClient) {
      setClients(clients.filter((client) => client.id !== selectedClient.id));
      toast.success("Cliente excluído com sucesso!");
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Clientes</h1>
            
            <div className="flex items-center bg-gray-800 rounded-md px-3 py-2">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-60"
              />
            </div>
          </div>
          
          <Button 
            onClick={openCreateModal} 
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {filteredClients.length === 0 ? (
            <div className="col-span-full bg-gray-800 rounded-lg p-8 text-center">
              <User className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">Nenhum cliente encontrado</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchTerm
                  ? `Não encontramos clientes com o termo "${searchTerm}"`
                  : "Não há clientes cadastrados no sistema"}
              </p>
              <Button 
                onClick={openCreateModal} 
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Novo Cliente
              </Button>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{client.name}</h3>
                    <Badge className="bg-blue-600">{client.productionsCount} produções</Badge>
                  </div>
                  
                  <p className="text-gray-400 mb-4">
                    <Building className="h-4 w-4 inline mr-1" />
                    {client.company}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {client.phone}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(client);
                      }}
                      className="text-red-500 hover:text-red-400 hover:bg-gray-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(client);
                      }}
                      className="text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para criar/editar cliente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editMode ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editMode
                ? "Edite as informações do cliente."
                : "Preencha as informações para cadastrar um novo cliente."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome*</Label>
              <Input
                id="name"
                name="name"
                value={clientForm.name}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700"
                placeholder="Nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Empresa*</Label>
              <Input
                id="company"
                name="company"
                value={clientForm.company}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700"
                placeholder="Nome da empresa"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={clientForm.email}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700"
                placeholder="email@exemplo.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone*</Label>
              <Input
                id="phone"
                name="phone"
                value={clientForm.phone}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700"
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={clientForm.address}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700"
                placeholder="Endereço completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                value={clientForm.notes}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700 min-h-[100px]"
                placeholder="Informações adicionais sobre o cliente..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-700">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={handleSaveClient}
              disabled={!clientForm.name || !clientForm.company || !clientForm.email || !clientForm.phone}
              className="bg-red-600 hover:bg-red-700"
            >
              {editMode ? "Atualizar Cliente" : "Cadastrar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir o cliente {selectedClient?.name}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-700">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteClient}
              className="bg-red-700 hover:bg-red-800"
            >
              Excluir Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Clients;
