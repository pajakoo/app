import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Dashboard | Kbiz Price Hunter",
  description: "Private pricing workspace for lists and store comparisons.",
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="page-shell">
      <div className="container">
        <h1>Dashboard</h1>
        <p style={{ marginTop: 12, color: "var(--ink-muted)" }}>
          Welcome back, {session.user.email}. You can now build lists and track
          prices in private.
        </p>
        <div
          className="section grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
        >
          <div className="card">
            <h3>Shopping lists</h3>
            <p>Create and share lists once auth is connected.</p>
          </div>
          <div className="card">
            <h3>Store comparisons</h3>
            <p>Track price shifts across your preferred stores.</p>
          </div>
          <div className="card">
            <h3>Alerts</h3>
            <p>Schedule price-drop alerts by product or category.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="button ghost" href="/products">
            Browse public products
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="button" type="submit">
              Log out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
