"use client";

import { useEffect, useRef } from "react";
import InjuryBodyIcon from "@/components/InjuryBodyIcon";

export interface StatItem {
  label: string;
  value: string; // server-rendered final text
  num?: number; // numeric part to count up to
  suffix?: string;
  sub?: string;
  tone?: string;
  icon?: string; // injury type for a small body diagram
  spark?: { data: number[]; color: string; title: string };
}

export function CountUp({ value, num, suffix = "" }: { value: string; num?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || num == null || num <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const D = 900;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / D);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = `${Math.round(num * eased)}${suffix}`;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        el.textContent = `0${suffix}`;
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [num, suffix, value]);
  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

function Sparkline({ data, color, title }: { data: number[]; color: string; title: string }) {
  if (data.length < 2) return null;
  const W = 120, H = 28, pad = 3;
  const max = Math.max(1, ...data);
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (data.length - 1);
  const y = (v: number) => H - pad - (v / max) * (H - 2 * pad);
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line}L${x(data.length - 1).toFixed(1)},${H - pad}L${x(0).toFixed(1)},${H - pad}Z`;
  const last = data.length - 1;
  const id = `sg-${title.replace(/\W+/g, "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-7 w-full max-w-[140px]" role="img" aria-label={title} preserveAspectRatio="none">
      <title>{title}</title>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={x(last)} cy={y(data[last])} r="2.5" fill={color} />
    </svg>
  );
}

export default function StatStrip({ stats }: { stats: StatItem[] }) {
  return (
    <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {stats.map((x) => (
        <div key={x.label} className="glass lift rounded-xl border p-3 sm:p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">{x.label}</dt>
          <dd className={`mt-1 flex items-center gap-2 text-2xl font-bold ${x.tone ?? ""}`}>
            <CountUp value={x.value} num={x.num} suffix={x.suffix} />
            {x.icon && <InjuryBodyIcon type={x.icon} size={28} decorative />}
          </dd>
          {x.sub && <dd className="mt-0.5 text-xs text-muted">{x.sub}</dd>}
          {x.spark && (
            <dd>
              <Sparkline {...x.spark} />
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
