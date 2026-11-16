"use client";

import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils";

/** Nombre qui « roule » jusqu'à sa nouvelle valeur. */
export function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);
  useMotionValueEvent(mv, "change", (v) => setDisplay(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [mv, value]);

  return (
    <span className="tabular">
      {formatNumber(display)}
      {suffix}
    </span>
  );
}
