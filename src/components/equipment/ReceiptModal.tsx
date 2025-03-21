
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Receipt, ReceiptModalProps, EquipmentWithdrawal } from '@/types/equipment';

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, withdrawal, receipt: receivedReceipt }) => {
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    // Initialize receipt from either the received receipt or the withdrawal
    if (receivedReceipt) {
      setReceipt(receivedReceipt);
    } else if (withdrawal) {
      setReceipt({
        id: withdrawal?.id || '',
        withdrawal_date: withdrawal?.withdrawal_date || new Date().toISOString(),
        equipment_id: withdrawal?.equipment_id || '',
        equipment: withdrawal?.equipment ? {
          name: withdrawal.equipment.name || '',
          id: withdrawal.equipment.id || ''
        } : undefined,
        user_id: withdrawal?.user_id || '',
        user: withdrawal?.user ? {
          full_name: withdrawal.user.full_name || 'Usuário não encontrado',
          id: withdrawal.user.id || ''
        } : undefined,
        production_id: withdrawal?.production_id || '',
        production: withdrawal?.production ? {
          title: withdrawal.production.title,
          id: withdrawal.production.id
        } : undefined,
        expected_return_date: withdrawal?.expected_return_date || new Date().toISOString(),
        returned_date: withdrawal?.returned_date,
        is_personal_use: withdrawal?.is_personal_use || false,
        notes: withdrawal?.notes || null,
        created_at: withdrawal?.created_at || new Date().toISOString(),
        status: withdrawal?.status || "withdrawn",
        return_notes: withdrawal?.return_notes
      });
    }
  }, [withdrawal, receivedReceipt]);

  if (!receipt) return null;

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
            <p><strong>Nome:</strong> {receipt.equipment?.name}</p>
            <p><strong>ID:</strong> {receipt.equipment?.id}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-md font-semibold">Usuário</h3>
            <p><strong>Nome:</strong> {receipt.user?.full_name}</p>
            <p><strong>ID:</strong> {receipt.user?.id}</p>
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
            
            {receipt.returned_date && (
              <p><strong>Data de Devolução:</strong> {format(new Date(receipt.returned_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            )}
            
            {receipt.return_notes && (
              <p><strong>Observações da Devolução:</strong> {receipt.return_notes}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button type="button" variant="outline" onClick={onClose} className="mr-2 bg-[#141414] text-white hover:bg-[#292929] border-[#292929]">
            Fechar
          </Button>
          <Button type="button" onClick={() => window.print()} className="bg-[#ff3335] hover:bg-[#cc2a2b] text-white">
            Imprimir Recibo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
