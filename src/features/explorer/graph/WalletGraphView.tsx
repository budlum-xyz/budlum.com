"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  WalletInspector,
  WalletInspectorSkeleton,
} from "../components/WalletInspector";
import { TokenIcon, TransferArrow } from "../components/glyphs";
import { COPY } from "../copy";
import { getWalletRelations, getWalletSummary } from "../queries";
import { getEdgeTransfer } from "../queries/fixtures";
import type { GraphEdge, GraphNode, WalletGraph, WalletSummary } from "../types";
import { shortAddress } from "../utils/format";
import { GraphScene } from "./GraphScene";
import { GraphViewport } from "./GraphViewport";

const ANIM_MS = 450;
const MAX_CHILDREN = 5;
const PARENT_SHIFT = 70; // tıklanan taşın dışa kayma mesafesi
const CHILD_SPREAD = 2.1; // ~120° yelpaze — dışa dönük, geriye taşmaz
const CHILD_RADIUS = 175; // ferah dallanma (kullanıcı isteğiyle büyütüldü)

type P = { x: number; y: number };

/**
 * Cüzdan ilişki ağacı — taşa tıkla: taş dışa kayar, bağlantıları etrafına
 * animasyonla açılır; mevcut dallar KAYBOLMAZ, sınırsız dallanır.
 * Edge'e tıkla: iki adres arasındaki transfer bilgisi popover'da.
 */
