import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { WalletInspectorSkeleton } from "@/features/explorer/components/WalletInspector";

export default function Loading() {
  return (
    <ExplorerShell inspector={<WalletInspectorSkeleton />}>
      <main className="absolute inset-0" aria-label="yükleniyor" />
    </ExplorerShell>
  );
}
