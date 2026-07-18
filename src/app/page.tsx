import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";

export default function Home() {
  return (
    <ExplorerShell>
      <main className="absolute inset-0" aria-label="harita" />
    </ExplorerShell>
  );
}
