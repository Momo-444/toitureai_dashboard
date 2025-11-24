import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  'nouveau': '#3b82f6',
  'contacte': '#8b5cf6',
  'qualifie': '#10b981',
  'devis_envoye': '#f59e0b',
  'accepte': '#22c55e',
  'refuse': '#ef4444',
  'perdu': '#6b7280',
};

export const LeadsByStatusPie = () => {
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['leadsByStatus'],
    queryFn: async () => {
      const { data: leads } = await supabase
        .from('leads')
        .select('statut');

      const statusCounts: Record<string, number> = {};
      leads?.forEach((lead) => {
        statusCounts[lead.statut] = (statusCounts[lead.statut] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads par statut</CardTitle>
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
        <CardTitle>Leads par statut</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))' 
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
