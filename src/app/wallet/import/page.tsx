import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { ImportWallet } from "@/features/explorer/components/me/ImportWallet";
import {
  DEFAULT_PLOT,
  WalletPlots,
} from "@/features/explorer/components/wallet/WalletEntry";

/** Mevcut cüzdanı içe aktar — özel anahtar YA DA tohum tümceciği (koyu, demo mock). */
export default function ImportWalletPage() {
  return (
    <ExplorerShell inspector={<ImportWallet />}>
      <main className="absolute inset-0" aria-label="cüzdan içe aktarma">
        <WalletPlots cx={DEFAULT_PLOT.cx} cy={DEFAULT_PLOT.cy} />
      </main>
    </ExplorerShell>
  );
}
