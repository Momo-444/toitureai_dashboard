import { RevenueChart } from '@/components/charts/RevenueChart';
import { LeadsByStatusPie } from '@/components/charts/LeadsByStatusPie';
import { TopClientsBar } from '@/components/charts/TopClientsBar';

export default function StatistiquesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-muted-foreground">Analysez vos performances</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        <LeadsByStatusPie />
      </div>

      <TopClientsBar />
    </div>
  );
}
