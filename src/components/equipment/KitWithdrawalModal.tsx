
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

interface KitWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  withdrawer_name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres",
  }),
  project_name: z.string().min(1, {
    message: "O nome do projeto é obrigatório",
  }),
  notes: z.string().optional(),
  expected_return_date: z.string().min(1, {
    message: "A data de devolução é obrigatória",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const KitWithdrawalModal: React.FC<KitWithdrawalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      withdrawer_name: '',
      project_name: '',
      notes: '',
      expected_return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 7 days from now
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // For kit withdrawal we'll create a placeholder equipment entry
      // to track the kit as a whole since there's no direct kit table
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .insert({
          name: `Kit para ${data.project_name}`,
          category: 'kit',
          status: 'em uso',
          notes: `Kit retirado por ${data.withdrawer_name}`
        })
        .select('id')
        .single();

      if (equipmentError) {
        console.error("Error creating kit placeholder:", equipmentError);
        toast.error("Erro ao registrar kit");
        return;
      }

      // Now create the withdrawal record using the created equipment id
      const { error } = await supabase
        .from('equipment_withdrawals')
        .insert({
          equipment_id: equipmentData.id,
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder user ID for now
          expected_return_date: data.expected_return_date,
          notes: `Projeto: ${data.project_name}. Retirado por: ${data.withdrawer_name}. ${data.notes || ''}`,
          is_personal_use: false,
        });

      if (error) {
        console.error("Error during kit withdrawal:", error);
        toast.error("Erro ao registrar retirada de kit");
        return;
      }

      toast.success("Kit retirado com sucesso!");
      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      console.error("Unexpected error during kit withdrawal:", error);
      toast.error("Ocorreu um erro ao registrar a retirada de kit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#000000] border-[#141414]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Retirada de Kit</DialogTitle>
          <DialogDescription>
            Preencha as informações para registrar a retirada de um kit de equipamentos.
          </DialogDescription>
          <Button
            variant="ghost"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="withdrawer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de quem está retirando</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome completo" 
                      {...field} 
                      className="bg-[#141414] border-[#1f1f1f]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do projeto" 
                      {...field} 
                      className="bg-[#141414] border-[#1f1f1f]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expected_return_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Devolução</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="bg-[#141414] border-[#1f1f1f]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações sobre a retirada" 
                      className="resize-none bg-[#141414] border-[#1f1f1f]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="bg-[#141414] border-[#141414] hover:bg-[#292929] mr-2"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#ff3335] hover:bg-[#ff3335]/80"
              >
                {isSubmitting ? "Processando..." : "Registrar Retirada"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default KitWithdrawalModal;