export function WalletGraphView({
  graph,
  centerId,
}: {
  graph: WalletGraph;
  centerId: string;
}) {
  const [nodes, setNodes] = useState<GraphNode[]>(graph.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(graph.edges);
  const [pos, setPos] = useState<Record<string, P>>(() =>
    Object.fromEntries(graph.nodes.map((n) => [n.id, { x: n.x, y: n.y }])),
  );
  const [selectedId, setSelectedId] = useState(centerId);
  const [popover, setPopover] = useState<{ x: number; y: number; edge: GraphEdge } | null>(
    null,
  );
  // Seçilen taşın cüzdan özeti — sağ paneli client tarafında günceller (ağaç state'i korunur)
  const [selectedSummary, setSelectedSummary] = useState<
    { loading: true } | { loading: false; data: WalletSummary | null } | null
  >(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(pos);
  const nodesRef = useRef(nodes);
  const expandedRef = useRef(new Set([centerId]));
  const parentOf = useRef<Record<string, string>>({});
  const busyRef = useRef(false);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Esc: popover'ı kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPopover(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** from→to konumlarını ease-out ile akıt; reduced-motion'da anında uygula. */
  const animate = useCallback((from: Record<string, P>, to: Record<string, P>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPos((p) => ({ ...p, ...to }));
      busyRef.current = false;
      return;
    }
    const start = performance.now();
    const ids = Object.keys(to);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ANIM_MS);
      const e = 1 - (1 - t) ** 3;
      setPos((p) => {
        const next = { ...p };
        for (const id of ids) {
          const f = from[id];
          const g = to[id];
          next[id] = { x: f.x + (g.x - f.x) * e, y: f.y + (g.y - f.y) * e };
        }
        return next;
      });
      if (t < 1) requestAnimationFrame(tick);
      else busyRef.current = false;
    };
    requestAnimationFrame(tick);
  }, []);

  /** Taşa tıklama: bilgisini sağ panele getir + tek-hop bağlantılarını dalın ucuna aç. */
  const expand = useCallback(
    async (node: GraphNode) => {
      if (!node.address || busyRef.current) return;
      const address = node.address;
      setSelectedId(node.id);
      setPopover(null);
      // Inspector güncellemesi — merkez zaten sayfanın kendi panelinde
      if (address === centerId) {
        setSelectedSummary(null);
      } else {
        setSelectedSummary({ loading: true });
        getWalletSummary(address).then((data) =>
          setSelectedSummary({ loading: false, data }),
        );
      }
      if (expandedRef.current.has(node.id)) return; // zaten dallanmış — sadece seç
      busyRef.current = true;
      expandedRef.current.add(node.id);

      const rel = await getWalletRelations(node.address);
      const parentPos = posRef.current[node.id];
      const originId = parentOf.current[node.id] ?? centerId;
      const originPos = posRef.current[originId] ?? { x: 0, y: 0 };
      const outward = Math.atan2(parentPos.y - originPos.y, parentPos.x - originPos.x);

      // Tıklanan taş biraz dışarı ilerler
      const newParent: P = {
        x: parentPos.x + Math.cos(outward) * PARENT_SHIFT,
        y: parentPos.y + Math.sin(outward) * PARENT_SHIFT,
      };
      const from: Record<string, P> = { [node.id]: parentPos };
      const to: Record<string, P> = { [node.id]: newParent };

      const kids = rel.nodes
        .filter((k) => k.visualVariant === "stone")
        .slice(0, MAX_CHILDREN);
      const newNodes: GraphNode[] = [];
      const newEdges: GraphEdge[] = [];

      kids.forEach((kid, i) => {
        const edgeId = `${node.id}->${kid.id}`;
        const exists = nodesRef.current.some((ex) => ex.id === kid.id);
        if (!exists) {
          const a =
            outward +
            (kids.length === 1 ? 0 : CHILD_SPREAD * (i / (kids.length - 1) - 0.5));
          const r = CHILD_RADIUS + (i % 2) * 40;
          const target: P = {
            x: newParent.x + Math.cos(a) * r,
            y: newParent.y + Math.sin(a) * r,
          };
          newNodes.push({ ...kid, size: kid.size * 0.8 });
          parentOf.current[kid.id] = node.id;
          from[kid.id] = parentPos; // çocuklar ebeveynden doğar
          to[kid.id] = target;
        }
        if (!edges.some((e) => e.id === edgeId)) {
          newEdges.push({ id: edgeId, source: node.id, target: kid.id, relation: "transfer" });
        }
      });

      setNodes((ns) => [...ns, ...newNodes]);
      setEdges((es) => [...es, ...newEdges]);
      setPos((p) => ({
        ...p,
        ...Object.fromEntries(newNodes.map((n) => [n.id, from[n.id]])),
      }));
      animate(from, to);
    },
    [animate, centerId, edges],
  );

  const onEdgeClick = useCallback((edge: GraphEdge, event: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPopover({
      x: Math.min(event.clientX - rect.left, rect.width - 280),
      y: Math.min(event.clientY - rect.top, rect.height - 150),
      edge,
    });
  }, []);

  const positioned = nodes.map((n) => ({
    ...n,
    x: pos[n.id]?.x ?? n.x,
    y: pos[n.id]?.y ?? n.y,
  }));
  const transfer = popover ? getEdgeTransfer(popover.edge.source, popover.edge.target) : null;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <GraphViewport
        onBlankClick={() => {
          // Boş zemin: popover'ı kapat, inspector'ı aranan cüzdana döndür
          setPopover(null);
          setSelectedSummary(null);
          setSelectedId(centerId);
        }}
      >
        <GraphScene
          nodes={positioned}
          edges={edges}
          selectedId={selectedId}
          onNodeClick={expand}
          onEdgeClick={onEdgeClick}
        />
      </GraphViewport>

      {/* Seçilen taşın cüzdan paneli — sayfanın kök panelinin üstünü örter */}
      {selectedSummary ? (
        <aside className="absolute z-20 overflow-y-auto bg-canvas max-lg:inset-x-0 max-lg:bottom-0 max-lg:h-[55vh] max-lg:border-t max-lg:border-border-soft lg:right-[91px] lg:top-[91px] lg:h-[898px] lg:max-h-[calc(100vh-120px)] lg:w-[var(--inspector-width)]">
          {selectedSummary.loading ? (
            <WalletInspectorSkeleton />
          ) : selectedSummary.data ? (
            <WalletInspector wallet={selectedSummary.data} />
          ) : null}
        </aside>
      ) : null}

      {/* Edge transfer popover'ı */}
      {popover && transfer ? (
        <div
          role="dialog"
          aria-label="transfer bilgisi"
          className="absolute z-30 flex w-[260px] flex-col gap-3 border border-border-soft bg-surface p-4 shadow-[var(--shadow-search)]"
          style={{ left: Math.max(8, popover.x), top: Math.max(8, popover.y) }}
        >
          <span className="flex items-center gap-2 font-data text-base">
            <TokenIcon variant={transfer.variant} />
            {transfer.amount} ${transfer.symbol}
          </span>
          <span className="flex items-center gap-2 font-data text-sm text-muted">
            <span title={popover.edge.source}>{shortAddress(popover.edge.source, 6, 4)}</span>
            <TransferArrow className="size-4 shrink-0 text-sage" />
            <span title={popover.edge.target}>{shortAddress(popover.edge.target, 6, 4)}</span>
          </span>
          <Link
            href={`/transactions?address=${encodeURIComponent(popover.edge.source)}&counterparty=${encodeURIComponent(popover.edge.target)}`}
            className="w-fit self-center border border-border px-4 py-1 text-sm hover:opacity-70"
          >
            {COPY.inspector.openTransfers}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
