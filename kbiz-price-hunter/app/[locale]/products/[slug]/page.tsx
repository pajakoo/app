import { notFound } from "next/navigation";
import ProductPriceChart from "@/app/products/ProductPriceChart";
import { getLocalizedProduct, getProduct, products } from "@/lib/products";
import { getDictionary, locales, type Locale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ slug: string; locale: Locale }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    products.map((product) => ({ slug: product.slug, locale }))
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;
  const product = getProduct(slug);
  if (!product) {
    return { title: "Product not found | Kbiz Price Hunter" };
  }
  const localized = getLocalizedProduct(product, locale);

  return {
    title: `${localized.name} | Kbiz Price Hunter`,
    description: localized.summary,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const dict = getDictionary(locale);
  const product = getProduct(slug);
  if (!product) {
    notFound();
  }
  const localized = getLocalizedProduct(product, locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localized.name,
    description: localized.summary,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: "9.00",
      highPrice: "24.00",
    },
  };

  return (
    <main className="page-shell">
      <div className="container">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <span className="pill">{dict.product.publicTag}</span>
        <div className="product-hero">
          <div>
            <h1 style={{ marginTop: 16 }}>{localized.name}</h1>
            <p style={{ marginTop: 12, color: "var(--ink-muted)" }}>
              {localized.summary}
            </p>
          </div>
          <div className="product-hero-image" aria-hidden="true" />
        </div>

        <section className="section">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div className="card">
              <h3>{dict.product.snapshot}</h3>
              <p>{localized.priceNote}</p>
              <p>{localized.lastChecked}</p>
            </div>
            <div className="card">
              <h3>{dict.product.track}</h3>
              <ul style={{ marginTop: 12, paddingLeft: 18, color: "var(--ink-muted)" }}>
                {localized.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3>Quick stats</h3>
              <div className="stats-grid">
                <div>
                  <span className="stat-label">Best price</span>
                  <strong>9.40 EUR</strong>
                </div>
                <div>
                  <span className="stat-label">Avg price</span>
                  <strong>14.80 EUR</strong>
                </div>
                <div>
                  <span className="stat-label">Stores tracked</span>
                  <strong>6</strong>
                </div>
                <div>
                  <span className="stat-label">Last update</span>
                  <strong>Today</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Price history</h2>
          <div className="card">
            <ProductPriceChart slug={slug} currencyLabel="EUR" />
          </div>
        </section>

        <section className="section">
          <h2>Store comparison</h2>
          <div className="card table-shell">
            <table className="price-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Package</th>
                  <th>Price</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fresh Mart</td>
                  <td>1L bottle</td>
                  <td>9.40 EUR</td>
                  <td>2h ago</td>
                </tr>
                <tr>
                  <td>Market One</td>
                  <td>1L bottle</td>
                  <td>10.10 EUR</td>
                  <td>Yesterday</td>
                </tr>
                <tr>
                  <td>SuperBox</td>
                  <td>750ml bottle</td>
                  <td>8.90 EUR</td>
                  <td>3 days ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
