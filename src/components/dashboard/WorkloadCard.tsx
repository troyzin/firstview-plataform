
import React from 'react';

interface TeamMember {
  name: string;
  initials: string;
  currentLoad: number;
  maxLoad: number;
}

interface WorkloadCardProps {
  members: TeamMember[];
}

const WorkloadCard = ({ members }: WorkloadCardProps) => {
  const getStatusColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.5) return 'bg-green-500';
    if (ratio < 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.5) return 'text-green-500';
    if (ratio < 0.8) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-produflow-gray-900 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
        <span>Carga de Trabalho</span>
        <span className="material-symbols-outlined cursor-pointer hover:text-produflow-red transition-colors">more_vert</span>
      </h3>
      <div className="space-y-4">
        {members.map((member, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">{member.name} ({member.initials})</span>
              <span className={`text-xs ${getTextColor(member.currentLoad, member.maxLoad)}`}>
                {member.currentLoad}/{member.maxLoad}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className={`${getStatusColor(member.currentLoad, member.maxLoad)} h-2 rounded-full`} 
                style={{ width: `${(member.currentLoad / member.maxLoad) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkloadCard;
