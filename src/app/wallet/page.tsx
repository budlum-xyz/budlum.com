import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import {
  DEFAULT_PLOT,
  WalletEntryPanel,
  WalletPlots,
} from "@/features/explorer/components/wallet/WalletEntry";

/** Cüzdan girişi — koyu plot picker (batch2 #18): parsel seç → koordinat → oluştur/içe aktar. */
export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ x?: string; y?: string }>;
}) {
  const { x, y } = await searchParams;
  const cx = Number.parseInt(x ?? "", 10) || DEFAULT_PLOT.cx;
  const cy = Number.parseInt(y ?? "", 10) || DEFAULT_PLOT.cy;

  return (
    <ExplorerShell inspector={<WalletEntryPanel cx={cx} cy={cy} />}>
      <main className="absolute inset-0" aria-label="parsel seçimi">
        <WalletPlots cx={cx} cy={cy} />
      </main>
    </ExplorerShell>
  );
}
