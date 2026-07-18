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
  hideNav = false,
}: {
  children: ReactNode;
  inspector?: ReactNode;
  initialQuery?: string;
  hideNav?: boolean;
}) {
  return (
    <div className="relative h-screen overflow-hidden">
      <BrandHeader initialQuery={initialQuery} />
      {hideNav ? null : <ExplorerNav />}
      {children}
      {inspector ? (
        // ≥1024: sağ sütun (1024-1599'da canvas üstünde overlay); <1024: bottom sheet (spec §13)
        <aside className="absolute z-10 overflow-y-auto bg-canvas max-lg:inset-x-0 max-lg:bottom-0 max-lg:h-[55vh] max-lg:border-t max-lg:border-border-soft lg:right-[91px] lg:top-[91px] lg:h-[898px] lg:max-h-[calc(100vh-120px)] lg:w-[var(--inspector-width)]">
          {inspector}
        </aside>
      ) : null}
    </div>
  );
}
