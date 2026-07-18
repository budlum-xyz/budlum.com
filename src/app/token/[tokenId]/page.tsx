import { notFound } from "next/navigation";
import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { WalletInspector } from "@/features/explorer/components/WalletInspector";
import { TokenGraphView } from "@/features/explorer/graph/TokenGraphView";
import { getTokenDistribution, getWalletSummary } from "@/features/explorer/queries";
import { TOKENS } from "@/features/explorer/queries/fixtures";

/**
 * Token arz dağılımı — Figma 2921:712; node seçiminde sağ panel + %etiket (2961:486).
 */
export default async function TokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ tokenId: string }>;
  searchParams: Promise<{ selected?: string }>;
}) {
  const { tokenId: raw } = await params;
  const tokenId = decodeURIComponent(raw).toLowerCase();
  if (!TOKENS[tokenId]) notFound();

  const { selected } = await searchParams;
  const [graph, selectedWallet] = await Promise.all([
    getTokenDistribution(tokenId),
    selected ? getWalletSummary(selected) : Promise.resolve(null),
  ]);

  return (
    <ExplorerShell
      initialQuery={TOKENS[tokenId].symbol}
      inspector={selectedWallet ? <WalletInspector wallet={selectedWallet} /> : undefined}
    >
      <main className="absolute inset-0" aria-label="token arz dağılımı">
        <TokenGraphView graph={graph} tokenId={tokenId} selectedId={selected} />
      </main>
    </ExplorerShell>
  );
}
