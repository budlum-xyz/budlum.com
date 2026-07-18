import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { ImportWallet } from "@/features/explorer/components/me/ImportWallet";
import { MeCanvas } from "@/features/explorer/components/me/MeCanvas";

/** Hesap ekle — özel anahtar YA DA tohum tümceciği → koordinat seçimi. */
export default function NewAccountPage() {
  return (
    <ExplorerShell inspector={<ImportWallet />}>
      <main className="absolute inset-0" aria-label="hesap ekle">
        <MeCanvas />
      </main>
    </ExplorerShell>
  );
}
