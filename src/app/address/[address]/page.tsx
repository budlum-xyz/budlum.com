import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { WalletInspector } from "@/features/explorer/components/WalletInspector";
import { FlowerMark, Sparkle } from "@/features/explorer/components/glyphs";
import { WalletGraphView } from "@/features/explorer/graph/WalletGraphView";
import { getWalletRelations, getWalletSummary } from "@/features/explorer/queries";

/**
 * Cüzdan ekranı — wallet-summary durumu (Figma 2870:3749).
 * ?view=graph → wallet-graph durumu (adım 5'te GraphViewport bağlanacak).
 */
export default async function AddressPage({
  params,
  searchParams,
}: {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { address: raw } = await params;
  const address = decodeURIComponent(raw);
  const wallet = await getWalletSummary(address);
  if (!wallet) notFound();
  const { view } = await searchParams;
  const graphOpen = view === "graph";
  const graph = graphOpen ? await getWalletRelations(address) : null;

  return (
    <ExplorerShell initialQuery={address} inspector={<WalletInspector wallet={wallet} />}>
      <main className="absolute inset-0" aria-label="cüzdan haritası">
        {graph ? (
          <WalletGraphView graph={graph} centerId={address} />
        ) : (
          <>
            {/* Minimal merkez görünümü — küçük düğüm + yakın ilişki işaretleri */}
            <div className="absolute left-[43%] top-[37%]">
              <span className="flex size-6 items-center justify-center bg-ink text-canvas">
                <FlowerMark className="size-5" />
              </span>
            </div>
            <div className="absolute left-[45.4%] top-[42.5%]">
              <span className="flex size-8 items-center justify-center border border-border-soft bg-surface text-sage">
                <Sparkle className="size-4" />
              </span>
            </div>
          </>
        )}

        {/* Parıltı kontrolü — grafiği genişletir (alt merkez) */}
        <Link
          href={
            graphOpen
              ? `/address/${encodeURIComponent(address)}`
              : `/address/${encodeURIComponent(address)}?view=graph`
          }
          aria-label={graphOpen ? "grafiği kapat" : "grafiği aç"}
          aria-expanded={graphOpen}
          className="absolute bottom-[7%] left-1/2 -translate-x-1/2 transition-opacity hover:opacity-70"
        >
          <Image
            src={
              graphOpen
                ? "/assets/icons/parilti-kapat.png"
                : "/assets/icons/parilti-ac.png"
            }
            alt=""
            width={64}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </main>
    </ExplorerShell>
  );
}
