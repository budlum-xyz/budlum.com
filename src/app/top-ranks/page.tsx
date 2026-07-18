import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { Sparkle } from "@/features/explorer/components/glyphs";

/** Top ranks — spec kararı: route placeholder; içerik Faz 2'de gelecek. */
export default function TopRanksPage() {
  return (
    <ExplorerShell>
      <main className="absolute inset-0 flex items-center justify-center" aria-label="top ranks">
        <div className="flex flex-col items-center gap-4 text-center">
          <Sparkle className="size-8 text-sage" />
          <h1 className="text-2xl">Top ranks</h1>
          <p className="text-base text-sage-dark">yakında</p>
        </div>
      </main>
    </ExplorerShell>
  );
}
