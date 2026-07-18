import { CategoryTabs } from "@/features/explorer/components/CategoryTabs";
import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { Sparkle } from "@/features/explorer/components/glyphs";
import { COPY } from "@/features/explorer/copy";
import { MARKET_ROWS } from "@/features/explorer/queries/fixtures";
import { shortAddress } from "@/features/explorer/utils/format";

/** Market — token listesi tablosu (Figma 2413:2181, koyu tasarım; her iki temada token'larla çalışır). */
export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat = "All" } = await searchParams;
  const c = COPY.market.columns;

  return (
    <ExplorerShell hideNav>
      <main className="absolute inset-0" aria-label="market">
        <div className="flex h-full flex-col px-[12.5vw] pt-[160px]">
          <div className="flex items-center gap-3">
            <Sparkle filled className="size-6 text-sage" />
            <h1 className="text-2xl">{COPY.market.title}</h1>
          </div>

          <div className="mt-5">
            <CategoryTabs base="/market" active={cat} />
          </div>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-8">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border text-left text-base font-normal">
                  {[c.token, c.symbol, c.price, c.marketCap, c.holders, c.lastWeek, c.lastYear, c.address].map(
                    (h) => (
                      <th key={h} className="bg-canvas py-3 pr-4 font-normal first:pl-16">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {MARKET_ROWS.map((row) => (
                  <tr key={row.id} className="font-data text-base">
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-4">
                        {/* bg-ink: koyu temada beyaz daire (Figma), açıkta koyu — her ikisinde görünür */}
                        <span aria-hidden className="size-7 shrink-0 rounded-full bg-ink" />
                        <span className="flex items-center gap-2 font-ui text-sage-dark">
                          {row.token}
                          {row.verified ? <VerifiedGlyph className="size-4 text-sage" /> : null}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 pr-4">{row.symbol}</td>
                    <td className="py-3 pr-4">{row.price}</td>
                    <td className="py-3 pr-4">{row.marketCap}</td>
                    <td className="py-3 pr-4">{row.holders}</td>
                    <td className="py-3 pr-4 text-token-rose">{row.lastWeek}</td>
                    <td className="py-3 pr-4 text-sage-dark">{row.lastYear}</td>
                    <td className="py-3" title={row.address}>
                      {shortAddress(row.address, 10, 5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </ExplorerShell>
  );
}

function VerifiedGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="doğrulanmış">
      <path
        d="M4 12C7 13 9 15 10 18C13 13 16 9 21 6C15 8 11 8 4 12Z"
        fill="currentColor"
      />
    </svg>
  );
}
