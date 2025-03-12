import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-hot-toast';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentWithdrawal } from '@/types/equipment';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useRouter } from 'next/router';
import VisibilityIcon from '@mui/icons-material/Visibility';

dayjs.locale('pt-br');

const WithdrawalsList = () => {
  const [withdrawals, setWithdrawals] = useState<EquipmentWithdrawal[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<EquipmentWithdrawal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchInitialWithdrawals = async () => {
      const initialWithdrawals = await fetchWithdrawals();
      setWithdrawals(initialWithdrawals);
    };

    fetchInitialWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    const { data, error } = await supabase
      .from('equipment_withdrawals')
      .select(`
        *,
        equipment:equipment_id(id, name),
        user:user_id(id, full_name),
        production:production_id(id, title)
      `)
      .order('withdrawal_date', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar retiradas');
      return [];
    }

    return data || [];
  };

  const handleOpenDialog = () => {
    setSelectedWithdrawal(null);
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWithdrawal(null);
  };

  const handleEditWithdrawal = (withdrawal: EquipmentWithdrawal) => {
    setSelectedWithdrawal({ ...withdrawal });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDeleteWithdrawal = async (id: string) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta retirada?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('equipment_withdrawals').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir retirada');
    } else {
      toast.success('Retirada excluída com sucesso');
      const updatedWithdrawals = withdrawals.filter((withdrawal) => withdrawal.id !== id);
      setWithdrawals(updatedWithdrawals);
    }
  };

  const handleWithdrawalDetails = (id: string) => {
    router.push(`/withdrawals/${id}`);
  };

  const handleChange = (event: any) => {
    const { name, value, type, checked } = event.target;
    setSelectedWithdrawal((prevWithdrawal) => ({
      ...prevWithdrawal,
      [name]: type === 'checkbox' ? checked : value,
    } as EquipmentWithdrawal));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!selectedWithdrawal) return;

    const {
      equipment_id,
      user_id,
      production_id,
      withdrawal_date,
      expected_return_date,
      returned_date,
      status,
      notes,
      is_personal_use,
    } = selectedWithdrawal;

    const withdrawalToUpdate = {
      equipment_id,
      user_id,
      production_id,
      withdrawal_date,
      expected_return_date,
      returned_date,
      status,
      notes,
      is_personal_use,
    };

    if (isEditing) {
      const { data, error } = await supabase
        .from('equipment_withdrawals')
        .update(withdrawalToUpdate)
        .eq('id', selectedWithdrawal.id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar retirada');
      } else {
        toast.success('Retirada atualizada com sucesso');
        setWithdrawals((prevWithdrawals) =>
          prevWithdrawals.map((withdrawal) => (withdrawal.id === selectedWithdrawal.id ? data : withdrawal))
        );
      }
    } else {
      const { data, error } = await supabase
        .from('equipment_withdrawals')
        .insert(withdrawalToUpdate)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar retirada');
      } else {
        toast.success('Retirada criada com sucesso');
        setWithdrawals((prevWithdrawals) => [...prevWithdrawals, data]);
      }
    }

    handleCloseDialog();
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpenDialog} style={{ marginBottom: '20px' }}>
        <AddIcon /> Nova Retirada
      </Button>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Equipamento</TableCell>
              <TableCell>Usuário</TableCell>
              <TableCell>Produção</TableCell>
              <TableCell>Data de Retirada</TableCell>
              <TableCell>Data de Retorno Esperada</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {withdrawal.equipment?.name}
                </TableCell>
                <TableCell>{withdrawal.user?.full_name}</TableCell>
                <TableCell>{withdrawal.production?.title || 'N/A'}</TableCell>
                <TableCell>{dayjs(withdrawal.withdrawal_date).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{dayjs(withdrawal.expected_return_date).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{withdrawal.status}</TableCell>
                <TableCell>
                  <IconButton aria-label="details" onClick={() => handleWithdrawalDetails(withdrawal.id)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton aria-label="edit" onClick={() => handleEditWithdrawal(withdrawal)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDeleteWithdrawal(withdrawal.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{isEditing ? 'Editar Retirada' : 'Nova Retirada'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="equipment_id"
            name="equipment_id"
            label="ID do Equipamento"
            type="text"
            fullWidth
            value={selectedWithdrawal?.equipment_id || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="user_id"
            name="user_id"
            label="ID do Usuário"
            type="text"
            fullWidth
            value={selectedWithdrawal?.user_id || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="production_id"
            name="production_id"
            label="ID da Produção"
            type="text"
            fullWidth
            value={selectedWithdrawal?.production_id || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="withdrawal_date"
            name="withdrawal_date"
            label="Data de Retirada"
            type="date"
            fullWidth
            value={selectedWithdrawal?.withdrawal_date || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            id="expected_return_date"
            name="expected_return_date"
            label="Data de Retorno Esperada"
            type="date"
            fullWidth
            value={selectedWithdrawal?.expected_return_date || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            id="returned_date"
            name="returned_date"
            label="Data de Retorno"
            type="date"
            fullWidth
            value={selectedWithdrawal?.returned_date || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            id="status"
            name="status"
            label="Status"
            type="text"
            fullWidth
            value={selectedWithdrawal?.status || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="notes"
            name="notes"
            label="Notas"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={selectedWithdrawal?.notes || ''}
            onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedWithdrawal?.is_personal_use || false}
                onChange={handleChange}
                name="is_personal_use"
              />
            }
            label="Uso pessoal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WithdrawalsList;
