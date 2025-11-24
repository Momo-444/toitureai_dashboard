import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/database';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
}

const statusOptions = [
  'nouveau',
  'contacte',
  'qualifie',
  'devis_envoye',
  'accepte',
  'refuse',
  'perdu',
];

export const LeadDialog = ({ open, onOpenChange, lead }: LeadDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Lead>>({
    defaultValues: lead || {},
  });

  const statut = watch('statut');

  useEffect(() => {
    if (lead) {
      reset(lead);
    } else {
      reset({
        statut: 'nouveau',
      });
    }
  }, [lead, reset]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<Lead>) => {
      if (lead?.id) {
        const { error } = await supabase
          .from('leads')
          .update(data)
          .eq('id', lead.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('leads').insert([data as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(lead ? 'Lead modifié avec succès' : 'Lead créé avec succès');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Une erreur est survenue');
    },
  });

  const onSubmit = (data: Partial<Lead>) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Modifier le lead' : 'Nouveau lead'}</DialogTitle>
          <DialogDescription>
            {lead ? 'Modifiez les informations du lead' : 'Créez un nouveau lead'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" {...register('nom')} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" {...register('prenom')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" {...register('telephone')} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" {...register('adresse')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code_postal">Code postal</Label>
              <Input id="code_postal" {...register('code_postal')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input id="ville" {...register('ville')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input id="source" {...register('source')} placeholder="Site web, téléphone, etc." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut *</Label>
              <Select value={statut} onValueChange={(value) => setValue('statut', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_projet">Type de projet</Label>
              <Input
                id="type_projet"
                {...register('type_projet')}
                placeholder="Rénovation toiture, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surface">Surface (m²)</Label>
              <Input
                id="surface"
                type="number"
                step="0.01"
                {...register('surface', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} rows={3} />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
