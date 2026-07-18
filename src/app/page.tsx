import Link from "next/link";
import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { PixelEye, SparkleLine } from "@/features/explorer/components/glyphs";
import { HomeYouCard } from "@/features/explorer/components/me/HomeYouCard";
import { OWN_ACCOUNTS } from "@/features/explorer/queries/fixtures";

/**
 * Ana ekran — Figma 2856:4578 "budlum.xyz ye giriş yaptı":
 * ortada piksel gözler, sağ üstte kompakt You kartı, alt ortada parıltı kontrolü.
 */
export default function Home() {
  const you = OWN_ACCOUNTS[0];
  return (
    <ExplorerShell>
      <main className="absolute inset-0" aria-label="harita">
        <HomeYouCard />

        {/* Piksel gözler — hücreler arka plan desen karolarını (30px grid) birebir boyar;
            .eyes-grid konumu merkeze en yakın karo sınırına yuvarlar. */}
        <div className="eyes-grid absolute flex gap-[120px] text-ink">
          <PixelEye className="size-[150px]" />
          <PixelEye className="size-[150px]" />
        </div>

        {/* Parıltı kontrolü — kendi cüzdanının ilişki grafiğini açar */}
        <Link
          href={`/address/${encodeURIComponent(you.address)}?view=graph`}
          aria-label="grafiği aç"
          className="absolute bottom-[55px] left-1/2 -translate-x-1/2 border border-sage/60 px-4 py-1.5 text-ink transition-opacity hover:opacity-70"
        >
          <SparkleLine className="h-7 w-auto" />
        </Link>
      </main>
    </ExplorerShell>
  );
}
