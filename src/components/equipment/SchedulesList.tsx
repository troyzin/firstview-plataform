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
  Snackbar,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentSchedule } from '@/types/equipment';
import { toast } from 'react-toastify';

const SchedulesList = () => {
  const [schedules, setSchedules] = useState<EquipmentSchedule[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<EquipmentSchedule | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [notes, setNotes] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('equipment_schedules')
      .select(`
        *,
        equipment:equipment_id(id, name),
        user:user_id(id, full_name),
        production:production_id(id, title)
      `)
      .order('start_date', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar agendamentos');
      return [];
    }

    setSchedules(data || []);
  };

  const handleOpen = (schedule?: EquipmentSchedule) => {
    setSelectedSchedule(schedule || null);
    setStartDate(schedule ? dayjs(schedule.start_date) : null);
    setEndDate(schedule ? dayjs(schedule.end_date) : null);
    setNotes(schedule ? schedule.notes || '' : '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSchedule(null);
  };

  const handleStartDateChange = (date: Dayjs | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    setEndDate(date);
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setSnackbarMessage('Por favor, preencha todas as datas.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const startDateString = startDate.format('YYYY-MM-DD');
    const endDateString = endDate.format('YYYY-MM-DD');

    if (selectedSchedule) {
      // Update existing schedule
      const { data, error } = await supabase
        .from('equipment_schedules')
        .update({
          start_date: startDateString,
          end_date: endDateString,
          notes: notes,
        })
        .eq('id', selectedSchedule.id);

      if (error) {
        setSnackbarMessage('Erro ao atualizar agendamento.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage('Agendamento atualizado com sucesso!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        fetchSchedules();
      }
    } else {
      // Create new schedule
      const { data, error } = await supabase
        .from('equipment_schedules')
        .insert([
          {
            equipment_id: 'a99a9a9a-aaaa-4a9a-a99a-aaaaaaaaaaaa', // Replace with actual equipment_id
            user_id: 'a99a9a9a-aaaa-4a9a-a99a-aaaaaaaaaaaa', // Replace with actual user_id
            start_date: startDateString,
            end_date: endDateString,
            notes: notes,
          },
        ]);

      if (error) {
        setSnackbarMessage('Erro ao criar agendamento.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage('Agendamento criado com sucesso!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        fetchSchedules();
      }
    }

    handleClose();
  };

  const handleDelete = async (id: string) => {
    const { data, error } = await supabase
      .from('equipment_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      setSnackbarMessage('Erro ao excluir agendamento.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } else {
      setSnackbarMessage('Agendamento excluído com sucesso!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      fetchSchedules();
    }
  };

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <div>
      <IconButton color="primary" aria-label="add" onClick={() => handleOpen()}>
        <AddIcon />
      </IconButton>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Equipment</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {schedule.equipment?.name}
                </TableCell>
                <TableCell>{schedule.user?.full_name}</TableCell>
                <TableCell>{schedule.start_date}</TableCell>
                <TableCell>{schedule.end_date}</TableCell>
                <TableCell>{schedule.notes}</TableCell>
                <TableCell>
                  <IconButton aria-label="edit" onClick={() => handleOpen(schedule)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDelete(schedule.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedSchedule ? 'Edit Schedule' : 'Create Schedule'}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              renderInput={(params) => <TextField {...params} margin="normal" />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              renderInput={(params) => <TextField {...params} margin="normal" />}
            />
          </LocalizationProvider>
          <TextField
            label="Notes"
            multiline
            rows={4}
            value={notes}
            onChange={handleNotesChange}
            margin="normal"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {selectedSchedule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SchedulesList;
