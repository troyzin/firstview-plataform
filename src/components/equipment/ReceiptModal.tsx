
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Receipt } from '@/types/equipment';

interface ReceiptModalProps {
  withdrawalId: string | null;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ withdrawalId, onClose }) => {
  const [receipt, setReceipt] = useState<Receipt>({
    id: '',
    equipment_id: '',
    user_id: '',
    expected_return_date: '',
    status: '',
    created_at: '',
    return_notes: '',
    equipment: undefined,
    user: undefined,
    production: undefined,
    withdrawal_date: '',
    returned_date: undefined,
    notes: null,
    production_id: null,
    is_personal_use: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWithdrawalDetails = async () => {
      if (!withdrawalId) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('equipment_withdrawals')
          .select(`
            *,
            equipment:equipment_id(id, name),
            user:user_id(id, full_name),
            production:production_id(id, title)
          `)
          .eq('id', withdrawalId)
          .single();
          
        if (error) throw error;
        
        // Handling possible null values or errors in relations
        const userName = data.user && !('error' in data.user) ? data.user.full_name : 'Usuário não encontrado';
        
        setReceipt({
          ...data,
          user: {
            id: data.user_id,
            full_name: userName
          },
          created_at: data.withdrawal_date || new Date().toISOString(),
          return_notes: ''
        });
      } catch (error) {
        console.error('Erro ao buscar detalhes da retirada:', error);
        toast.error('Erro ao carregar o recibo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithdrawalDetails();
  }, [withdrawalId]);

  const handlePrint = () => {
    window.print();
  };

  if (!withdrawalId) return null;

  return (
    <Dialog open={!!withdrawalId} onOpenChange={() => onClose()}>
      <DialogContent className="bg-[#141414] text-white border-none max-w-3xl" id="receipt-printable">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold text-white">Recibo de Retirada</DialogTitle>
            <Button variant="ghost" onClick={onClose} size="icon" className="text-white hover:bg-[#333]">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#ff3335]">TERMO DE RESPONSABILIDADE</h2>
              <p className="text-gray-300">Data: {format(new Date(receipt.created_at || ''), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Equipamento:</p>
                  <p className="font-medium">{receipt.equipment?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Responsável:</p>
                  <p className="font-medium">{receipt.user?.full_name}</p>
                </div>
              </div>
              
              {receipt.production_id && receipt.production && (
                <div>
                  <p className="text-gray-400">Produção:</p>
                  <p className="font-medium">{receipt.production.title}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Data de Retirada:</p>
                  <p className="font-medium">{format(new Date(receipt.withdrawal_date || ''), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-gray-400">Data de Devolução Prevista:</p>
                  <p className="font-medium">{format(new Date(receipt.expected_return_date), 'dd/MM/yyyy')}</p>
                </div>
              </div>
              
              {receipt.notes && (
                <div>
                  <p className="text-gray-400">Observações:</p>
                  <p className="font-medium">{receipt.notes}</p>
                </div>
              )}
              
              <div className="border-t border-gray-700 pt-6 mt-6">
                <p className="text-sm text-gray-400">
                  Declaro ter recebido o(s) equipamento(s) acima descrito(s) em perfeito estado de funcionamento e conservação, 
                  responsabilizando-me pela sua guarda e conservação, comprometendo-me a devolvê-lo(s) em igual estado.
                </p>
              </div>
              
              <div className="pt-8 grid grid-cols-2 gap-8 mt-8">
                <div className="border-t border-gray-700 pt-2 text-center">
                  <p className="text-sm">Assinatura do Responsável</p>
                </div>
                <div className="border-t border-gray-700 pt-2 text-center">
                  <p className="text-sm">Responsável pela Entrega</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end print:hidden">
              <Button 
                onClick={handlePrint}
                className="bg-[#ff3335] hover:bg-red-700 text-white border-none"
              >
                Imprimir Recibo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
