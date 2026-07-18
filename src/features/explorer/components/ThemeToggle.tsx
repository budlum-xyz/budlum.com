"use client";

import { useEffect, useState } from "react";
import { Sparkle } from "./glyphs";

const STORAGE_KEY = "budlum-theme";

/**
 * Sağ üst yıldız — beyaz↔koyu tema geçişi (spec'in açık ürün kararı, kullanıcı onayladı).
 * Tercih localStorage'da; FOUC layout.tsx'teki inline script ile önlenir.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.dataset.theme = "dark";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* gizli modda sessizce geç */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "açık temaya geç" : "koyu temaya geç"}
      aria-pressed={dark}
      className="pointer-events-auto absolute right-6 top-5 text-ink transition-opacity hover:opacity-70"
    >
      <Sparkle filled className="size-6 rotate-45" />
    </button>
  );
}
