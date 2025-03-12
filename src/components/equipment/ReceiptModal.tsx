import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, PackageOpen } from 'lucide-react';
import { ReturnModalProps } from '@/types/equipment';

interface ReceiptModalProps extends ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: any;
}

interface Receipt {
  id: string;
  withdrawal_date: string;
  equipment: {
    name: string;
    id: string;
  };
  user: {
    full_name: string;
    id: string;
  };
  production?: {
    title: string;
    id: string;
  } | null;
  expected_return_date: string;
  is_personal_use: boolean;
  notes: string | null;
  created_at: string;
  return_notes: string | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, withdrawal }) => {
  const [receipt, setReceipt] = useState<Receipt>({
    id: withdrawal?.id || '',
    withdrawal_date: withdrawal?.withdrawal_date || new Date().toISOString(),
    equipment: {
      name: withdrawal?.equipment?.name || '',
      id: withdrawal?.equipment?.id || ''
    },
    user: {
      full_name: withdrawal?.user?.full_name || 'Usuário não encontrado',
      id: withdrawal?.user?.id || ''
    },
    production: withdrawal?.production ? {
      title: withdrawal.production.title,
      id: withdrawal.production.id
    } : null,
    expected_return_date: withdrawal?.expected_return_date || new Date().toISOString(),
    is_personal_use: withdrawal?.is_personal_use || false,
    notes: withdrawal?.notes || null,
    created_at: new Date().toISOString(),
    return_notes: null
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#000000] border border-[#141414] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Recibo de Retirada</DialogTitle>
          <DialogDescription className="text-gray-400">
            Detalhes da retirada do equipamento.
          </DialogDescription>
        </DialogHeader>

        <div id="receipt-printable" className="py-4">
          <div className="mb-4">
            <h3 className="text-md font-semibold">Equipamento</h3>
            <p><strong>Nome:</strong> {receipt.equipment.name}</p>
            <p><strong>ID:</strong> {receipt.equipment.id}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-md font-semibold">Usuário</h3>
            <p><strong>Nome:</strong> {receipt.user.full_name}</p>
            <p><strong>ID:</strong> {receipt.user.id}</p>
          </div>

          {receipt.production && (
            <div className="mb-4">
              <h3 className="text-md font-semibold">Produção</h3>
              <p><strong>Título:</strong> {receipt.production.title}</p>
              <p><strong>ID:</strong> {receipt.production.id}</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-md font-semibold">Detalhes da Retirada</h3>
            <p><strong>Data de Retirada:</strong> {format(new Date(receipt.withdrawal_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            <p><strong>Data de Retorno Esperada:</strong> {format(new Date(receipt.expected_return_date), "dd/MM/yyyy", { locale: ptBR })}</p>
            <p><strong>Uso Pessoal:</strong> {receipt.is_personal_use ? 'Sim' : 'Não'}</p>
            <p><strong>Observações:</strong> {receipt.notes || 'Nenhuma'}</p>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button type="button" variant="outline" onClick={onClose} className="mr-2">
            Fechar
          </Button>
          <Button type="button" onClick={() => window.print()}>
            Imprimir Recibo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
