import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { Sparkle } from "@/features/explorer/components/glyphs";

/** Market — spec kararı: route placeholder; içerik koyu temada tasarlanmış, Faz 2'de gelecek. */
export default function MarketPage() {
  return (
    <ExplorerShell>
      <main className="absolute inset-0 flex items-center justify-center" aria-label="market">
        <div className="flex flex-col items-center gap-4 text-center">
          <Sparkle className="size-8 text-sage" />
          <h1 className="text-2xl">Market</h1>
          <p className="text-base text-sage-dark">yakında</p>
        </div>
      </main>
    </ExplorerShell>
  );
}
