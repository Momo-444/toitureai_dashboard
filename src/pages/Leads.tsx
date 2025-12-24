import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/database';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit, FileText, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { LeadDialog } from '@/components/leads/LeadDialog';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { canDelete, canEdit } = useUserRole();
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', search, statusFilter],
    queryFn: async () => {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      
      if (search) {
        query = query.or(`nom.ilike.%${search}%,email.ilike.%${search}%,ville.ilike.%${search}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('statut', statusFilter);
      }

      const { data } = await query;
      return data || [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead supprimé avec succès');
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  const handleSendDevis = async (lead: Lead) => {
    try {
      toast.loading('Envoi du devis en cours...');
      
      const response = await fetch('https://mohamed-proyecto-n8n.3ffj7o.easypanel.host/webhook/c5a970fd-d45d-445b-816d-45c4817806d5', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Webhook-Secret': '4ec2a273-089b-48a2-bfbc-e7fe8ac86bda'
        },
        body: JSON.stringify({
          lead_id: lead.id,
          nom: lead.nom,
          prenom: lead.prenom,
          email: lead.email,
          telephone: lead.telephone,
          adresse: lead.adresse,
          ville: lead.ville,
          type_projet: lead.type_projet,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'envoi du devis');
      
      // Mettre à jour le statut du lead à "devis_envoye"
      const { error } = await supabase
        .from('leads')
        .update({ statut: 'devis_envoye' })
        .eq('id', lead.id);

      if (error) {
        console.error('Error updating lead status:', error);
        toast.dismiss();
        toast.error('Devis envoyé mais erreur lors de la mise à jour du statut');
      } else {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        toast.dismiss();
        toast.success('Devis envoyé et statut mis à jour');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Erreur lors de l\'envoi du devis');
      console.error('Erreur:', error);
    }
  };

  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Gérez vos prospects</p>
        </div>
        {canEdit && (
          <Button onClick={() => {
            setSelectedLead(null);
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau lead
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
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

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads?.map((lead) => (
            <Card key={lead.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {lead.nom} {lead.prenom}
                  </CardTitle>
                 <Badge
  className={cn(
    "border-transparent text-white font-medium",
    lead.statut === "nouveau" && "bg-blue-500 hover:bg-blue-600",
    lead.statut === "contacte" && "bg-purple-500 hover:bg-purple-600",
    lead.statut === "qualifie" && "bg-emerald-500 hover:bg-emerald-600",
    lead.statut === "devis_envoye" && "bg-orange-500 hover:bg-orange-600",
    lead.statut === "accepte" && "bg-green-500 hover:bg-green-600",
    lead.statut === "refuse" && "bg-red-500 hover:bg-red-600",
    lead.statut === "perdu" && "bg-gray-500 hover:bg-gray-600",
    lead.statut === "chaud" && "bg-lime-500 hover:bg-lime-600",
    // Fallback safe : gris foncé si statut inconnu (très rare)
    !["nouveau", "contacte", "qualifie", "devis_envoye", "accepte", "refuse", "perdu", "chaud"].includes(lead.statut || "") && "bg-gray-500 hover:bg-gray-600"
  )}
>
  {lead.statut === "nouveau" ? "Nouveau" :
   lead.statut === "contacte" ? "Contacté" :
   lead.statut === "qualifie" ? "Qualifié" :
   lead.statut === "devis_envoye" ? "Devis envoyé" :
   lead.statut === "accepte" ? "Accepté" :
   lead.statut === "refuse" ? "Refusé" :
   lead.statut === "perdu" ? "Perdu" :
   lead.statut === "chaud" ? "Chaud" :
   lead.statut || "Inconnu"}
</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {lead.email && <p className="text-sm text-muted-foreground">{lead.email}</p>}
                {lead.telephone && <p className="text-sm text-muted-foreground">{lead.telephone}</p>}
                {lead.ville && <p className="text-sm text-muted-foreground">{lead.ville}</p>}
                {lead.type_projet && (
                  <p className="text-sm">
                    <span className="font-medium">Type: </span>
                    {lead.type_projet}
                  </p>
                )}
                
                <div className="flex flex-col gap-2 pt-4">
                  {canEdit && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleSendDevis(lead)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Envoyer devis
                    </Button>
                  )}
                  <div className="flex gap-2">
                    {canEdit && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedLead(lead);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDeleteId(lead.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce lead ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LeadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={selectedLead}
      />
    </div>
  );
}
