/** Adres kısaltma — Figma deseni: "0243a86yu...htA6opA" (ilk 9 + son 7). */
export function shortAddress(address: string, head = 9, tail = 7): string {
  if (address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

/** Koordinat gösterimi — "x1233 y-1234". */
export function formatCoordinate(c: { x: number; y: number }): string {
  return `x${c.x} y${c.y}`;
}

/** Tarih — Figma deseni "19/04/26 17:51:32", kullanıcı locale/timezone'u ile. */
export function formatTxTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const time = d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${date} ${time}`;
}

/** Arz payı — %0.01 altını "<0.01%" göster, "0%" yazma (spec edge case). */
export function formatSharePct(pct: number): string {
  if (pct > 0 && pct < 0.01) return "<%0.01";
  return `%${pct}`;
}
