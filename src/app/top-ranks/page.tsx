import { CategoryTabs } from "@/features/explorer/components/CategoryTabs";
import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { AppIcon, Sparkle } from "@/features/explorer/components/glyphs";
import { COPY } from "@/features/explorer/copy";
import { TRENDING_ROWS } from "@/features/explorer/queries/fixtures";

/** Top ranks (Revaştakiler) — numaralı uygulama sıralaması (Figma 2277:28). */
export default async function TopRanksPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat = "All" } = await searchParams;

  return (
    <ExplorerShell hideNav>
      <main className="absolute inset-0" aria-label="top ranks">
        <div className="flex h-full flex-col px-[12.5vw] pt-[160px]">
          <div className="flex items-center gap-3">
            <Sparkle filled className="size-6 text-sage" />
            <h1 className="text-2xl">{COPY.nav.topRanks}</h1>
          </div>

          <div className="mt-5">
            <CategoryTabs base="/top-ranks" active={cat} />
          </div>

          <ol className="mt-8 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
            {TRENDING_ROWS.map((row) => (
              <li key={row.rank} className="flex items-center gap-5">
                <span className="w-6 shrink-0 text-right font-data text-lg text-muted">
                  {row.rank}
                </span>
                <AppIcon icon={row.icon} />
                <span className="flex flex-col leading-tight">
                  <span className="text-base">{row.name}</span>
                  <span className="text-sm text-sage-dark">{row.category}</span>
                </span>
              </li>
            ))}
          </ol>

          <button
            type="button"
            className="mb-8 w-fit text-base text-sage-dark underline underline-offset-4 hover:opacity-70"
          >
            {COPY.market.allApps}
          </button>
        </div>
      </main>
    </ExplorerShell>
  );
}
