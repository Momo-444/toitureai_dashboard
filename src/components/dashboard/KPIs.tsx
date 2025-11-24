import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Euro, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const KPIs = () => {
  const { data: leadsCount, isLoading: leadsLoading } = useQuery({
    queryKey: ['leadsCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: devisCount, isLoading: devisCountLoading } = useQuery({
    queryKey: ['devisCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('devis')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: totalRevenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['totalRevenue'],
    queryFn: async () => {
      const { data } = await supabase
        .from('devis')
        .select('montant_ttc')
        .eq('statut', 'payes');
      
      return data?.reduce((sum, devis) => sum + (devis.montant_ttc || 0), 0) || 0;
    },
  });

  const { data: chantiersCount, isLoading: chantiersLoading } = useQuery({
    queryKey: ['chantiersCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('chantiers')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const kpis = [
    {
      title: 'Leads',
      value: leadsCount,
      icon: Users,
      loading: leadsLoading,
    },
    {
      title: 'Devis',
      value: devisCount,
      icon: FileText,
      loading: devisCountLoading,
    },
    {
      title: 'CA Total',
      value: totalRevenue ? `${totalRevenue.toLocaleString('fr-FR')} €` : '0 €',
      icon: Euro,
      loading: revenueLoading,
    },
    {
      title: 'Chantiers',
      value: chantiersCount,
      icon: TrendingUp,
      loading: chantiersLoading,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {kpi.loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{kpi.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
