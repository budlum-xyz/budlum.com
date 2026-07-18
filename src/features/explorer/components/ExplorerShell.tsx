import type { ReactNode } from "react";
import { BrandHeader } from "./BrandHeader";
import { ExplorerNav } from "./ExplorerNav";

/**
 * Global yerleşim kabuğu — üstte logo+arama, sol-altta nav, ortada canvas,
 * seçim varsa sağda inspector sütunu (Figma: 448x898, sağ/üst 91px, #FBFCFA).
 */
export function ExplorerShell({
  children,
  inspector,
  initialQuery,
}: {
  children: ReactNode;
  inspector?: ReactNode;
  initialQuery?: string;
}) {
  return (
    <div className="relative h-screen overflow-hidden">
      <BrandHeader initialQuery={initialQuery} />
      <ExplorerNav />
      {children}
      {inspector ? (
        <aside className="absolute right-[91px] top-[91px] z-10 h-[898px] max-h-[calc(100vh-120px)] w-[var(--inspector-width)] overflow-y-auto bg-canvas">
          {inspector}
        </aside>
      ) : null}
    </div>
  );
}
