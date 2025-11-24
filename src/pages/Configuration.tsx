import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Configuration } from '@/types/database';

export default function ConfigurationPage() {
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['configuration'],
    queryFn: async () => {
      const { data } = await supabase.from('configuration').select('*').single();
      return data;
    },
  });

  const { register, handleSubmit, reset } = useForm<Configuration>({
    values: config || undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Configuration>) => {
      const { error } = await supabase
        .from('configuration')
        .update(data)
        .eq('id', config?.id || '');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuration'] });
      toast.success('Configuration mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  const onSubmit = (data: Configuration) => {
    if (!isAdmin) {
      toast.error('Seuls les administrateurs peuvent modifier la configuration');
      return;
    }
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">Gérez les paramètres de votre entreprise</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'entreprise</CardTitle>
          <CardDescription>
            Ces informations seront utilisées dans les devis et documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nom_entreprise">Nom de l'entreprise *</Label>
                <Input
                  id="nom_entreprise"
                  {...register('nom_entreprise')}
                  disabled={!isAdmin}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  {...register('siret')}
                  disabled={!isAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!isAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  {...register('telephone')}
                  disabled={!isAdmin}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  {...register('adresse')}
                  disabled={!isAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tva_numero">Numéro de TVA</Label>
                <Input
                  id="tva_numero"
                  {...register('tva_numero')}
                  disabled={!isAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">URL du logo</Label>
                <Input
                  id="logo_url"
                  {...register('logo_url')}
                  disabled={!isAdmin}
                />
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                >
                  Annuler
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
