import { KPIs } from '@/components/dashboard/KPIs';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { LeadsByStatusPie } from '@/components/charts/LeadsByStatusPie';
import { LatestDevisList } from '@/components/devis/LatestDevisList';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      <KPIs />

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        <LeadsByStatusPie />
      </div>

      <LatestDevisList />
    </div>
  );
}
