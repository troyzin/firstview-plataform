
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Mail, Phone, Film, Calendar, Clock, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Filipe Silva",
      initials: "FS",
      role: "Editor Senior",
      email: "filipe@produflow.com",
      phone: "+55 11 99999-1111",
      avatarColor: "bg-purple-500",
      currentLoad: 2,
      maxLoad: 4,
      projects: [
        { name: "Documentário", dueDate: "10/05/2023", status: "em_andamento" },
        { name: "Curso Online", dueDate: "03/05/2023", status: "concluido" }
      ],
      stats: {
        completed: 24,
        onTime: 22,
        averageTime: 2.8
      }
    },
    {
      id: 2,
      name: "Arthur Fernandes",
      initials: "AF",
      role: "Editor de Vídeo",
      email: "arthur@produflow.com",
      phone: "+55 11 99999-2222",
      avatarColor: "bg-blue-500",
      currentLoad: 3,
      maxLoad: 4,
      projects: [
        { name: "Campanha Nova Marca", dueDate: "12/05/2023", status: "em_andamento" },
        { name: "Vídeo Instagram", dueDate: "05/05/2023", status: "concluido" },
        { name: "Webinar Corporativo", dueDate: "20/05/2023", status: "em_andamento" }
      ],
      stats: {
        completed: 18,
        onTime: 16,
        averageTime: 3.2
      }
    },
    {
      id: 3,
      name: "João Gustavo",
      initials: "JG",
      role: "Motion Designer",
      email: "joao@produflow.com",
      phone: "+55 11 99999-3333",
      avatarColor: "bg-red-500",
      currentLoad: 4,
      maxLoad: 4,
      projects: [
        { name: "Motion Graphics", dueDate: "11/05/2023", status: "em_andamento" },
        { name: "Vídeo Institucional", dueDate: "18/05/2023", status: "em_andamento" },
        { name: "Comercial TV", dueDate: "08/05/2023", status: "em_andamento" },
        { name: "Evento Corporativo", dueDate: "02/05/2023", status: "concluido" }
      ],
      stats: {
        completed: 20,
        onTime: 19,
        averageTime: 3.0
      }
    },
    {
      id: 4,
      name: "Iago Tarangino",
      initials: "IT",
      role: "Editor de Áudio",
      email: "iago@produflow.com",
      phone: "+55 11 99999-4444",
      avatarColor: "bg-green-500",
      currentLoad: 1,
      maxLoad: 4,
      projects: [
        { name: "Tutorial Software", dueDate: "22/05/2023", status: "em_andamento" }
      ],
      stats: {
        completed: 14,
        onTime: 14,
        averageTime: 2.5
      }
    },
    {
      id: 5,
      name: "Matheus Worish",
      initials: "MW",
      role: "Animador 3D",
      email: "matheus@produflow.com",
      phone: "+55 11 99999-5555",
      avatarColor: "bg-yellow-500",
      currentLoad: 3,
      maxLoad: 4,
      projects: [
        { name: "Animação 3D", dueDate: "14/05/2023", status: "em_andamento" },
        { name: "Teaser Evento", dueDate: "15/05/2023", status: "em_andamento" },
        { name: "Evento Corporativo", dueDate: "02/05/2023", status: "concluido" }
      ],
      stats: {
        completed: 22,
        onTime: 20,
        averageTime: 3.4
      }
    }
  ];

  const getLoadColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.5) return "bg-green-500";
    if (ratio < 0.8) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleAddMember = () => {
    toast.info("Funcionalidade de adicionar membro em desenvolvimento");
  };

  const handleContactMember = (email: string) => {
    toast.info(`Enviando email para: ${email}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Equipe</h2>
        <Button onClick={handleAddMember} className="flex items-center space-x-2 bg-produflow-red hover:bg-red-700">
          <Plus size={18} />
          <span>Adicionar Membro</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="bg-produflow-gray-900 border-gray-800 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${member.avatarColor} rounded-full flex items-center justify-center text-white font-medium text-lg`}>
                    {member.initials}
                  </div>
                  <div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                </div>
                <Badge 
                  className={`${
                    member.currentLoad === member.maxLoad 
                      ? 'bg-red-500/20 text-red-400' 
                      : member.currentLoad >= member.maxLoad * 0.75 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {member.currentLoad}/{member.maxLoad} projetos
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Carga de Trabalho</span>
                    <span className="text-xs">{(member.currentLoad / member.maxLoad * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={(member.currentLoad / member.maxLoad) * 100} 
                    className="h-2 bg-gray-800" 
                    indicatorClassName={getLoadColor(member.currentLoad, member.maxLoad)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Projetos Atuais</h4>
                  <div className="space-y-2">
                    {member.projects
                      .filter(p => p.status === "em_andamento")
                      .map((project, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 px-3 bg-gray-800 rounded-md text-sm">
                          <span>{project.name}</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Calendar size={12} />
                            <span>{project.dueDate}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-gray-800 p-2 rounded-md text-center">
                    <div className="flex justify-center mb-1">
                      <Film size={16} className="text-produflow-red" />
                    </div>
                    <p className="text-xs text-gray-400">Concluídos</p>
                    <p className="font-medium">{member.stats.completed}</p>
                  </div>
                  <div className="bg-gray-800 p-2 rounded-md text-center">
                    <div className="flex justify-center mb-1">
                      <Check size={16} className="text-green-500" />
                    </div>
                    <p className="text-xs text-gray-400">No Prazo</p>
                    <p className="font-medium">{member.stats.onTime}</p>
                  </div>
                  <div className="bg-gray-800 p-2 rounded-md text-center">
                    <div className="flex justify-center mb-1">
                      <Clock size={16} className="text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-400">Tempo Médio</p>
                    <p className="font-medium">{member.stats.averageTime}d</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-800 pt-4 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-gray-700 bg-gray-800 hover:bg-gray-700"
                onClick={() => handleContactMember(member.email)}
              >
                <Mail size={14} className="mr-1" />
                Email
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-gray-700 bg-gray-800 hover:bg-gray-700"
              >
                <Phone size={14} className="mr-1" />
                Ligar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Team;
