"use client";

import { useSyncExternalStore } from "react";
import { Sparkle } from "./glyphs";

const STORAGE_KEY = "budlum-theme";
const EVENT = "budlum-theme-change";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/**
 * Sağ üst yıldız — beyaz↔koyu tema geçişi (spec'in açık ürün kararı, kullanıcı onayladı).
 * Kaynak-of-truth <html data-theme>; tercih localStorage'da, FOUC layout inline script'iyle önlenir.
 */
export function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme === "dark",
    () => false,
  );

  function toggle() {
    if (dark) {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = "dark";
    }
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "light" : "dark");
    } catch {
      /* gizli modda sessizce geç */
    }
    window.dispatchEvent(new Event(EVENT));
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
