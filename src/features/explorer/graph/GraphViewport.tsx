"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

/**
 * Pan/zoom canvas — 1920x1080 tasarım uzayı, origin (0,0) = ekran merkezi.
 * Sürükleme ile pan, tekerlek ile zoom (0.4x–3x). Renderer arayüzü SVG;
 * ileride Canvas/WebGL'e geçilebilsin diye sahne çocuk olarak verilir.
 */
export function GraphViewport({
  children,
  onBlankClick,
}: {
  children: ReactNode;
  onBlankClick?: () => void;
}) {
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number; moved: boolean } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      // Sadece boş zemin sürüklenir; node'lar kendi tıklamasını yönetir
      if ((e.target as Element).closest("[data-node]")) return;
      (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
      drag.current = { startX: e.clientX, startY: e.clientY, ox: transform.x, oy: transform.y, moved: false };
    },
    [transform],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const { startX, startY, ox, oy } = drag.current;
    if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > 4) {
      drag.current.moved = true;
    }
    setTransform((t) => ({ ...t, x: ox + e.clientX - startX, y: oy + e.clientY - startY }));
  }, []);

  const endDrag = useCallback(() => {
    // Sürüklemeden bırakıldıysa boş zemin tıklaması say → seçimi temizle
    if (drag.current && !drag.current.moved) onBlankClick?.();
    drag.current = null;
  }, [onBlankClick]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    setTransform((t) => {
      const k = Math.min(3, Math.max(0.4, t.k * (e.deltaY < 0 ? 1.1 : 0.9)));
      return { ...t, k };
    });
  }, []);

  return (
    <svg
      className="absolute inset-0 size-full cursor-grab touch-none active:cursor-grabbing"
      viewBox="-960 -540 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onWheel={onWheel}
      role="application"
      aria-label="ilişki haritası — sürükleyerek gezinin, tekerlekle yakınlaştırın"
    >
      <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
        {children}
      </g>
    </svg>
  );
}
