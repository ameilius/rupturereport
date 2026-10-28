import Link from "next/link";
import type { ReactNode } from "react";

export const inputCls =
  "mt-1 block w-full rounded-lg border border-border bg-bg px-3 py-2 text-text placeholder:text-muted/60 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal";
export const btnCls =
  "inline-flex items-center justify-center rounded-lg bg-teal px-4 py-2 font-semibold text-bg hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";
export const btnGhostCls =
  "inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-text hover:border-teal";
export const btnDangerCls =
  "inline-flex items-center justify-center rounded-lg border border-amber/50 px-3 py-1.5 text-sm text-amber hover:bg-amber/10";
export const linkCls = "text-teal underline-offset-2 hover:underline";

export function Field({
  label,
  name,
  children,
  hint,
}: {
  label: string;
  name: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { name: string },
) {
  return <input id={props.name} className={inputCls} {...props} />;
}

export function Select({
  name,
  options,
  defaultValue,
  empty,
  required,
}: {
  name: string;
  options: readonly (string | { value: string | number; label: string })[];
  defaultValue?: string | number | null;
  empty?: string;
  required?: boolean;
}) {
  return (
    <select
      id={name}
      name={name}
      defaultValue={defaultValue == null ? "" : String(defaultValue)}
      required={required}
      className={inputCls}
    >
      {empty !== undefined && <option value="">{empty}</option>}
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>
            {o.replace(/_/g, " ")}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ),
      )}
    </select>
  );
}

export function Textarea({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <textarea
      id={name}
      name={name}
      rows={3}
      defaultValue={defaultValue ?? ""}
      className={inputCls}
    />
  );
}

export function Flash({
  searchParams,
}: {
  searchParams: { error?: string | string[]; saved?: string | string[] };
}) {
  const error = Array.isArray(searchParams.error)
    ? searchParams.error[0]
    : searchParams.error;
  if (error)
    return (
      <p role="alert" className="mb-6 rounded-lg border border-amber/40 bg-amber/10 p-3 text-amber">
        {error}
      </p>
    );
  if (searchParams.saved)
    return (
      <p role="status" className="mb-6 rounded-lg border border-teal/40 bg-teal/10 p-3 text-teal">
        Saved.
      </p>
    );
  return null;
}

export function PageTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold sm:text-3xl">{children}</h1>
      {actions}
    </div>
  );
}

export function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function Loading() {
  return <p className="text-muted" aria-busy="true">Loading…</p>;
}

export function fmtDate(v: unknown): string {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(String(v));
  return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
}

export type SP = Promise<Record<string, string | string[] | undefined>>;

export type LeagueFilter = "NFL" | "NBA" | null;

/** ?league=NFL|NBA from the query string (anything else = all leagues). */
export function pickLeague(sp: Record<string, string | string[] | undefined>): LeagueFilter {
  const v = sp.league;
  return v === "NFL" || v === "NBA" ? v : null;
}

export function LeagueBadge({ league }: { league: unknown }) {
  const nba = league === "NBA";
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${
        nba ? "bg-amber/15 text-amber" : "bg-teal/15 text-teal"
      }`}
    >
      {nba ? "NBA" : "NFL"}
    </span>
  );
}

/** All / NFL / NBA filter links; keeps other query params (e.g. the player search). */
export function LeagueTabs({
  basePath,
  current,
  params = {},
}: {
  basePath: string;
  current: LeagueFilter;
  params?: Record<string, string>;
}) {
  const href = (l: LeagueFilter) => {
    const qs = new URLSearchParams(params);
    if (l) qs.set("league", l);
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const tabs: [string, LeagueFilter][] = [["All", null], ["NFL", "NFL"], ["NBA", "NBA"]];
  return (
    <nav aria-label="League filter" className="mb-4 flex gap-2 text-sm">
      {tabs.map(([label, l]) => (
        <Link
          key={label}
          href={href(l)}
          aria-current={current === l ? "page" : undefined}
          className={`rounded-lg border px-3 py-1.5 ${
            current === l ? "border-teal bg-teal/10 text-teal" : "border-border text-muted hover:border-teal"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
