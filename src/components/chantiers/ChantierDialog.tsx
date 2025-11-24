import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Chantier } from '@/types/database';
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

interface ChantierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chantier?: Chantier | null;
}

const statusOptions = ['planifie', 'en_cours', 'termine', 'annule'];

export const ChantierDialog = ({ open, onOpenChange, chantier }: ChantierDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Chantier>>({
    defaultValues: chantier || {},
  });

  const statut = watch('statut');
  const leadId = watch('lead_id');
  const devisId = watch('devis_id');

  const { data: leads } = useQuery({
    queryKey: ['leadsForChantier'],
    queryFn: async () => {
      const { data } = await supabase
        .from('leads')
        .select('id, nom, prenom, type_projet')
        .order('nom');
      return data || [];
    },
  });

  const { data: devisOptions } = useQuery({
    queryKey: ['devisForChantier', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const { data } = await supabase
        .from('devis')
        .select('id, numero, client_nom, montant_ttc')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!leadId,
  });

  useEffect(() => {
    if (chantier) {
      // Extraire seulement l'ID du devis si c'est un objet
      const devisId = chantier.devis_id || (chantier.devis as any)?.id || null;
      reset({
        ...chantier,
        devis_id: devisId,
      });
    } else {
      reset({
        statut: 'planifie',
        avancement_pct: 0,
      });
    }
  }, [chantier, reset]);

  // Auto-remplissage depuis le lead sélectionné
  useEffect(() => {
    if (leadId && leads) {
      const selectedLead = leads.find((l) => l.id === leadId);
      if (selectedLead) {
        setValue('nom_client', `${selectedLead.nom} ${selectedLead.prenom || ''}`.trim());
        if (selectedLead.type_projet) {
          setValue('type_projet', selectedLead.type_projet);
        }
      }
    }
  }, [leadId, leads, setValue]);

  // Auto-sélection du devis si un seul existe
  useEffect(() => {
    if (devisOptions && devisOptions.length === 1) {
      setValue('devis_id', devisOptions[0].id);
    }
  }, [devisOptions, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<Chantier>) => {
      if (chantier?.id) {
        const { error } = await supabase
          .from('chantiers')
          .update(data)
          .eq('id', chantier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('chantiers').insert([data as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chantiers'] });
      toast.success(chantier ? 'Chantier modifié avec succès' : 'Chantier créé avec succès');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Une erreur est survenue');
    },
  });

  const onSubmit = (data: Partial<Chantier>) => {
    // Nettoyer les données pour ne garder que les champs de base
    const cleanData = {
      lead_id: data.lead_id || null,
      devis_id: data.devis_id || null,
      nom_client: data.nom_client,
      type_projet: data.type_projet || null,
      adresse: data.adresse || null,
      statut: data.statut,
      avancement_pct: data.avancement_pct || 0,
      date_debut: data.date_debut || null,
      date_fin_prevue: data.date_fin_prevue || null,
      date_fin_reelle: data.date_fin_reelle || null,
      notes: data.notes || null,
    };
    mutation.mutate(cleanData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{chantier ? 'Modifier le chantier' : 'Nouveau chantier'}</DialogTitle>
          <DialogDescription>
            {chantier ? 'Modifiez les informations du chantier' : 'Créez un nouveau chantier'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_id">Lead associé</Label>
              <Select value={leadId || ''} onValueChange={(value) => setValue('lead_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads?.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.nom} {lead.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="devis_id">Devis associé</Label>
              <Select
                value={devisId || ''}
                onValueChange={(value) => setValue('devis_id', value)}
                disabled={!leadId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un devis" />
                </SelectTrigger>
                <SelectContent>
                  {devisOptions?.map((devis) => (
                    <SelectItem key={devis.id} value={devis.id}>
                      {devis.numero} - {devis.montant_ttc}€
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="nom_client">Nom du client *</Label>
              <Input id="nom_client" {...register('nom_client')} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_projet">Type de projet</Label>
              <Input id="type_projet" {...register('type_projet')} />
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
              <Label htmlFor="avancement_pct">Avancement (%)</Label>
              <Input
                id="avancement_pct"
                type="number"
                min="0"
                max="100"
                {...register('avancement_pct', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="adresse">Adresse du chantier</Label>
              <Input id="adresse" {...register('adresse')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_debut">Date de début</Label>
              <Input id="date_debut" type="date" {...register('date_debut')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_fin_prevue">Date de fin prévue</Label>
              <Input id="date_fin_prevue" type="date" {...register('date_fin_prevue')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_fin_reelle">Date de fin réelle</Label>
              <Input id="date_fin_reelle" type="date" {...register('date_fin_reelle')} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} rows={3} />
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
