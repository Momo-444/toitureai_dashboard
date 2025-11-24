import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, HardHat, Edit, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChantierDialog } from '@/components/chantiers/ChantierDialog';
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

const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  'planifie': 'secondary',
  'en_cours': 'default',
  'termine': 'default',
  'annule': 'destructive',
};

export default function ChantiersPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChantier, setSelectedChantier] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { canDelete, canEdit } = useUserRole();
  const queryClient = useQueryClient();

  const { data: chantiers, isLoading } = useQuery({
    queryKey: ['chantiers', search],
    queryFn: async () => {
      let query = supabase
        .from('chantiers')
        .select('*, devis(*)')
        .order('created_at', { ascending: false });
      
      if (search) {
        query = query.or(`nom_client.ilike.%${search}%,type_projet.ilike.%${search}%,statut.ilike.%${search}%`);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('chantiers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chantiers'] });
      toast.success('Chantier supprimé avec succès');
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('chantiers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chantiers'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chantiers'] });
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
          <h1 className="text-3xl font-bold tracking-tight">Chantiers</h1>
          <p className="text-muted-foreground">Suivez l'avancement des travaux</p>
        </div>
        {canEdit && (
          <Button onClick={() => {
            setSelectedChantier(null);
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau chantier
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par client, type, statut..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chantiers?.map((chantier) => (
            <Card key={chantier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{chantier.nom_client}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {chantier.type_projet || 'Type non spécifié'}
                    </p>
                  </div>
                  <Badge variant={statusColors[chantier.statut] || 'secondary'}>
                    {chantier.statut}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Avancement</span>
                    <span className="text-sm text-muted-foreground">{chantier.avancement_pct}%</span>
                  </div>
                  <Progress value={chantier.avancement_pct || 0} />
                </div>

                {chantier.date_debut && (
                  <p className="text-sm text-muted-foreground">
                    Début: {format(new Date(chantier.date_debut), 'dd MMM yyyy', { locale: fr })}
                  </p>
                )}

                {chantier.date_fin_prevue && (
                  <p className="text-sm text-muted-foreground">
                    Fin prévue: {format(new Date(chantier.date_fin_prevue), 'dd MMM yyyy', { locale: fr })}
                  </p>
                )}

                {chantier.adresse && (
                  <p className="text-sm text-muted-foreground">{chantier.adresse}</p>
                )}

                <div className="flex gap-2">
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedChantier(chantier);
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
                      onClick={() => setDeleteId(chantier.id)}
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

      <ChantierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        chantier={selectedChantier}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce chantier ? Cette action est irréversible.
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
