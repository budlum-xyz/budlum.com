import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { COPY } from "@/features/explorer/copy";

export default function NotFound() {
  return (
    <ExplorerShell>
      <main className="absolute inset-0 flex items-center justify-center">
        <p className="text-xl text-sage-dark">{COPY.states.empty}</p>
      </main>
    </ExplorerShell>
  );
}
