"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useCareer } from "@/contexts/career-context";
import { cn } from "@/lib/utils";

const LOGO = {
  light: "/brand/logo-light.png",
  dark: "/brand/logo-dark.png",
} as const;

export function AlmaramLogo({
  className,
  showWordmark = true,
  markSize = 40,
}: {
  className?: string;
  showWordmark?: boolean;
  markSize?: number;
}) {
  const { t } = useCareer();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative shrink-0 overflow-hidden rounded-[14px]"
        style={{ width: markSize, height: markSize }}
      >
        <AlmaramMark size={markSize} className="size-full" />
      </div>
      {showWordmark ? (
        <div className="leading-none">
          <p className="text-[17px] font-semibold tracking-tight text-foreground">
            {t.brand}
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">
            {t.brandNative} · {t.tagline}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function AlmaramMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const src =
    mounted && resolvedTheme === "light" ? LOGO.light : LOGO.dark;

  return (
    <Image
      src={src}
      alt="Almaram"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority
    />
  );
}
