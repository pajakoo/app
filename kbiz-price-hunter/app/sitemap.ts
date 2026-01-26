import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbiz-price-hunter.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const productEntries = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    ...productEntries,
  ];
}
