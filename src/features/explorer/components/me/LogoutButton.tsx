"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { COPY } from "../../copy";

/**
 * İki aşamalı çıkış — Figma anotasyonu: ilk tık mor "çıkmak için tekrar tıkla"
 * piline dönüşür, ikinci tık çıkarır. 3 sn dokunulmazsa geri döner.
 */
export function LogoutButton() {
  const router = useRouter();
  const [arming, setArming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function onClick() {
    if (!arming) {
      setArming(true);
      timer.current = setTimeout(() => setArming(false), 3000);
      return;
    }
    router.push("/"); // mock çıkış — gerçek oturum katmanı zincir SDK'sıyla gelecek
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        arming
          ? "w-fit self-center rounded-full border border-token-purple px-5 py-1 text-base text-token-purple transition-colors"
          : "w-fit self-center border border-border px-5 py-1 text-base hover:bg-surface"
      }
    >
      {arming ? COPY.me.logoutConfirm : COPY.me.logout}
    </button>
  );
}
