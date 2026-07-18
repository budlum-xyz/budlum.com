"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COPY } from "../../copy";
import { MOCK_SEED_PHRASE } from "../../queries/fixtures";

/**
 * Yeni cüzdan — 3 adım (spec §8): güvenlik onayı → seed gösterimi → kelime doğrulama.
 * DEMO MOCK: kelimeler sahte fixture'dan; hiçbir secret saklanmaz/gönderilmez.
 * Sayfadan ayrılınca akış baştan başlar (state client-side — spec şartı).
 * TODO(gerçek zincir): kelime üretimi SDK'dan, doğrulama indeksleri gerçekten rastgele.
 */
const WORDS = MOCK_SEED_PHRASE.split(" ");
const VERIFY_INDICES = [2, 6, 10]; // 3., 7. ve 11. kelimeler

export function CreateWalletFlow({ cx, cy }: { cx: number; cy: number }) {
  const router = useRouter();
  const [step, setStep] = useState<"warn" | "seed" | "verify">("warn");
  const [acked, setAcked] = useState(false);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [error, setError] = useState(false);

  if (step === "warn") {
    return (
      <div className="flex flex-col gap-5 p-8">
        <h2 className="text-lg lowercase">{COPY.wallet.securityTitle}</h2>
        <p className="text-base leading-snug text-muted">{COPY.wallet.securityBody}</p>
        <p className="font-data text-sm text-sage-dark">
          x{cx} y{cy}
        </p>
        <label className="flex items-start gap-3 text-base">
          <input
            type="checkbox"
            checked={acked}
            onChange={(e) => setAcked(e.target.checked)}
            className="mt-1 size-4 accent-[#98ae89]"
          />
          {COPY.wallet.securityAck}
        </label>
        <button
          type="button"
          disabled={!acked}
          onClick={() => setStep("seed")}
          className="w-fit self-center border border-border px-5 py-1 text-base enabled:hover:opacity-70 disabled:opacity-30"
        >
          {COPY.me.continue}
        </button>
      </div>
    );
  }

  if (step === "seed") {
    return (
      <div className="flex flex-col gap-5 p-8">
        <h2 className="text-lg">{COPY.wallet.seedTitle}</h2>
        <ol className="grid grid-cols-2 gap-2">
          {WORDS.map((w, i) => (
            <li
              key={i}
              className="flex items-center gap-2 border border-border bg-surface px-3 py-2"
            >
              <span className="font-data text-sm text-muted">{i + 1}</span>
              <span className="font-data text-base">{w}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setStep("verify")}
          className="w-fit self-center border border-border px-5 py-1 text-base hover:opacity-70"
        >
          {COPY.wallet.noted}
        </button>
      </div>
    );
  }

  const nums = VERIFY_INDICES.map((i) => i + 1).join(", ");
  function submit() {
    const ok = VERIFY_INDICES.every(
      (wi, i) => answers[i].trim().toLowerCase() === WORDS[wi],
    );
    if (!ok) {
      setError(true);
      return;
    }
    // Mock aktivasyon — gerçek akışta burada yerel kasa/extension devreye girer
    router.push("/me?panel=keys");
  }

  return (
    <div className="flex flex-col gap-5 p-8">
      <h2 className="text-lg lowercase">{COPY.wallet.verifyTitle}</h2>
      <p className="text-base text-muted">{COPY.wallet.verifyHint(nums)}</p>
      <div className="flex flex-col gap-3">
        {VERIFY_INDICES.map((wi, i) => (
          <label key={wi} className="flex items-center gap-3 text-base">
            <span className="w-6 shrink-0 text-right font-data text-sm text-muted">
              {wi + 1}
            </span>
            <input
              type="text"
              value={answers[i]}
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                setAnswers(next);
                setError(false);
              }}
              autoComplete="off"
              spellCheck={false}
              className="w-full border border-border bg-surface px-3 py-2 font-data text-base outline-none focus:border-sage"
            />
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-base text-token-rose">
          {COPY.wallet.verifyError}
        </p>
      ) : null}
      <button
        type="button"
        disabled={answers.some((a) => !a.trim())}
        onClick={submit}
        className="w-fit self-center border border-border px-5 py-1 text-base enabled:hover:opacity-70 disabled:opacity-30"
      >
        {COPY.wallet.done}
      </button>
    </div>
  );
}
