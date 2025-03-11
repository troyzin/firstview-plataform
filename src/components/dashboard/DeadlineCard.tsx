
import React from 'react';
import { AlertTriangle, CalendarClock, ArrowRight, Clock } from 'lucide-react';

interface Deadline {
  id: string;
  title: string;
  status: 'upcoming' | 'urgent' | 'late';
  timeLeft: string;
}

interface DeadlineCardProps {
  deadlines: Deadline[];
  onViewDeadline: (id: string) => void;
}

const DeadlineCard = ({ deadlines, onViewDeadline }: DeadlineCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent':
        return (
          <div className="w-10 h-10 bg-red-600/10 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
        );
      case 'late':
        return (
          <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center mr-3">
            <Clock className="text-yellow-500" size={20} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mr-3">
            <CalendarClock className="text-blue-500" size={20} />
          </div>
        );
    }
  };

  const getStatusText = (status: string, timeLeft: string) => {
    switch (status) {
      case 'urgent':
        return <p className="text-xs text-gray-400">Vence em {timeLeft}</p>;
      case 'late':
        return <p className="text-xs text-red-500">Atrasado por {timeLeft}</p>;
      default:
        return <p className="text-xs text-gray-400">Vence em {timeLeft}</p>;
    }
  };

  return (
    <div className="bg-produflow-gray-900 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Próximos Prazos</h3>
      <div className="space-y-3">
        {deadlines.map((deadline) => (
          <div 
            key={deadline.id}
            className="flex items-center p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => onViewDeadline(deadline.id)}
          >
            {getStatusIcon(deadline.status)}
            <div className="flex-1">
              <h4 className="text-sm font-medium">{deadline.title}</h4>
              {getStatusText(deadline.status, deadline.timeLeft)}
            </div>
            <ArrowRight className="text-gray-400 hover:text-white" size={18} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeadlineCard;
