import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { GreetingBanner } from "@/components/dashboard/greeting-banner";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { LeakCard } from "@/components/dashboard/leak-card";
import { RecentTrips } from "@/components/dashboard/recent-trips";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { SiteHeader } from "@/components/site-header";

export default function DashboardPage() {
  return (
    <>
      <SiteHeader title="Tableau de bord" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <GreetingBanner
              name="Madame la Directrice"
              date="dimanche 15 novembre 2026"
              stats={[
                { label: "voyages en cours", value: 8 },
                { label: "camions bloqués à Cinkassé", value: 3 },
                { label: "alertes de rentabilité", value: 2 },
              ]}
            />

            <KpiCards />

            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-3">
              <div className="min-w-0 @5xl/main:col-span-2">
                <RevenueChart />
              </div>
              <ExpenseBreakdown />
            </div>

            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-3">
              <div className="min-w-0 @5xl/main:col-span-2">
                <RecentTrips />
              </div>
              <LeakCard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
