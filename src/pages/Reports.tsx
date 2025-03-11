
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronDown, Download, LineChart, BarChart, PieChart, Calendar as CalendarIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RePieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [dateRange, setDateRange] = useState("month");

  // Sample data for charts
  const productionData = [
    { name: 'Jan', value: 12 },
    { name: 'Fev', value: 19 },
    { name: 'Mar', value: 15 },
    { name: 'Abr', value: 22 },
    { name: 'Mai', value: 32 },
    { name: 'Jun', value: 28 },
  ];

  const deliveryTimeData = [
    { name: 'Jan', average: 4.2 },
    { name: 'Fev', average: 3.8 },
    { name: 'Mar', average: 3.5 },
    { name: 'Abr', average: 3.0 },
    { name: 'Mai', average: 3.2 },
    { name: 'Jun', average: 2.9 },
  ];

  const teamPerformanceData = [
    { name: 'Filipe S.', productions: 24, onTime: 22 },
    { name: 'Arthur F.', productions: 18, onTime: 16 },
    { name: 'João G.', productions: 20, onTime: 19 },
    { name: 'Iago T.', productions: 14, onTime: 14 },
    { name: 'Matheus W.', productions: 22, onTime: 20 },
  ];

  const productionTypeData = [
    { name: 'Corporativo', value: 35 },
    { name: 'Redes Sociais', value: 45 },
    { name: 'Institucional', value: 20 },
    { name: 'Educacional', value: 15 },
  ];

  const COLORS = ['#ea384c', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Relatórios</h2>
        <div className="flex space-x-4">
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700">
            <CalendarIcon size={18} />
            <span>Período Personalizado</span>
            <ChevronDown size={16} />
          </Button>
          
          <Button className="flex items-center space-x-2 bg-produflow-red hover:bg-red-700">
            <Download size={18} />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="production" className="w-full">
        <TabsList className="bg-gray-800 mb-6">
          <TabsTrigger value="production" className="data-[state=active]:bg-produflow-red">
            <LineChart className="mr-2" size={16} />
            Produção
          </TabsTrigger>
          <TabsTrigger value="time" className="data-[state=active]:bg-produflow-red">
            <Calendar className="mr-2" size={16} />
            Tempo
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-produflow-red">
            <BarChart className="mr-2" size={16} />
            Equipe
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-produflow-red">
            <PieChart className="mr-2" size={16} />
            Distribuição
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="production" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-produflow-gray-900 border-gray-800 lg:col-span-2">
              <CardHeader>
                <CardTitle>Produções ao Longo do Tempo</CardTitle>
                <CardDescription>Número total de produções por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={productionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '0.375rem'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Produções" 
                        stroke="#ea384c" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-produflow-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Resumo de Produção</CardTitle>
                <CardDescription>Métricas gerais de performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Taxa de Entregas no Prazo</span>
                    <span className="text-green-500 font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Eficiência de Produção</span>
                    <span className="text-blue-500 font-medium">84%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '84%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Satisfação do Cliente</span>
                    <span className="text-produflow-red font-medium">95%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-produflow-red h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Total Concluído</div>
                    <div className="text-2xl font-bold mt-1">128</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Em Progresso</div>
                    <div className="text-2xl font-bold mt-1">32</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="time" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-produflow-gray-900 border-gray-800 lg:col-span-2">
              <CardHeader>
                <CardTitle>Tempo Médio de Edição</CardTitle>
                <CardDescription>Tempo médio para completar produções (dias)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={deliveryTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '0.375rem'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        name="Dias" 
                        stroke="#f59e0b" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-produflow-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Distribuição de Tempo</CardTitle>
                <CardDescription>Tempo por tipo de produção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Institucional</span>
                    <span className="text-yellow-500 font-medium">4.5 dias</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Redes Sociais</span>
                    <span className="text-green-500 font-medium">2.1 dias</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '42%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Educacional</span>
                    <span className="text-blue-500 font-medium">3.8 dias</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '76%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Corporativo</span>
                    <span className="text-produflow-red font-medium">3.2 dias</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-produflow-red h-2 rounded-full" style={{width: '64%'}}></div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Média Geral</div>
                    <div className="text-2xl font-bold mt-1">3.2 dias</div>
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="material-symbols-outlined text-sm mr-1">trending_down</span>
                      +0.5 dias comparado ao último mês
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="team" className="mt-0">
          <Card className="bg-produflow-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Performance da Equipe</CardTitle>
              <CardDescription>Produções por membro da equipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={teamPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '0.375rem'
                      }} 
                    />
                    <Legend />
                    <Bar 
                      dataKey="productions" 
                      name="Total Produções" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="onTime" 
                      name="Entregas no Prazo" 
                      fill="#ea384c" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-produflow-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Tipos de Produção</CardTitle>
                <CardDescription>Distribuição por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={productionTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {productionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '0.375rem'
                        }} 
                        formatter={(value, name) => [`${value} produções`, name]}
                      />
                      <Legend formatter={(value) => <span style={{color: 'white'}}>{value}</span>} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-produflow-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Status de Projetos</CardTitle>
                <CardDescription>Distribuição por estado atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Em Produção</span>
                      <span className="text-produflow-red font-medium">6 (19%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div className="bg-produflow-red h-3 rounded-full" style={{width: '19%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Em Edição</span>
                      <span className="text-blue-500 font-medium">8 (25%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{width: '25%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Em Revisão</span>
                      <span className="text-yellow-500 font-medium">3 (9%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div className="bg-yellow-500 h-3 rounded-full" style={{width: '9%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Entregues</span>
                      <span className="text-green-500 font-medium">15 (47%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{width: '47%'}}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="text-gray-400 text-sm">Total de Projetos</div>
                      <div className="text-2xl font-bold mt-1">32</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="text-gray-400 text-sm">Prazo Médio</div>
                      <div className="text-2xl font-bold mt-1">8 dias</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Reports;
