import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit, ExternalLink, FileText, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DevisDialog } from '@/components/devis/DevisDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
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

const statusColors = {
  'signe': 'default',
  'envoye': 'default',
  'accepte': 'default',
  'refuse': 'destructive',
  'payes': 'default',
} as const;

export default function DevisPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { canDelete, canEdit } = useUserRole();
  const queryClient = useQueryClient();

  const { data: devis, isLoading } = useQuery({
    queryKey: ['devis', search, statusFilter],
    queryFn: async () => {
      let query = supabase.from('devis').select('*').order('created_at', { ascending: false });
      
      if (search) {
        query = query.or(`client_nom.ilike.%${search}%,numero.ilike.%${search}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('statut', statusFilter);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('devis').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devis'] });
      toast.success('Devis supprimé avec succès');
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('devis-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devis'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['devis'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
          <p className="text-muted-foreground">Gérez vos devis</p>
        </div>
        {canEdit && (
          <Button onClick={() => {
            setSelectedDevis(null);
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par client, numéro..."
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
            <SelectItem value="signe">Signé</SelectItem>
            <SelectItem value="envoye">Envoyé</SelectItem>
            <SelectItem value="accepte">Accepté</SelectItem>
            <SelectItem value="refuse">Refusé</SelectItem>
            <SelectItem value="payes">Payés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devis?.map((d) => (
            <Card key={d.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{d.client_nom}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {d.numero} • {format(new Date(d.date_creation), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <Badge variant={statusColors[d.statut as keyof typeof statusColors] || 'secondary'}>
                    {d.statut}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(d.client_email || d.client_telephone || d.client_adresse) && (
                  <div className="space-y-1 text-sm">
                    {d.client_email && (
                      <p className="text-muted-foreground">{d.client_email}</p>
                    )}
                    {d.client_telephone && (
                      <p className="text-muted-foreground">{d.client_telephone}</p>
                    )}
                    {d.client_adresse && (
                      <p className="text-muted-foreground">{d.client_adresse}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <p className="text-2xl font-bold">{d.montant_ttc.toLocaleString('fr-FR')} €</p>
                  <p className="text-sm text-muted-foreground">TTC</p>
                </div>
                
                <div className="flex gap-2">
                  {d.url_pdf && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={d.url_pdf} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ouvrir PDF
                      </a>
                    </Button>
                  )}
                  {canEdit && (
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedDevis(d);
                      setDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeleteId(d.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DevisDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        devis={selectedDevis}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.
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
    </div>
  );
}
