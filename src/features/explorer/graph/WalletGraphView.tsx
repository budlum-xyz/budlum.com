"use client";

import { useRouter } from "next/navigation";
import type { WalletGraph } from "../types";
import { GraphScene } from "./GraphScene";
import { GraphViewport } from "./GraphViewport";

/** Cüzdan ilişki grafiği — tek hop outgoing; taşa tıklayınca o cüzdana gidilir. */
export function WalletGraphView({
  graph,
  centerId,
}: {
  graph: WalletGraph;
  centerId: string;
}) {
  const router = useRouter();
  return (
    <GraphViewport>
      <GraphScene
        nodes={graph.nodes}
        edges={graph.edges}
        selectedId={centerId}
        onNodeClick={(node) => {
          if (node.address && node.address !== centerId) {
            router.push(`/address/${encodeURIComponent(node.address)}?view=graph`);
          }
        }}
      />
    </GraphViewport>
  );
}
