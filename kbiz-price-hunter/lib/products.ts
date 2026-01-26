export type Product = {
  slug: string;
  name: string;
  summary: string;
  priceNote: string;
  lastChecked: string;
  highlights: string[];
};

export const products: Product[] = [
  {
    slug: "olive-oil",
    name: "Extra Virgin Olive Oil",
    summary: "Track local store pricing for 1L bottles and bulk tins.",
    priceNote: "Avg range: 18 - 24 BGN",
    lastChecked: "Updated today",
    highlights: [
      "Compare size-per-price",
      "Track regional store changes",
      "Watch for promo dips",
    ],
  },
  {
    slug: "coffee-beans",
    name: "Coffee Beans",
    summary: "Single-origin and blends with roast-level filtering.",
    priceNote: "Avg range: 12 - 22 BGN",
    lastChecked: "Updated yesterday",
    highlights: [
      "Highlight roast + origin",
      "Flag subscription deals",
      "Track 250g vs 1kg",
    ],
  },
  {
    slug: "detergent",
    name: "Laundry Detergent",
    summary: "See bulk pack value per wash across retailers.",
    priceNote: "Avg range: 9 - 18 BGN",
    lastChecked: "Updated 2 days ago",
    highlights: [
      "Price per wash",
      "Compare concentrated formulas",
      "Spot seasonal bundles",
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}
