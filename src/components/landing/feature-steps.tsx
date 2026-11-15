"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export type FeatureStep = {
  id: string;
  label: string;
  title: string;
  rest: string;
  image: string;
  alt: string;
  bg: string;
};

/** Fonctions présentées une par une, avec un sommaire collant qui suit la lecture. */
export function FeatureSteps({ steps }: { steps: FeatureStep[] }) {
  const [active, setActive] = useState(steps[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    steps.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [steps]);

  return (
    <div className="grid lg:grid-cols-[300px_1fr]">
      <nav className="hidden border-r border-slate-200 lg:block">
        <ul className="sticky top-24 flex flex-col gap-4 px-10 py-16">
          {steps.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  "block border-l-2 pl-4 text-lg tracking-tight transition-colors",
                  active === s.id ? "border-blue-600 text-slate-900" : "border-slate-200 text-slate-400 hover:text-slate-600",
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-24 px-5 py-16 sm:px-10 lg:px-16">
        {steps.map((s) => (
          <section key={s.id} id={s.id} className="flex scroll-mt-24 flex-col gap-8">
            <h3 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
              <span className="text-slate-900">{s.title}</span> <span className="text-slate-400">{s.rest}</span>
            </h3>
            <div className={cn("overflow-hidden rounded-3xl p-4 sm:p-8", s.bg)}>
              <Image
                src={s.image}
                alt={s.alt}
                width={2880}
                height={1800}
                sizes="(min-width: 1024px) 860px, 100vw"
                className="h-auto w-full rounded-xl border border-white/60"
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
