import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/products";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: PageProps) {
  const product = getProduct(params.slug);
  if (!product) {
    return { title: "Product not found | Kbiz Price Hunter" };
  }

  return {
    title: `${product.name} | Kbiz Price Hunter`,
    description: product.summary,
  };
}

export default function ProductPage({ params }: PageProps) {
  const product = getProduct(params.slug);
  if (!product) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="container">
        <span className="pill">Public product page</span>
        <h1 style={{ marginTop: 16 }}>{product.name}</h1>
        <p style={{ marginTop: 12, color: "var(--ink-muted)" }}>
          {product.summary}
        </p>

        <section className="section">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div className="card">
              <h3>Pricing snapshot</h3>
              <p>{product.priceNote}</p>
              <p>{product.lastChecked}</p>
            </div>
            <div className="card">
              <h3>What we track</h3>
              <ul style={{ marginTop: 12, paddingLeft: 18, color: "var(--ink-muted)" }}>
                {product.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
