import type { Metadata } from "next";
import Link from "next/link";
import { Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";

const headingFont = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Kbiz Price Hunter",
  description:
    "Find the best grocery prices across stores with a simple, searchable catalog.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbiz-price-hunter.example"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <header className="site-header">
          <div className="container nav-wrap">
            <Link className="brand" href="/">
              Kbiz Price Hunter
            </Link>
            <nav className="nav-links">
              <Link href="/products">Products</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/login" className="button ghost">
                Get Access
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <h3>Stay in control of prices.</h3>
              <p>
                Built for quick comparisons, clean indexing, and future-ready
                alerts.
              </p>
            </div>
            <div className="footer-links">
              <Link href="/products">Browse products</Link>
              <Link href="/login">Request a magic link</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
