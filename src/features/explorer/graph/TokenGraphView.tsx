"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import type { WalletGraph } from "../types";
import { GraphScene } from "./GraphScene";
import { GraphViewport } from "./GraphViewport";

/**
 * Token arz dağılım grafiği — holder seçimi URL query'de taşınır (?selected=).
 * Esc veya boş zemine tıklama seçimi temizler (spec §7).
 */
export function TokenGraphView({
  graph,
  tokenId,
  selectedId,
}: {
  graph: WalletGraph;
  tokenId: string;
  selectedId?: string;
}) {
  const router = useRouter();
  const base = `/token/${encodeURIComponent(tokenId)}`;

  const clearSelection = useCallback(() => {
    if (selectedId) router.replace(base, { scroll: false });
  }, [selectedId, router, base]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") clearSelection();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearSelection]);

  return (
    <GraphViewport onBlankClick={clearSelection}>
      <GraphScene
        nodes={graph.nodes}
        edges={graph.edges}
        selectedId={selectedId}
        showSharePct
        onNodeClick={(node) => {
          if (node.address) {
            router.replace(`${base}?selected=${encodeURIComponent(node.address)}`, {
              scroll: false,
            });
          }
        }}
      />
    </GraphViewport>
  );
}
