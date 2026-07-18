import Link from "next/link";
import { ExplorerShell } from "@/features/explorer/components/ExplorerShell";
import { FlowerMark } from "@/features/explorer/components/glyphs";

export default function Home() {
  return (
    <ExplorerShell>
      <main className="absolute inset-0" aria-label="harita">
        {/* Merkez işaretçi = kullanıcının kendi konumu; tıklayınca cüzdanı açılır */}
        <Link
          href="/me"
          aria-label="cüzdanım"
          className="absolute left-[48.5%] top-[38%] transition-opacity hover:opacity-70"
        >
          <span className="flex size-6 items-center justify-center bg-ink text-canvas">
            <FlowerMark className="size-5" />
          </span>
        </Link>
      </main>
    </ExplorerShell>
  );
}
