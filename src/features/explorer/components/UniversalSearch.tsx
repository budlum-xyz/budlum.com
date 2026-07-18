"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COPY } from "../copy";
import { classifyQuery } from "../queries";

/** Arama çubuğu — Figma: 1204x64 @2x → 602x32, radius 8, sage glow. */
export function UniversalSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = classifyQuery(query);
    if (!result) return;
    if (result.kind === "token") {
      router.push(`/token/${encodeURIComponent(result.tokenId)}`);
    } else {
      router.push(`/address/${encodeURIComponent(result.address)}`);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-8 w-[602px] max-w-[80vw] items-center gap-2 rounded-lg border border-border-soft bg-surface px-3 shadow-[var(--shadow-search)]"
    >
      <SparkleGlyph className="size-3.5 shrink-0 text-sage" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={COPY.searchPlaceholder}
        aria-label={COPY.searchPlaceholder}
        className="h-full w-full bg-transparent text-center text-base text-ink outline-none placeholder:text-sage"
      />
      <button
        type="submit"
        aria-label="ara"
        className="shrink-0 text-sage transition-opacity hover:opacity-70"
      >
        <PlayGlyph className="size-3.5" />
      </button>
    </form>
  );
}

/** 4 köşeli parıltı — markanın temel glifi. */
function SparkleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2C12 8 8 12 2 12C8 12 12 16 12 22C12 16 16 12 22 12C16 12 12 8 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 4L20 12L6 20V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
