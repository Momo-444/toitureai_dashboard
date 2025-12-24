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
import { DevisLinesForm, DevisLine } from './DevisLinesForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
}



export const LeadDialog = ({ open, onOpenChange, lead }: LeadDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Lead>>({
    defaultValues: lead || {},
  });

  const statut = watch('statut');

  const [customLines, setCustomLines] = useState<DevisLine[]>([]);
  const [customNotes, setCustomNotes] = useState<string>('');

  useEffect(() => {
    if (lead) {
      reset(lead);
      setCustomLines(lead.lignes_devis_custom || []);
      setCustomNotes(lead.notes_devis_custom || '');
    } else {
      reset({
        statut: 'nouveau',
      });
      setCustomLines([]);
      setCustomNotes('');
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
    const dataToSend = {
      ...data,
      lignes_devis_custom: customLines.length > 0 ? customLines : null,
      notes_devis_custom: customNotes.trim() || null,
    };
    mutation.mutate(dataToSend);
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
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="infos">Informations Lead</TabsTrigger>
              <TabsTrigger value="devis">Lignes Devis Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="space-y-4 mt-4">
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
  <SelectItem value="nouveau">Nouveau</SelectItem>
  <SelectItem value="contacte">Contacté</SelectItem>
  <SelectItem value="qualifie">Qualifié</SelectItem>
  <SelectItem value="devis_envoye">Devis envoyé</SelectItem>
  <SelectItem value="accepte">Accepté</SelectItem>
  <SelectItem value="refuse">Refusé</SelectItem>
  <SelectItem value="perdu">Perdu</SelectItem>
  <SelectItem value="chaud">Chaud</SelectItem>
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

                <div className="space-y-2">
                  <Label htmlFor="budget_estime">Budget estimé (€)</Label>
                  <Input
                    id="budget_estime"
                    type="number"
                    step="0.01"
                    placeholder="Budget indiqué par le client"
                    {...register('budget_estime', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Budget estimé par le client dans le formulaire
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_negocie">💰 Budget Négocié (€ HT)</Label>
                  <Input
                    id="budget_negocie"
                    type="number"
                    step="0.01"
                    placeholder="Optionnel - remplace le calcul IA"
                    {...register('budget_negocie', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si rempli, ce montant sera utilisé au lieu du calcul automatique
                  </p>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register('description')} rows={3} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="devis" className="space-y-4 mt-4">
              <DevisLinesForm
                value={customLines}
                onChange={setCustomLines}
                notes={customNotes}
                onNotesChange={setCustomNotes}
              />
            </TabsContent>
          </Tabs>

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
