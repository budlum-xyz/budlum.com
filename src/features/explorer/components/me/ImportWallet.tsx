"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COPY } from "../../copy";

/**
 * Cüzdan içe aktarma / oluşturma — Figma akışı:
 * 1) Özel anahtar YA DA tohum tümceciği gir
 * 2) koordinat seç → "cüzdanı bu alana aç" → anahtar paneline düşer
 */
export function ImportWallet() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "coordinates">("credentials");
  const [privateKey, setPrivateKey] = useState("");
  const [seed, setSeed] = useState("");
  const [coord, setCoord] = useState("x10000 y435");

  // Validation matrisi (koyu spec §7): seed 12/18/24 kelime; anahtar asgari uzunluk
  const seedWords = seed.trim().split(/\s+/).filter(Boolean);
  const seedFilled = seedWords.length > 0;
  const seedValid = [12, 18, 24].includes(seedWords.length);
  const keyFilled = privateKey.trim().length > 0;
  const keyValid = privateKey.trim().length >= 32;
  const canContinue = (keyFilled && keyValid) || (seedFilled && seedValid);
  const coordValid = /^x-?\d+\s+y-?\d+$/.test(coord.trim());

  if (step === "credentials") {
    return (
      <div className="flex flex-col gap-5 p-8">
        {/* Avatar yer tutucuları — Figma'daki 3 kademeli kare yığını */}
        <div className="flex flex-col gap-2">
          <span aria-hidden className="size-24 bg-ink" />
          <span aria-hidden className="size-14 bg-ink" />
          <span aria-hidden className="size-8 bg-ink" />
        </div>

        <label className="flex flex-col gap-2 text-base">
          {COPY.me.privateKey}
          <textarea
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder={COPY.me.importPlaceholder}
            rows={3}
            autoComplete="off"
            spellCheck={false}
            className="resize-none border border-border bg-surface p-3 font-data text-sm outline-none placeholder:text-muted focus:border-sage"
          />
          {keyFilled && !keyValid ? (
            <span role="alert" className="text-sm text-token-rose">
              {COPY.wallet.keyFormatError}
            </span>
          ) : null}
        </label>

        <span className="text-center text-base text-sage-dark">{COPY.me.or}</span>

        <label className="flex flex-col gap-2 text-base">
          {COPY.me.seedPhrase}
          <textarea
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder={COPY.me.importPlaceholder}
            rows={3}
            autoComplete="off"
            spellCheck={false}
            className="resize-none border border-border bg-surface p-3 font-data text-sm outline-none placeholder:text-muted focus:border-sage"
          />
          {seedFilled && !seedValid ? (
            <span role="alert" className="text-sm text-token-rose">
              {COPY.wallet.seedLengthError}
            </span>
          ) : null}
        </label>

        <button
          type="button"
          disabled={!canContinue}
          onClick={() => setStep("coordinates")}
          className="w-fit self-center border border-border px-5 py-1 text-base transition-opacity enabled:hover:bg-surface disabled:opacity-30"
        >
          {COPY.me.continue}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex flex-col gap-2">
        <span aria-hidden className="size-24 bg-ink" />
        <span aria-hidden className="size-14 bg-ink" />
        <span aria-hidden className="size-8 bg-ink" />
      </div>

      <label className="flex flex-col gap-2 text-base">
        {COPY.me.coordinates}
        <input
          value={coord}
          onChange={(e) => setCoord(e.target.value)}
          placeholder="x10000 y435"
          className="border border-border bg-surface p-3 font-data text-base outline-none placeholder:text-muted focus:border-sage"
        />
      </label>

      <button
        type="button"
        disabled={!coordValid}
        onClick={() => router.push("/me?panel=keys")}
        className="w-fit self-center border border-border px-5 py-1 text-base transition-opacity enabled:hover:bg-surface disabled:opacity-30"
      >
        {COPY.me.openWalletHere}
      </button>
    </div>
  );
}
