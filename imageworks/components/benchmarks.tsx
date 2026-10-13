"use client";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { softEase, useReducedMotion } from "@/lib/motion";
import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const FIRST_RENDER = [
  44.2, 43.8, 44.1, 43.6, 43.9, 43.3, 43.0, 42.6, 42.9, 42.2, 41.8, 41.5, 40.9,
  38.4, 35.8, 34.5, 33.9, 33.5, 33.2, 32.8, 32.6, 32.3, 32.0, 31.8, 31.6, 31.4,
  31.3, 31.1, 31.0, 31.0,
];
const Y_MIN = 28;
const Y_MAX = 50;
const Y_TICKS = [30, 35, 40, 45];

const VOLUME = [210, 260, 300, 380, 430, 520, 640, 760, 900, 1040, 1220, 1400];
const FIRST_TAKE = 0.62;

const ROUTES: {
  name: string;
  seconds: number;
  label: string;
  ours?: boolean;
}[] = [
  { name: "Imageworks", seconds: 31, label: "31 s", ours: true },
  { name: "Stock search", seconds: 2 * 3600, label: "2 h" },
  { name: "Retouch a shot", seconds: 2 * 86400, label: "2 days" },
  { name: "Book a shoot", seconds: 21 * 86400, label: "3 weeks" },
];
const AXIS_MIN = Math.log10(10);
const AXIS_MAX = Math.log10(60 * 86400);
const AXIS_TICKS: { seconds: number; label: string }[] = [
  { seconds: 60, label: "1 min" },
  { seconds: 3600, label: "1 hour" },
  { seconds: 86400, label: "1 day" },
  { seconds: 7 * 86400, label: "1 week" },
  { seconds: 30 * 86400, label: "1 month" },
];
const pos = (s: number): number =>
  ((Math.log10(s) - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

function CountUp({
  value,
  decimals = 0,
  active,
  className,
}: {
  value: number;
  decimals?: number;
  active: boolean;
  className?: string;
}): ReactNode {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active || reducedMotion) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: softEase,
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [active, value, reducedMotion]);
  const text = (reducedMotion ? value : shown).toFixed(decimals);
  return (
    <span className={className}>
      <span className="sr-only">{value.toFixed(decimals)}</span>
      <span aria-hidden="true" className="tabular-nums">
        {text}
      </span>
    </span>
  );
}

function smoothPath(pts: readonly (readonly [number, number])[]): string {
  const n = pts.length;
  if (n < 2) return "";
  const dx = pts.slice(1).map((p, i) => p[0] - (pts[i]?.[0] ?? 0));
  const dy = pts.slice(1).map((p, i) => p[1] - (pts[i]?.[1] ?? 0));
  const slopes = dy.map((d, i) => d / (dx[i] || 1));
  const m: number[] = [slopes[0] ?? 0];
  for (let i = 1; i < n - 1; i++) {
    const a = slopes[i - 1] ?? 0;
    const b = slopes[i] ?? 0;
    m.push(a * b <= 0 ? 0 : (2 * a * b) / (a + b));
  }
  m.push(slopes[n - 2] ?? 0);
  let d = `M${pts[0]?.[0]} ${pts[0]?.[1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i] ?? [0, 0];
    const [x1, y1] = pts[i + 1] ?? [0, 0];
    const h = (x1 - x0) / 3;
    d += ` C${x0 + h} ${y0 + h * (m[i] ?? 0)}, ${x1 - h} ${y1 - h * (m[i + 1] ?? 0)}, ${x1} ${y1}`;
  }
  return d;
}

function RenderTimeChart({ active }: { active: boolean }): ReactNode {
  const reducedMotion = useReducedMotion();
  const on = active || reducedMotion;
  const W = 1000;
  const H = 1000;
  const n = FIRST_RENDER.length;
  const yOf = (v: number): number => H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * H;
  const pts = FIRST_RENDER.map((v, i) => [(i / (n - 1)) * W, yOf(v)] as const);
  const line = smoothPath(pts);
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const last = pts[n - 1] ?? [W, H];
  const gradientId = "render-time-fill";

  return (
    <div className="relative h-[240px] sm:h-[300px] lg:h-[340px]">
      {Y_TICKS.map((t) => (
        <div
          key={t}
          style={{ top: `${(1 - (t - Y_MIN) / (Y_MAX - Y_MIN)) * 100}%` }}
          className="absolute inset-x-0 flex items-center gap-3"
        >
          <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">
            {t}s
          </span>
          <span className="h-px flex-1 bg-foreground/[0.08]" />
        </div>
      ))}
      <div className="absolute inset-y-0 right-0 left-11 text-foreground">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity={0.22} />
              <stop offset="0.55" stopColor="currentColor" stopOpacity={0.06} />
              <stop offset="1" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: on ? 1 : 0 }}
            transition={{ duration: 1.4, delay: reducedMotion ? 0 : 0.5 }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: reducedMotion ? 1 : 0 }}
            animate={{ pathLength: on ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 2, ease: softEase }}
          />
        </svg>

        <motion.div
          style={{ top: `${(last[1] / H) * 100}%` }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }}
          transition={{ duration: 0.5, delay: reducedMotion ? 0 : 1.8 }}
          className="absolute left-full -translate-x-1/2 -translate-y-1/2"
        >
          <span className="relative block h-3 w-3 rounded-full bg-foreground ring-[3px] ring-muted">
            <span className="absolute inset-0 rounded-full bg-foreground/40 motion-safe:animate-ping" />
          </span>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 -bottom-7 flex justify-between pl-11 text-xs text-muted-foreground">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function VolumeBars({ active }: { active: boolean }): ReactNode {
  const reducedMotion = useReducedMotion();
  const on = active || reducedMotion;
  const max = Math.max(...VOLUME);
  return (
    <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
      {VOLUME.map((v, i) => (
        <motion.span
          key={i}
          style={{ height: `${(v / max) * 100}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: on ? 1 : 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.9,
            ease: softEase,
            delay: reducedMotion ? 0 : 0.04 * i,
          }}
          className={`flex-1 origin-bottom rounded-[2px] ${
            i === VOLUME.length - 1 ? "bg-foreground" : "bg-foreground/[0.16]"
          }`}
        />
      ))}
    </div>
  );
}

