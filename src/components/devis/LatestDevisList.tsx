import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusColors = {
  'brouillon': 'secondary',
  'envoye': 'default',
  'accepte': 'default',
  'refuse': 'destructive',
} as const;

export const LatestDevisList = () => {
  const { data: devis, isLoading } = useQuery({
    queryKey: ['latestDevis'],
    queryFn: async () => {
      const { data } = await supabase
        .from('devis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Derniers devis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Derniers devis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devis?.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">{d.client_nom}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{d.numero}</span>
                    <span>•</span>
                    <span>{format(new Date(d.date_creation), 'dd MMM yyyy', { locale: fr })}</span>
                  </div>
                  {(d.client_email || d.client_telephone || d.client_adresse) && (
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {d.client_email && <p>{d.client_email}</p>}
                      {d.client_telephone && <p>{d.client_telephone}</p>}
                      {d.client_adresse && <p>{d.client_adresse}</p>}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant={statusColors[d.statut as keyof typeof statusColors] || 'secondary'}>
                  {d.statut}
                </Badge>
                <p className="font-bold">{d.montant_ttc.toLocaleString('fr-FR')} €</p>
                {d.url_pdf && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={d.url_pdf} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
