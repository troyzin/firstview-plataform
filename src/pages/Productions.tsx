
import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, Calendar as CalendarIcon, Info } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ProductionModal from "../components/productions/ProductionModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";

// Tipo para as produções
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
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  createdAt: Date;
};

// Dados iniciais de exemplo
const initialProductions: Production[] = [
  {
    id: "1",
    name: "Campanha de Marketing - Verão 2023",
    client: "Empresa de Cosméticos Beauty Glow",
    date: new Date(2023, 6, 15), // 15 de Julho de 2023
    startTime: "09:00",
    endTime: "17:00",
    location: "Praia de Copacabana, Rio de Janeiro",
    notes: "Levar protetor solar e roupas extras. Previsão de tempo ensolarado.",
    briefingFile: "briefing-campanha-verao.pdf",
    teamMembers: [
      { id: "101", name: "Ana Silva", role: "coordenador" },
      { id: "102", name: "Carlos Santos", role: "filmmaker" },
      { id: "103", name: "Juliana Oliveira", role: "fotografo" },
    ],
    createdAt: new Date(2023, 6, 1),
  },
  {
    id: "2",
    name: "Vídeo Institucional",
    client: "Banco Nacional",
    date: new Date(2023, 6, 22), // 22 de Julho de 2023
    startTime: "08:30",
    endTime: "15:30",
    location: "Sede do Banco - Av. Paulista, 1000, São Paulo",
    notes: "Agendar entrevistas com diretores. Verificar iluminação do local.",
    briefingFile: "briefing-video-institucional.pdf",
    teamMembers: [
      { id: "201", name: "Marcos Lima", role: "coordenador" },
      { id: "202", name: "Pedro Alves", role: "filmmaker" },
      { id: "203", name: "Fernanda Costa", role: "storymaker" },
    ],
    createdAt: new Date(2023, 6, 5),
  },
  {
    id: "3",
    name: "Ensaio Fotográfico Produto",
    client: "Tech Innovations",
    date: new Date(2023, 7, 5), // 5 de Agosto de 2023
    startTime: "10:00",
    endTime: "14:00",
    location: "Estúdio Central - Rua Augusta, 500, São Paulo",
    notes: "Produtos serão entregues no dia. Preparar fundo branco e iluminação suave.",
    briefingFile: "briefing-ensaio-produtos.pdf",
    teamMembers: [
      { id: "301", name: "Roberto Dias", role: "fotografo" },
      { id: "302", name: "Carla Mendes", role: "ajudante" },
    ],
    createdAt: new Date(2023, 7, 1),
  },
  {
    id: "4",
    name: "Documentário Social",
    client: "ONG Futuro Melhor",
    date: new Date(), // Hoje
    startTime: "07:00",
    endTime: "18:00",
    location: "Comunidade Vila Esperança, Rio de Janeiro",
    notes: "Levar equipamentos à prova d'água. Entrevistar moradores e líderes comunitários.",
    briefingFile: "briefing-documentario.pdf",
    teamMembers: [
      { id: "401", name: "Lucas Ferreira", role: "coordenador" },
      { id: "402", name: "Marina Santos", role: "filmmaker" },
      { id: "403", name: "Thiago Oliveira", role: "filmmaker" },
      { id: "404", name: "Camila Rocha", role: "fotografo" },
    ],
    createdAt: new Date(2023, 7, 10),
  },
];

const Productions = () => {
  const [productions, setProductions] = useState<Production[]>(initialProductions);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);

  // Adicionar nova produção
  const handleAddProduction = (production: Production) => {
    setProductions([...productions, production]);
  };

  // Filtrar produções por data selecionada
  const filteredProductions = productions.filter((production) => {
    // Filtro de pesquisa por texto
    const matchesSearch = searchTerm === "" || 
      production.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      production.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por data
    const matchesDate = selectedDate ? isSameDay(new Date(production.date), selectedDate) : true;
    
    return matchesSearch && matchesDate;
  });

  // Função para destacar datas no calendário com produções
  const hasProductionOnDate = (date: Date) => {
    return productions.some((production) => isSameDay(new Date(production.date), date));
  };

  // Abrir detalhes da produção
  const openProductionDetails = (production: Production) => {
    setSelectedProduction(production);
    setIsDetailsOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Produções</h1>
            
            <div className="flex items-center bg-gray-800 rounded-md px-3 py-2">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <Input
                placeholder="Buscar produções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-60"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-gray-800 border-gray-700">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasProduction: (date) => hasProductionOnDate(date),
                  }}
                  modifiersClassNames={{
                    hasProduction: "bg-red-500/20 text-red-600 font-bold",
                  }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" className="bg-gray-800 border-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Produção
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-4">
          {selectedDate && (
            <h2 className="text-xl font-medium mb-4">
              Produções para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
          )}
          
          <div className="space-y-4">
            {filteredProductions.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">Nenhuma produção encontrada</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {searchTerm ? 
                    `Não encontramos produções com o termo "${searchTerm}"` : 
                    "Não há produções agendadas para esta data"}
                </p>
                <Button 
                  onClick={() => setIsModalOpen(true)} 
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Nova Produção
                </Button>
              </div>
            ) : (
              filteredProductions.map((production) => (
                <div 
                  key={production.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all cursor-pointer"
                  onClick={() => openProductionDetails(production)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{production.name}</h3>
                      <p className="text-gray-400">{production.client}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{production.startTime} - {production.endTime}</span>
                      </div>
                      <Badge className="mt-1 bg-red-600">{production.teamMembers.length} membros</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate max-w-md">{production.location}</span>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {production.teamMembers.slice(0, 3).map((member) => (
                        <div 
                          key={member.id}
                          className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs overflow-hidden"
                          title={`${member.name} (${member.role})`}
                        >
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {production.teamMembers.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs">
                          +{production.teamMembers.length - 3}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Info className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal para nova produção */}
      <ProductionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProduction}
      />

      {/* Modal de detalhes da produção */}
      {selectedProduction && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedProduction.name}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedProduction.client}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Data e Horário</h4>
                  <p className="text-white">
                    {format(new Date(selectedProduction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-white">
                    {selectedProduction.startTime} às {selectedProduction.endTime}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Local</h4>
                  <p className="text-white">{selectedProduction.location}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Briefing</h4>
                {selectedProduction.briefingFile ? (
                  <p className="text-white flex items-center">
                    <Clipboard className="h-4 w-4 mr-2" />
                    {selectedProduction.briefingFile}
                  </p>
                ) : (
                  <p className="text-gray-400">Nenhum briefing anexado</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Anotações</h4>
                <p className="text-white">{selectedProduction.notes || "Sem anotações"}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Equipe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {selectedProduction.teamMembers.map((member) => (
                    <div key={member.id} className="bg-gray-800 p-2 rounded-md">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-400">
                        {(() => {
                          switch (member.role) {
                            case 'coordenador': return 'Coordenador';
                            case 'filmmaker': return 'Filmmaker';
                            case 'fotografo': return 'Fotógrafo';
                            case 'ajudante': return 'Ajudante';
                            case 'storymaker': return 'Storymaker';
                            default: return member.role;
                          }
                        })()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
};

export default Productions;