function ApprovalArc({ active }: { active: boolean }): ReactNode {
  const reducedMotion = useReducedMotion();
  const on = active || reducedMotion;
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-16 w-16 -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        strokeWidth={5}
        className="stroke-foreground/[0.12]"
      />
      <motion.circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={c}
        className="stroke-foreground"
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: on ? c * (1 - FIRST_TAKE) : c }}
        transition={{ duration: reducedMotion ? 0 : 1.4, ease: softEase }}
      />
    </svg>
  );
}

function RulesMatrix({ active }: { active: boolean }): ReactNode {
  const reducedMotion = useReducedMotion();
  const on = active || reducedMotion;
  return (
    <div className="grid h-16 w-16 grid-cols-10 gap-[3px]" aria-hidden="true">
      {Array.from({ length: 100 }, (_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{
            duration: 0.3,
            delay: reducedMotion ? 0 : 0.008 * i,
          }}
          className={`rounded-full ${
            i === 37 ? "bg-foreground/[0.18]" : "bg-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function Timeline({ active }: { active: boolean }): ReactNode {
  const reducedMotion = useReducedMotion();
  const on = active || reducedMotion;
  return (
    <div className="relative mt-36 mb-14 hidden h-px bg-border md:block">
      {AXIS_TICKS.map((t) => (
        <div
          key={t.label}
          style={{ left: `${pos(t.seconds)}%` }}
          className="absolute top-0 -translate-x-1/2"
        >
          <span className="block h-2 w-px bg-border" />
          <span className="mt-2 block text-xs whitespace-nowrap text-muted-foreground">
            {t.label}
          </span>
        </div>
      ))}
      {ROUTES.map((r, i) => (
        <motion.div
          key={r.name}
          style={{ left: `${pos(r.seconds)}%` }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: on ? 1 : 0, y: on ? 0 : 8 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            ease: softEase,
            delay: reducedMotion ? 0 : 0.2 + 0.12 * i,
          }}
          className="absolute bottom-0 -translate-x-1/2"
        >
          <div className="flex flex-col items-center">
            <span
              className={`font-serif whitespace-nowrap ${
                r.ours
                  ? "text-[2rem] leading-none"
                  : "text-[1.25rem] leading-none text-muted-foreground"
              }`}
            >
              {r.label}
            </span>
            <span
              className={`mt-1.5 text-xs whitespace-nowrap ${
                r.ours ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {r.name}
            </span>
            <span className="mt-3 h-6 w-px bg-border" />
            <span
              className={`-mb-[5px] block h-[11px] w-[11px] rounded-full ring-4 ring-muted ${
                r.ours
                  ? "bg-foreground"
                  : "border border-foreground/50 bg-muted"
              }`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function Benchmarks(): ReactNode {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartOn = useInView(chartRef, { once: true, margin: "-20% 0px" });
  const stripRef = useRef<HTMLUListElement>(null);
  const stripOn = useInView(stripRef, { once: true, margin: "-15% 0px" });
  const lineRef = useRef<HTMLDivElement>(null);
  const lineOn = useInView(lineRef, { once: true, margin: "-15% 0px" });

  return (
    <section
      id="benchmarks"
      aria-labelledby="benchmarks-heading"
      className="scroll-mt-20 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="benchmarks-heading"
          title="Faster than the shoot you would have booked."
          description="Measured across every render on the standard queue last month. No cherry-picked jobs, no priority lane."
        />

        <Reveal inView y={24} className="mt-12 lg:mt-14">
          <div
            ref={chartRef}
            className="grid gap-10 rounded-2xl border border-border bg-muted p-6 sm:p-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16 lg:p-10"
          >
            <div className="flex flex-col">
              <p className="font-serif text-[5rem] leading-[0.9] tracking-[-0.03em] sm:text-[6.5rem]">
                <CountUp value={31} active={chartOn} />
                <span className="text-[0.5em] text-muted-foreground">s</span>
              </p>
              <h3 className="mt-6 text-lg font-medium">
                Median time to a first render
              </h3>
              <p className="mt-2 max-w-sm text-[15px] leading-7 text-muted-foreground">
                From pressing render to a full-resolution image on screen, every
                day of the last thirty. The drop mid-month is the current model
                generation arriving.
              </p>
            </div>
            <div className="pb-8">
              <RenderTimeChart active={chartOn} />
            </div>
          </div>
        </Reveal>

        <Reveal inView y={24} delay={0.05} className="mt-4 md:mt-5">
          <ul
            ref={stripRef}
            className="grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-background md:grid-cols-3 md:divide-x md:divide-y-0"
          >
            <li className="flex items-end justify-between gap-6 p-6 sm:p-8">
              <div>
                <p className="font-serif text-[3rem] leading-none tracking-[-0.02em]">
                  <CountUp value={1.4} decimals={1} active={stripOn} />
                  <span className="text-[0.55em] text-muted-foreground">M</span>
                </p>
                <p className="mt-3 text-[15px] text-muted-foreground">
                  Images rendered last month
                </p>
              </div>
              <div className="w-32 shrink-0 sm:w-40">
                <VolumeBars active={stripOn} />
              </div>
            </li>
            <li className="flex items-end justify-between gap-6 p-6 sm:p-8">
              <div>
                <p className="font-serif text-[3rem] leading-none tracking-[-0.02em]">
                  <CountUp value={62} active={stripOn} />
                  <span className="text-[0.55em] text-muted-foreground">%</span>
                </p>
                <p className="mt-3 text-[15px] text-muted-foreground">
                  Approved on the first take
                </p>
              </div>
              <ApprovalArc active={stripOn} />
            </li>
            <li className="flex items-end justify-between gap-6 p-6 sm:p-8">
              <div>
                <p className="font-serif text-[3rem] leading-none tracking-[-0.02em]">
                  <CountUp value={99.2} decimals={1} active={stripOn} />
                  <span className="text-[0.55em] text-muted-foreground">%</span>
                </p>
                <p className="mt-3 text-[15px] text-muted-foreground">
                  Brand rules held without a fix
                </p>
              </div>
              <RulesMatrix active={stripOn} />
            </li>
          </ul>
        </Reveal>

        <Reveal inView y={24} delay={0.05} className="mt-4 md:mt-5">
          <div
            ref={lineRef}
            className="rounded-2xl border border-border bg-muted p-6 sm:p-8 lg:p-10"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h3 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.02em]">
                Brief to approved image.
              </h3>
              <p className="max-w-md text-[15px] leading-7 text-muted-foreground">
                The four ways a team gets a picture, timed end to end on the
                same campaign brief. Log scale, so the whole story fits on one
                line.
              </p>
            </div>
            <Timeline active={lineOn} />

            <ul className="mt-8 divide-y divide-border md:hidden">
              {ROUTES.map((r) => (
                <li
                  key={r.name}
                  className="flex items-baseline justify-between py-3"
                >
                  <span
                    className={
                      r.ours ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {r.name}
                  </span>
                  <span
                    className={`font-serif text-xl ${
                      r.ours ? "" : "text-muted-foreground"
                    }`}
                  >
                    {r.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
