import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { CreateWalletFlow } from "@/features/explorer/components/wallet/CreateWalletFlow";
import {
  DEFAULT_PLOT,
  WalletPlots,
} from "@/features/explorer/components/wallet/WalletEntry";

/** Yeni cüzdan — seçilen parselde oluşturma; seed kaydet + doğrula (koyu). */
export default async function CreateWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ x?: string; y?: string }>;
}) {
  const { x, y } = await searchParams;
  const cx = Number.parseInt(x ?? "", 10) || DEFAULT_PLOT.cx;
  const cy = Number.parseInt(y ?? "", 10) || DEFAULT_PLOT.cy;

  return (
    <ExplorerShell inspector={<CreateWalletFlow cx={cx} cy={cy} />}>
      <main className="absolute inset-0" aria-label="cüzdan oluşturma">
        <WalletPlots cx={cx} cy={cy} />
      </main>
    </ExplorerShell>
  );
}
