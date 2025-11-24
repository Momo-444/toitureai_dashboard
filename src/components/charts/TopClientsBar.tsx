import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TopClientsBar = () => {
  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['topClients'],
    queryFn: async () => {
      const { data: devis } = await supabase
        .from('devis')
        .select('client_nom, montant_ttc')
        .eq('statut', 'accepte');

      const clientTotals: Record<string, number> = {};
      devis?.forEach((d) => {
        clientTotals[d.client_nom] = (clientTotals[d.client_nom] || 0) + (d.montant_ttc || 0);
      });

      return Object.entries(clientTotals)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 clients</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 clients</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={clientsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              className="text-xs"
              tickFormatter={(value) => `${value.toLocaleString()}€`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              className="text-xs"
              width={120}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, 'CA Total']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))' 
              }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
