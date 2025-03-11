
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, ClipboardCheck, CalendarIcon, MapPin, ClockIcon, UsersIcon, User, FileText } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import ProductionModal from "@/components/productions/ProductionModal";
import { toast } from "sonner";

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

// Exemplo de produções (simulando dados do banco)
const initialProductions: Production[] = [
  {
    id: "1",
    name: "Campanha Nova Marca",
    client: "Empresa XYZ",
    date: new Date(2023, 11, 20),
    startTime: "09:00",
    endTime: "17:00",
    location: "Estúdio Central",
    notes: "Trazer equipamento de iluminação extra",
    briefingFile: "briefing-xyz.pdf",
    teamMembers: [
      { id: "1", name: "Filipe Silva", role: "coordenador" },
      { id: "3", name: "Arthur Leite", role: "filmmaker" },
      { id: "6", name: "Paulo Flecha", role: "ajudante" },
    ],
    createdAt: new Date(2023, 11, 15),
  },
  {
    id: "2",
    name: "Documentário Institucional",
    client: "Fundação ABC",
    date: new Date(2023, 11, 18),
    startTime: "08:00",
    endTime: "18:00",
    location: "Sede do cliente",
    notes: "Entrevistar 5 diretores",
    briefingFile: "doc-fundacao-abc.docx",
    teamMembers: [
      { id: "4", name: "Matheus Worish", role: "storymaker" },
      { id: "2", name: "Joao Gustavo", role: "filmmaker" },
    ],
    createdAt: new Date(2023, 11, 10),
  },
  {
    id: "3",
    name: "Teaser Evento Anual",
    client: "Conferência Tech",
    date: new Date(2023, 11, 22),
    startTime: "14:00",
    endTime: "20:00",
    location: "Centro de Convenções",
    notes: "Foco nos palestrantes principais",
    briefingFile: null,
    teamMembers: [
      { id: "5", name: "Felipe Vieira", role: "filmmaker" },
      { id: "1", name: "Filipe Silva", role: "fotografo" },
    ],
    createdAt: new Date(2023, 11, 12),
  },
];

const Productions = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);

  useEffect(() => {
    // Carregar produções do localStorage ou usar os dados iniciais
    const savedProductions = localStorage.getItem("productions");
    if (savedProductions) {
      const parsed = JSON.parse(savedProductions);
      // Convertendo strings de data de volta para objetos Date
      const productions = parsed.map((prod: any) => ({
        ...prod,
        date: new Date(prod.date),
        createdAt: new Date(prod.createdAt)
      }));
      setProductions(productions);
    } else {
      setProductions(initialProductions);
    }
  }, []);

  // Salvar produções no localStorage sempre que mudar
  useEffect(() => {
    if (productions.length > 0) {
      localStorage.setItem("productions", JSON.stringify(productions));
    }
  }, [productions]);

  const handleAddProduction = (production: Production) => {
    if (editingProduction) {
      // Atualizando produção existente
      setProductions(productions.map(p => 
        p.id === production.id ? production : p
      ));
      toast.success("Produção atualizada com sucesso!");
    } else {
      // Adicionando nova produção
      setProductions([...productions, production]);
      toast.success("Produção criada com sucesso!");
    }
    setIsModalOpen(false);
    setEditingProduction(null);
  };

  const handleDeleteProduction = (productionId: string) => {
    setProductions(productions.filter(p => p.id !== productionId));
    setIsModalOpen(false);
    setEditingProduction(null);
    toast.success("Produção cancelada com sucesso!");
  };

  const handleEditProduction = (production: Production) => {
    setEditingProduction(production);
    setIsModalOpen(true);
  };

  const filteredProductions = productions.filter(production => 
    production.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    production.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar produções por data
  const groupProductionsByDate = (productions: Production[]) => {
    const groups: { [key: string]: Production[] } = {};
    
    productions.forEach(production => {
      const dateKey = format(new Date(production.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(production);
    });
    
    // Ordenar as datas
    return Object.keys(groups)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(dateKey => ({
        date: new Date(dateKey),
        productions: groups[dateKey]
      }));
  };

  const groupedProductions = groupProductionsByDate(filteredProductions);

  // Função para formatar a data no estilo "Segunda-feira, 20 de Dezembro"
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

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Produções</h2>
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => {
          setEditingProduction(null);
          setIsModalOpen(true);
        }}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nova Produção
        </Button>
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
