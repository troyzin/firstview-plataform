
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  SearchIcon, 
  UserIcon, 
  MailIcon, 
  PhoneIcon,
  BuildingIcon,
  MoreVertical,
  Edit,
  Trash,
  FileText,
  Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  productionsCount: number;
};

// Dados iniciais de exemplo
const initialClients: Client[] = [
  {
    id: "1",
    name: "João Silva",
    company: "Empresa XYZ",
    email: "joao.silva@xyz.com",
    phone: "(11) 98765-4321",
    address: "Rua Exemplo, 123 - São Paulo, SP",
    notes: "Cliente desde 2021, prefere reuniões pela manhã",
    productionsCount: 5
  },
  {
    id: "2",
    name: "Maria Oliveira",
    company: "Fundação ABC",
    email: "maria@fundacaoabc.org",
    phone: "(11) 91234-5678",
    address: "Av. Principal, 500 - São Paulo, SP",
    notes: "Demanda principalmente documentários institucionais",
    productionsCount: 3
  },
  {
    id: "3",
    name: "Pedro Souza",
    company: "Conferência Tech",
    email: "pedro@conftech.com",
    phone: "(11) 99876-5432",
    address: "Rua da Tecnologia, 200 - São Paulo, SP",
    notes: "Evento anual em novembro, contato preliminar em julho",
    productionsCount: 1
  },
];

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Form states
  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Carregar clientes do localStorage ou usar os dados iniciais
    const savedClients = localStorage.getItem("clients");
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      setClients(initialClients);
    }
  }, []);

  // Salvar clientes no localStorage sempre que mudar
  useEffect(() => {
    if (clients.length > 0) {
      localStorage.setItem("clients", JSON.stringify(clients));
    }
  }, [clients]);

  // Configurar o formulário ao editar um cliente
  useEffect(() => {
    if (editingClient) {
      setClientName(editingClient.name);
      setCompany(editingClient.company);
      setEmail(editingClient.email);
      setPhone(editingClient.phone);
      setAddress(editingClient.address);
      setNotes(editingClient.notes);
    } else {
      resetForm();
    }
  }, [editingClient]);

  const resetForm = () => {
    setClientName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setAddress("");
    setNotes("");
  };

  const handleSaveClient = () => {
    if (!clientName || !company || !email) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    const clientData = {
      id: editingClient ? editingClient.id : Date.now().toString(),
      name: clientName,
      company,
      email,
      phone,
      address,
      notes,
      productionsCount: editingClient ? editingClient.productionsCount : 0
    };

    if (editingClient) {
      // Atualizar cliente existente
      setClients(clients.map(c => c.id === clientData.id ? clientData : c));
      toast.success("Cliente atualizado com sucesso!");
    } else {
      // Adicionar novo cliente
      setClients([...clients, clientData]);
      toast.success("Cliente adicionado com sucesso!");
    }

    setIsModalOpen(false);
    setEditingClient(null);
    resetForm();
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(c => c.id !== clientId));
    toast.success("Cliente removido com sucesso!");
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Clientes</h2>
        <Button 
          className="bg-red-600 hover:bg-red-700" 
          onClick={() => {
            setEditingClient(null);
            setIsModalOpen(true);
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 bg-gray-800 border-gray-700"
            placeholder="Buscar por nome, empresa ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum cliente encontrado</h3>
            <p className="text-gray-500 mb-6">Adicione um novo cliente para começar</p>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                setEditingClient(null);
                setIsModalOpen(true);
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-left">
                  <th className="p-4 font-medium">Nome / Empresa</th>
                  <th className="p-4 font-medium">Contato</th>
                  <th className="p-4 font-medium">Produções</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-800/50 cursor-pointer" onClick={() => openEditModal(client)}>
                    <td className="p-4">
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-400">{client.company}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-300 mb-1">
                        <MailIcon className="h-4 w-4 mr-2 text-gray-500" />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-300">
                          <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                          {client.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        {client.productionsCount} produções
                      </div>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem 
                            className="hover:bg-gray-700 cursor-pointer"
                            onClick={() => openEditModal(client)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="hover:bg-gray-700 cursor-pointer text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para adicionar/editar cliente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome*</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa*</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Nome da empresa"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email*</Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 pl-10"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-gray-800 border-gray-700 pl-10"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <div className="relative">
                <BuildingIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-gray-800 border-gray-700 pl-10"
                  placeholder="Endereço completo"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-800 border-gray-700 min-h-[100px]"
                placeholder="Informações adicionais sobre o cliente..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingClient(null);
                resetForm();
              }}
              className="bg-gray-800 border-gray-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveClient}
              disabled={!clientName || !company || !email}
              className="bg-red-600 hover:bg-red-700"
            >
              {editingClient ? "Atualizar" : "Adicionar"} Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ClientsPage;
