"use client";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { softEase, useReducedMotion } from "@/lib/motion";
import { siteConfig } from "@/lib/metadata";
import { PHOTOS, photoUrl, type PhotoId } from "@/lib/photos";
import { SPECTRUM_CLASS } from "@/lib/spectrum";
import { ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

type Billing = "monthly" | "annual";
const SAVE = 20;

interface Allowance {
  images: string;
  note: string;
}

interface Tier {
  name: string;
  blurb: string;
  cta: string;
  href: string;
  featured?: boolean;
  photo: PhotoId;
  price: Record<Billing, number>;
  allowance: Allowance;
  features: string[];
}

const SIGN_UP = "https://app.imageworks.example.com/sign-up";

const TIERS: Tier[] = [
  {
    name: "Solo",
    blurb: "For independent makers.",
    cta: "Start with Solo",
    href: `${SIGN_UP}?plan=solo`,
    photo: PHOTOS[3],
    price: { monthly: 15, annual: 12 },
    allowance: {
      images: "1,500 images / mo",
      note: "About 50 a day, up to 2K",
    },
    features: [
      "Every model, day one",
      "Reference and style boards",
      "One brand kit",
      "Commercial licence",
      "30-day history",
    ],
  },
  {
    name: "Studio",
    blurb: "For small teams shipping weekly.",
    cta: "Start with Studio",
    href: `${SIGN_UP}?plan=studio`,
    featured: true,
    photo: PHOTOS[6],
    price: { monthly: 49, annual: 39 },
    allowance: {
      images: "6,000 images / mo",
      note: "About 200 a day, up to 4K",
    },
    features: [
      "Everything in Solo",
      "Unlimited seats",
      "Shared libraries and brand kits",
      "Batch variations and resizes",
      "Upscale and background removal",
      "Figma and Adobe plugins",
    ],
  },
  {
    name: "Agency",
    blurb: "For high-volume production.",
    cta: "Start with Agency",
    href: `${SIGN_UP}?plan=agency`,
    photo: PHOTOS[8],
    price: { monthly: 124, annual: 99 },
    allowance: {
      images: "20,000 images / mo",
      note: "About 670 a day, 4K and upscale",
    },
    features: [
      "Everything in Studio",
      "Custom-trained models",
      "Roles and approval flows",
      "API access",
      "SSO and audit log",
      "Priority rendering",
      "Dedicated support",
    ],
  },
];

const ENTERPRISE = [
  "Everything in Agency",
  "Private model hosting",
  "Custom data agreements",
  "SLA with uptime credits",
  "Volume pricing",
  "Onboarding and training",
  "Named account team",
  "Invoicing and procurement",
];

interface SegmentedProps<T extends string> {
  label: string;
  items: { key: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  layoutId: string;
  className?: string;
}

function Segmented<T extends string>({
  label,
  items,
  value,
  onChange,
  layoutId,
  className,
}: SegmentedProps<T>): ReactNode {
  const reducedMotion = useReducedMotion();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`inline-grid auto-cols-fr grid-flow-col rounded-xl bg-muted p-1 ${className ?? ""}`}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.key)}
            className={`relative h-9 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className="absolute inset-0 rounded-lg bg-background shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:shadow-none dark:ring-1 dark:ring-white/10"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 40 }
                }
              />
            )}
            <span className="relative z-[1] inline-flex items-center gap-1.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RollingNumber({
  value,
  direction,
}: {
  value: number;
  direction: 1 | -1;
}): ReactNode {
  const reducedMotion = useReducedMotion();
  return (
    <span className="relative inline-flex h-[1em] overflow-hidden align-baseline">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={
            reducedMotion ? false : { y: `${direction * 100}%`, opacity: 0 }
          }
          animate={{ y: 0, opacity: 1 }}
          exit={
            reducedMotion
              ? { opacity: 0 }
              : { y: `${direction * -100}%`, opacity: 0 }
          }
          transition={
            reducedMotion
              ? { duration: 0.1 }
              : { duration: 0.45, ease: softEase }
          }
          className="tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Tag({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "accent";
}): ReactNode {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-md px-2 text-xs font-medium ${
        tone === "accent"
          ? "bg-sky-500/12 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function FeatureList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}): ReactNode {
  return (
    <ul className={`space-y-2.5 text-[15px] ${className ?? ""}`}>
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2.5">
          <Check
            className="mt-[3px] h-4 w-4 shrink-0 text-foreground/60"
            strokeWidth={2.25}
            aria-hidden
          />
          <span className="text-foreground/85">{f}</span>
        </li>
      ))}
    </ul>
  );
}

function TierCard({
  tier,
  billing,
  direction,
}: {
  tier: Tier;
  billing: Billing;
  direction: 1 | -1;
}): ReactNode {
  const price = tier.price[billing];
  const full = tier.price.monthly;

  const inner = (
    <div className="flex h-full flex-col rounded-[15px] bg-background p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[1.375rem] leading-tight font-medium tracking-[-0.01em]">
            {tier.name}
          </h3>
          <p className="mt-1 text-[15px] text-muted-foreground">{tier.blurb}</p>
        </div>
        {tier.featured && (
          <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md bg-foreground px-2 text-xs font-medium text-background">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full [background-size:200%_100%] motion-safe:animate-[spectrum-drift_14s_linear_infinite] ${SPECTRUM_CLASS}`}
            />
            Most chosen
          </span>
        )}
      </div>

      <div className="mt-8 flex items-baseline gap-2.5">
        <span className="font-serif text-[3.75rem] leading-none tracking-[-0.02em]">
          $<RollingNumber value={price} direction={direction} />
        </span>
        <AnimatePresence initial={false}>
          {billing === "annual" && (
            <motion.span
              key="full"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.3, ease: softEase }}
              className="font-serif text-2xl text-muted-foreground line-through decoration-1"
            >
              ${full}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <Tag>per month</Tag>
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={billing}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: softEase }}
          >
            {billing === "annual" ? (
              <Tag tone="accent">Save {SAVE}%</Tag>
            ) : (
              <Tag>billed monthly</Tag>
            )}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="mt-7 rounded-xl bg-muted p-3.5">
        <div className="flex items-center gap-3.5">
          <Image
            src={photoUrl(tier.photo, 112)}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="text-[15px] font-medium tabular-nums">
              {tier.allowance.images}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {tier.allowance.note}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 border-t border-border pt-6 pb-10">
        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Includes
        </p>
        <FeatureList items={tier.features} className="mt-4" />
      </div>

      <a
        href={tier.href}
        className={`group mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[15px] font-medium transition-[opacity,background-color,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] ${
          tier.featured
            ? "bg-foreground text-background hover:opacity-85"
            : "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1] dark:bg-white/[0.1] dark:hover:bg-white/[0.14]"
        }`}
      >
        {tier.cta}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </a>
    </div>
  );

  if (tier.featured) {
    return (
      <div className="relative h-full rounded-2xl shadow-[0_28px_60px_-32px_rgba(0,0,0,0.28)] dark:shadow-none">
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-2xl [background-size:200%_100%] motion-safe:animate-[spectrum-drift_14s_linear_infinite] ${SPECTRUM_CLASS}`}
        />
        <div className="relative h-full p-px">{inner}</div>
      </div>
    );
  }
  return (
    <div className="h-full rounded-2xl border border-border transition-colors hover:border-foreground/20">
      {inner}
    </div>
  );
}

function Fan(): ReactNode {
  const cards: { id: PhotoId; className: string }[] = [
    {
      id: PHOTOS[1],
      className:
        "z-1 [transform:translateX(-46px)_rotate(-12deg)] motion-safe:group-hover:[transform:translateX(-62px)_rotate(-18deg)]",
    },
    {
      id: PHOTOS[4],
      className:
        "z-2 transform-none motion-safe:group-hover:[transform:translateY(-4px)]",
    },
    {
      id: PHOTOS[9],
      className:
        "z-1 [transform:translateX(46px)_rotate(12deg)] motion-safe:group-hover:[transform:translateX(62px)_rotate(18deg)]",
    },
  ];
  return (
    <div className="group relative flex h-full min-h-[220px] items-center justify-center overflow-hidden rounded-xl bg-foreground dark:bg-white/[0.06]">
      <div
        aria-hidden="true"
        className={`absolute inset-0 [background-size:200%_100%] opacity-25 blur-3xl motion-safe:animate-[spectrum-drift_14s_linear_infinite] ${SPECTRUM_CLASS}`}
      />
      {cards.map((card) => (
        <div
          key={card.id}
          className={`absolute h-[104px] w-[104px] overflow-hidden rounded-xl shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)] ring-1 ring-white/15 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${card.className}`}
        >
          <Image
            src={photoUrl(card.id, 224)}
            alt=""
            width={104}
            height={104}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function Pricing(): ReactNode {
  const [billing, setBilling] = useState<Billing>("annual");
  const direction: 1 | -1 = billing === "annual" ? -1 : 1;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="scroll-mt-20 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="pricing-heading"
          title="Priced by output, not headcount."
          description="Every model and full commercial rights on every plan. Pick an image allowance and move up when the briefs do."
          aside={
            <Segmented
              label="Billing period"
              layoutId="billing"
              items={[
                { key: "monthly", label: "Monthly" },
                {
                  key: "annual",
                  label: (
                    <>
                      Annual
                      <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                        −{SAVE}%
                      </span>
                    </>
                  ),
                },
              ]}
              value={billing}
              onChange={setBilling}
            />
          }
        />

        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:mt-14">
          {TIERS.map((tier, i) => (
            <li key={tier.name} className="min-w-0">
              <Reveal inView delay={0.08 * i} y={24} className="h-full">
                <TierCard tier={tier} billing={billing} direction={direction} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal inView y={24} className="mt-4 md:mt-5">
          <div className="grid gap-6 rounded-2xl border border-border bg-muted p-3 sm:p-4 lg:grid-cols-[300px_minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-10">
            <Fan />
            <div className="flex flex-col justify-center px-3 py-2 sm:px-4">
              <h3 className="font-serif text-[2.25rem] leading-none tracking-[-0.02em]">
                Enterprise
              </h3>
              <p className="mt-2 text-[15px] text-muted-foreground">
                For your own terms, your own models and your own cloud.
              </p>
              <a
                href={`mailto:sales@${new URL(siteConfig.url).hostname}`}
                className="group mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-foreground pr-4 pl-5 text-[15px] font-medium text-background transition-[opacity,transform] hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]"
              >
                Talk to sales
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>
            <div className="px-3 py-2 sm:px-4 lg:border-l lg:border-border lg:pl-10">
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Includes
              </p>
              <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
                <FeatureList items={ENTERPRISE.slice(0, 4)} />
                <FeatureList
                  items={ENTERPRISE.slice(4)}
                  className="mt-2.5 sm:mt-0"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal
          inView
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Prices in USD, before tax. Unused images roll over for one month.
          Students and non-profits get 40% off.
        </Reveal>
      </div>
    </section>
  );
}
