import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PriceChart from "@/app/dashboard/PriceChart";
import { getDictionary, type Locale } from "@/lib/i18n";

export const metadata = {
  title: "Dashboard | Kbiz Price Hunter",
  description: "Private pricing workspace for lists and store comparisons.",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  const dict = getDictionary(locale);
  const basePath = `/${locale}`;

  if (!session) {
    redirect(`${basePath}/login`);
  }

  return (
    <main className="page-shell">
      <div className="container">
        <h1>{dict.dashboard.title}</h1>
        <p style={{ marginTop: 12, color: "var(--ink-muted)" }}>
          {dict.dashboard.welcomeLine.replace("{email}", session.user.email)}
        </p>
        <div
          className="section grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
        >
          <div className="card">
            <h3>{dict.dashboard.lists}</h3>
            <p>{dict.dashboard.listsBody}</p>
          </div>
          <div className="card">
            <h3>{dict.dashboard.stores}</h3>
            <p>{dict.dashboard.storesBody}</p>
          </div>
          <div className="card">
            <h3>{dict.dashboard.alerts}</h3>
            <p>{dict.dashboard.alertsBody}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="button ghost" href={`${basePath}/products`}>
            {dict.dashboard.browse}
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="button" type="submit">
              {dict.dashboard.logout}
            </button>
          </form>
        </div>
        <PriceChart
          productLabel={dict.chart.product}
          storeLabel={dict.chart.store}
          allStoresLabel={dict.chart.allStores}
          currencyLabel="EUR"
        />
      </div>
    </main>
  );
}
