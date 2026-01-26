import Link from "next/link";
import { getLocalizedProduct, products } from "@/lib/products";
import { getDictionary, type Locale } from "@/lib/i18n";

export const metadata = {
  title: "Product index | Kbiz Price Hunter",
  description: "Browse public product pages with clean URLs and pricing notes.",
};

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const basePath = `/${locale}`;

  return (
    <main className="page-shell">
      <div className="container">
        <h1>{dict.products.title}</h1>
        <p className="pill" style={{ marginTop: 12 }}>
          {dict.products.subtitle}
        </p>
        <div className="section product-grid">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`${basePath}/products/${product.slug}`}
              className="product-card"
            >
              {(() => {
                const localized = getLocalizedProduct(product, locale);
                return (
                  <>
                    <h3>{localized.name}</h3>
                    <p>{localized.summary}</p>
                    <span>{localized.priceNote}</span>
                    <span>{localized.lastChecked}</span>
                  </>
                );
              })()}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
