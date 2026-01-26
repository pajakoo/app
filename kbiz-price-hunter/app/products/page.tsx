import Link from "next/link";
import { products } from "@/lib/products";

export const metadata = {
  title: "Product index | Kbiz Price Hunter",
  description: "Browse public product pages with clean URLs and pricing notes.",
};

export default function ProductsPage() {
  return (
    <main className="page-shell">
      <div className="container">
        <h1>Product index</h1>
        <p className="pill" style={{ marginTop: 12 }}>
          Public, crawlable pages for search bots and customers.
        </p>
        <div className="section product-grid">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="product-card"
            >
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
              <span>{product.priceNote}</span>
              <span>{product.lastChecked}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
