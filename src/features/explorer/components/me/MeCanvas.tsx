import { FlowerMark, PixelFigure, Sparkle } from "../glyphs";

/**
 * Kendi cüzdan ekranlarının canvas'ı — merkez işaretçi + alt-orta uygulama ikonları
 * (Figma: Bud / Lum / Fiction kareleri, altlarında etiket).
 */
export function MeCanvas() {
  return (
    <>
      <div className="absolute left-[48.5%] top-[38%]">
        <span className="flex size-6 items-center justify-center bg-ink text-canvas">
          <FlowerMark className="size-5" />
        </span>
      </div>

      <div className="absolute bottom-[6%] left-1/2 flex -translate-x-1/2 items-end gap-6">
        <AppShortcut label="Bud">
          <FlowerMark className="size-5 text-sage" />
        </AppShortcut>
        <AppShortcut label="Lum">
          <Sparkle className="size-5 text-ink" />
        </AppShortcut>
        <AppShortcut label="Fiction">
          <PixelFigure className="size-5 text-ink" />
        </AppShortcut>
      </div>
    </>
  );
}

function AppShortcut({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="flex size-10 items-center justify-center border border-border-soft bg-surface">
        {children}
      </span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
