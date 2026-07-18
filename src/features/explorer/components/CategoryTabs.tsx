import Link from "next/link";
import { MARKET_CATEGORIES } from "../queries/fixtures";

/**
 * Kategori filtre pilleri — Figma Market/Revaştakiler: çerçeveli dikdörtgenler,
 * aktif olan ink, diğerleri sage çerçeveli. Filtre görsel (mock veri tek kategori).
 */
export function CategoryTabs({ base, active }: { base: string; active: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {MARKET_CATEGORIES.map((cat) => {
        const isActive = cat === active;
        return (
          <Link
            key={cat}
            href={cat === "All" ? base : `${base}?cat=${encodeURIComponent(cat)}`}
            replace
            aria-current={isActive ? "true" : undefined}
            className={`border px-5 py-1 text-base transition-opacity hover:opacity-70 ${
              isActive ? "border-ink text-ink" : "border-sage text-sage-dark"
            }`}
          >
            {cat}
          </Link>
        );
      })}
    </div>
  );
}
