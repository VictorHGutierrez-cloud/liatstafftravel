import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TIER_LABELS, type Balances, type Employee, type TravelRequest, type Tier } from "@/lib/types";
import { dutyStageIndex, leisureStageIndex } from "@/lib/workflow";
import { StatusStepper } from "@/components/StatusStepper";
import { DUTY_STAGES, LEISURE_STAGES } from "@/lib/types";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Declined" || status === "Expense rejected" || status === "Cancelled"
      ? "bg-destructive/10 text-destructive"
      : status === "Ticketed" || status === "Expense paid"
        ? "bg-accent/15 text-accent"
        : status === "Returned to employee"
          ? "bg-warning/20 text-warning-foreground"
          : "bg-primary/10 text-primary";
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tone)}>
      {status}
    </span>
  );
}

export function KindBadge({ kind }: { kind: "duty" | "leisure" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        kind === "duty" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent",
      )}
    >
      {kind === "duty" ? "Duty" : "Leisure"}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function BalanceCards({ employee }: { employee: Employee }) {
  const tiers: Tier[] = ["free100", "fare50", "fare15"];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiers.map((t) => (
        <Card key={t}>
          <CardContent className="p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">{TIER_LABELS[t]}</p>
            <p className="mt-1 font-display text-3xl font-semibold">
              {employee.balances[t]}
              <span className="ml-1 text-base font-normal text-muted-foreground">/ {employee.allocation[t]}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">remaining this year</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function balanceSummary(b: Balances) {
  return `100%: ${b.free100} · 50%: ${b.fare50} · 15%: ${b.fare15}`;
}

export function RequestRow({ req, extra }: { req: TravelRequest; extra?: ReactNode }) {
  return (
    <Link
      to="/request/$id"
      params={{ id: req.id }}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent"
    >
      <div className="flex flex-wrap items-center gap-2">
        <KindBadge kind={req.kind} />
        <span className="font-medium">{req.ref}</span>
        <span className="text-sm text-muted-foreground">{req.route}</span>
        <span className="ml-auto">
          <StatusBadge status={req.status} />
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {req.departDate} → {req.returnDate}
      </p>
      <div className="mt-3">
        {req.kind === "duty" ? (
          <StatusStepper
            stages={DUTY_STAGES}
            currentIndex={dutyStageIndex(req.status)}
            failed={req.status === "Declined" || req.status === "Expense rejected"}
          />
        ) : (
          <StatusStepper stages={LEISURE_STAGES} currentIndex={leisureStageIndex(req.status)} />
        )}
      </div>
      {extra}
    </Link>
  );
}
