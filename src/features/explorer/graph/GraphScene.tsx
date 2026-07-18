"use client";

import { useState } from "react";
import type { GraphEdge, GraphNode } from "../types";
import { formatSharePct } from "../utils/format";

/**
 * SVG sahnesi — taş/yıldız node'lar + sage edge'ler.
 * Tasarımcı şartları: hover'da kare hitbox görünür; seçili node sage çerçeveli;
 * hover edge'i vurgulanır, diğerleri soluklaşır.
 */
export function GraphScene({
  nodes,
  edges,
  selectedId,
  showSharePct = false,
  onNodeClick,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId?: string;
  showSharePct?: boolean;
  onNodeClick?: (node: GraphNode) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <>
      {/* Edge'ler node'ların altında */}
      {edges.map((e) => {
        const s = byId.get(e.source);
        const t = byId.get(e.target);
        if (!s || !t) return null;
        const active =
          hoveredId === e.source || hoveredId === e.target ||
          selectedId === e.source || selectedId === e.target;
        const dimmed = (hoveredId || null) !== null && !active;
        return (
          <line
            key={e.id}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke={e.relation === "distribution" ? "#060705" : "#98ae89"}
            strokeWidth={active ? 1.6 : 1}
            opacity={dimmed ? 0.25 : 1}
          />
        );
      })}

      {nodes.map((node) => {
        const hovered = hoveredId === node.id;
        const selected = selectedId === node.id;
        const half = node.size / 2;
        // Hitbox en az 44x44 CSS px (a11y, koyu spec §16)
        const boxPad = Math.max(6, (44 - node.size) / 2);
        const interactive = Boolean(onNodeClick) && !selected;
        return (
          <g
            key={node.id}
            data-node
            transform={`translate(${node.x} ${node.y})`}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? "button" : undefined}
            aria-label={node.label ?? node.address ?? node.id}
            className={interactive ? "cursor-pointer outline-none" : undefined}
            onPointerEnter={() => setHoveredId(node.id)}
            onPointerLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(node.id)}
            onBlur={() => setHoveredId(null)}
            onClick={() => interactive && onNodeClick?.(node)}
            onKeyDown={(e) => {
              if (interactive && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onNodeClick?.(node);
              }
            }}
          >
            <image
              href={
                node.visualVariant === "star"
                  ? "/assets/stones/star-stone.png"
                  : `/assets/stones/stone-${String(node.stoneIndex ?? 1).padStart(2, "0")}.png`
              }
              x={-half}
              y={-half}
              width={node.size}
              height={node.size}
              preserveAspectRatio="xMidYMid meet"
            />
            {/* Hitbox çerçevesi — hover/focus/seçimde görünür (tasarımcı şartı) */}
            <rect
              x={-half - boxPad}
              y={-half - boxPad}
              width={node.size + boxPad * 2}
              height={node.size + boxPad * 2}
              fill="none"
              stroke="#98ae89"
              strokeWidth={selected ? 2 : 1.5}
              opacity={hovered || selected ? 1 : 0}
            />
            {/* Arz payı rozeti — token grafiğinde hover/seçimde (%2.3 gibi) */}
            {showSharePct && node.sharePct !== undefined && (hovered || selected) ? (
              <text
                x={half + boxPad + 4}
                y={-half - boxPad - 4}
                fill="#6e8560"
                fontSize={17}
                fontFamily="var(--font-ui)"
              >
                {formatSharePct(node.sharePct)}
              </text>
            ) : null}
          </g>
        );
      })}
    </>
  );
}
