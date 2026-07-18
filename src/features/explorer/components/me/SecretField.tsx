"use client";

import { useEffect, useState } from "react";
import { COPY } from "../../copy";

/** Reveal sonrası otomatik gizleme süresi (spec §11: 30 sn). */
const AUTO_HIDE_MS = 30_000;

/**
 * Gizli alan — Figma "Özel anahtar" / "Tohum tümceciği" kutuları.
 * Değer gizliyken "göstermek için göze tıklayınız" yazar; göz toggle'ı gösterir.
 * Güvenlik (spec §11): 30 sn sonra ve sekme arka plana geçince otomatik gizlenir;
 * secret yalnız bu bileşenin state'inde yaşar — storage/network/log'a girmez.
 */
export function SecretField({ label, value }: { label: string; value: string }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setRevealed(false), AUTO_HIDE_MS);
    const onVisibility = () => {
      if (document.hidden) setRevealed(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [revealed]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-base">{label}</span>
      <div className="relative border border-border bg-surface p-3 pb-5">
        <p
          className={`min-h-16 break-all font-data text-sm leading-snug ${
            revealed ? "text-ink" : "text-muted"
          }`}
        >
          {revealed ? value : COPY.me.revealHint}
        </p>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-label={revealed ? `${label} gizle` : `${label} göster`}
          aria-pressed={revealed}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-canvas px-1 text-ink transition-opacity hover:opacity-70"
        >
          <EyeGlyph open={revealed} className="size-5" />
        </button>
      </div>
    </div>
  );
}

/** Göz/lens glifi — elmas formlu (Figma'daki toggle). */
function EyeGlyph({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M2 12C6 6 18 6 22 12C18 18 6 18 2 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {open ? (
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      ) : (
        <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}
