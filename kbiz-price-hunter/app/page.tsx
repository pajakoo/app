import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="container hero">
        <span className="pill">Searchable pricing catalog</span>
        <h1>Keep the idea. Cut the clutter.</h1>
        <p>
          Kbiz Price Hunter is a clean, crawlable pricing index for everyday
          groceries. Public product pages are optimized for search bots, while
          the private dashboard stays focused on your shopping workflows.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/products">
            Browse products
          </Link>
          <Link className="button ghost" href="/login">
            Request a magic link
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="card">
            <h3>Indexable by default</h3>
            <p>
              Product pages are server-rendered with sitemap + robots metadata so
              search bots actually see them.
            </p>
          </div>
          <div className="card">
            <h3>Fewer moving parts</h3>
            <p>
              One Next.js app, Prisma, and Postgres. No duplicate servers or
              shadow APIs.
            </p>
          </div>
          <div className="card">
            <h3>Ready for alerts</h3>
            <p>
              Add price-drop alerts or watchlists later without fighting a loose
              schema.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>How it works</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <div className="card">
              <h3>Public catalog</h3>
              <p>
                Each product gets a clean URL and metadata. This is what search
                engines index.
              </p>
            </div>
            <div className="card">
              <h3>Private dashboard</h3>
              <p>
                Signed-in users manage lists, compare stores, and track price
                history.
              </p>
            </div>
            <div className="card">
              <h3>Structured data</h3>
              <p>
                Postgres keeps relationships clear: products, stores, prices,
                and lists stay consistent.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
