import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Devis } from "@/types/database";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DevisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devis?: Devis | null;
}

const statusOptions = ["signe", "envoye", "accepte", "refuse", "payes"];

export const DevisDialog = ({ open, onOpenChange, devis }: DevisDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Devis>>({
    defaultValues: devis || {},
  });

  const statut = watch("statut");
  const leadId = watch("lead_id");
  const montantHt = watch("montant_ht") || 0;
  const tvaPct = watch("tva_pct") || 10;

  const { data: leads } = useQuery({
    queryKey: ["leadsForDevis"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("id, nom, prenom, email, telephone, adresse").order("nom");
      return data || [];
    },
  });

  // Pré-remplir les informations du client depuis le lead sélectionné
  useEffect(() => {
    if (leadId && leads) {
      const selectedLead = leads.find((l) => l.id === leadId);
      if (selectedLead) {
        setValue("client_nom", `${selectedLead.nom} ${selectedLead.prenom || ""}`.trim(), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        setValue("client_email", selectedLead.email || "", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        setValue("client_telephone", selectedLead.telephone || "", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        setValue("client_adresse", selectedLead.adresse || "", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }
    }
  }, [leadId, leads, setValue]);

  useEffect(() => {
    if (open) {
      if (devis) {
        reset(devis);
      } else {
        reset({
          statut: "envoye",
          tva_pct: 10,
          montant_ht: 0,
          montant_ttc: 0,
          client_nom: "",
          client_email: "",
          client_telephone: "",
          client_adresse: "",
          notes: "",
        });
      }
    }
  }, [devis, reset, open]);

  useEffect(() => {
    const ttc = montantHt * (1 + tvaPct / 100);
    setValue("montant_ttc", ttc);
  }, [montantHt, tvaPct, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<Devis>) => {
      // Le numéro est généré automatiquement par le trigger de la base de données

      if (devis?.id) {
        const { data: updatedDevis, error } = await supabase
          .from("devis")
          .update(data)
          .eq("id", devis.id)
          .select()
          .single();
        if (error) throw error;
        return updatedDevis;
      } else {
        // Passer une chaîne vide pour le numéro, le trigger le générera
        const { data: newDevis, error } = await supabase
          .from("devis")
          .insert([{ ...data, numero: "" } as any])
          .select()
          .single();
        if (error) throw error;
        return newDevis;
      }
    },
    onSuccess: (savedDevis) => {
      // Mettre à jour le cache avec les données fraîches retournées par Supabase
      queryClient.setQueryData<Devis[]>(["devis"], (old) => {
        if (!old) return [savedDevis];
        if (devis?.id) {
          // Update: remplacer le devis existant
          return old.map((d) => (d.id === savedDevis.id ? savedDevis : d));
        } else {
          // Insert: ajouter en tête de liste
          return [savedDevis, ...old];
        }
      });
      // Invalider toutes les variantes de la query pour forcer un refetch propre
      queryClient.invalidateQueries({ queryKey: ["devis"] });
      queryClient.invalidateQueries({ queryKey: ["latestDevisList"] });
      toast.success(devis ? "Devis modifié avec succès" : "Devis créé avec succès");
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  const onSubmit = (data: Partial<Devis>) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{devis ? "Modifier le devis" : "Nouveau devis"}</DialogTitle>
          <DialogDescription>
            {devis ? "Modifiez les informations du devis" : "Créez un nouveau devis"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_id">Lead associé</Label>
              <Select value={leadId || ""} onValueChange={(value) => setValue("lead_id", value)}>
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
              <Label htmlFor="statut">Statut *</Label>
              <Select value={statut} onValueChange={(value) => setValue("statut", value)}>
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

            <div className="space-y-2 col-span-2">
              <Label htmlFor="client_nom">Nom du client *</Label>
              <Input id="client_nom" {...register("client_nom")} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">Email client</Label>
              <Input id="client_email" type="email" {...register("client_email")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_telephone">Téléphone client</Label>
              <Input id="client_telephone" {...register("client_telephone")} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="client_adresse">Adresse client</Label>
              <Input id="client_adresse" {...register("client_adresse")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant_ht">Montant HT (€) *</Label>
              <Input
                id="montant_ht"
                type="number"
                step="0.01"
                {...register("montant_ht", { valueAsNumber: true })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tva_pct">TVA (%)</Label>
              <Input id="tva_pct" type="number" step="0.01" {...register("tva_pct", { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant_ttc">Montant TTC (€)</Label>
              <Input
                id="montant_ttc"
                type="number"
                step="0.01"
                {...register("montant_ttc", { valueAsNumber: true })}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_validite">Date de validité</Label>
              <Input id="date_validite" type="date" {...register("date_validite")} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register("notes")} rows={3} />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
