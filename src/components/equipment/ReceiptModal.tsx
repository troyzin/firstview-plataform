import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Grid, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { Receipt } from '@/types/equipment';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  withdrawalId?: string;
}

const ReceiptModal = ({ open, onClose, withdrawalId }: ReceiptModalProps) => {
  const [receipt, setReceipt] = useState<Receipt>({
    id: '',
    equipment_id: '',
    user_id: '',
    production_id: '',
    withdrawal_date: '',
    expected_return_date: '',
    returned_date: '',
    status: '',
    notes: '',
    return_notes: '',
    created_at: '',
    is_personal_use: false,
    equipment_name: '',
    user_name: '',
    production_name: '',
  });

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!withdrawalId) return;

      const { data, error } = await supabase
        .from('equipment_withdrawals')
        .select(`
          *,
          equipment:equipment_id(name),
          user:user_id(full_name),
          production:production_id(title)
        `)
        .eq('id', withdrawalId)
        .single();

      if (error) {
        toast.error('Erro ao carregar recibo');
        return;
      }

      if (data) {
        setReceipt({
          ...data,
          created_at: data.withdrawal_date,
          equipment_name: data.equipment?.name || '',
          user_name: data.user?.full_name || '',
          production_name: data.production?.title || '',
          return_notes: '',
        });
      }
    };

    fetchReceipt();
  }, [withdrawalId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Recibo de Retirada de Equipamento
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Equipamento:</Typography>
            <TextField fullWidth value={receipt.equipment_name} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Usuário:</Typography>
            <TextField fullWidth value={receipt.user_name} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Produção:</Typography>
            <TextField fullWidth value={receipt.production_name || 'N/A'} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Data de Retirada:</Typography>
            <TextField fullWidth value={receipt.withdrawal_date} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Data de Retorno Esperada:</Typography>
            <TextField fullWidth value={receipt.expected_return_date} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Data de Retorno:</Typography>
            <TextField fullWidth value={receipt.returned_date || 'N/A'} disabled />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Observações:</Typography>
            <TextField fullWidth value={receipt.notes || 'N/A'} disabled multiline rows={4} />
          </Grid>
        </Grid>
        <Button onClick={onClose}>Fechar</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
