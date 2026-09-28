import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState, RequestRow } from "@/components/common";
import { employeeName, useSession } from "@/lib/store";
import type { DutyRequest } from "@/lib/types";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance Console · LIAT Staff Travel Tracker" },
      { name: "description", content: "Budget authorisations and post-travel expense reimbursements for duty travel." },
      { property: "og:title", content: "Finance Console · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Budget authorisations and expense reimbursements for duty travel." },
    ],
  }),
  component: () => (
    <AppShell>
      <Finance />
    </AppShell>
  ),
});

function Finance() {
  const { state } = useSession();
  const duty = state.requests.filter((r) => r.kind === "duty") as DutyRequest[];
  const awaiting = duty.filter((r) => r.status === "HR compliance cleared");
  const claims = duty.filter((r) => r.expense);

  return (
    <>
      <PageHeader
        title="Finance Console"
        description="Authorise duty travel budgets and process post-travel expense claims. No booking may occur before authorisation."
      />
      <h2 className="mb-3 font-display text-lg font-semibold">Awaiting budget authorisation ({awaiting.length})</h2>
      {awaiting.length === 0 ? (
        <EmptyState title="Nothing awaiting authorisation" />
      ) : (
        <div className="space-y-3">
          {awaiting.map((r) => (
            <RequestRow
              key={r.id}
              req={r}
              extra={
                <p className="mt-2 text-xs text-muted-foreground">
                  {employeeName(state, r.employeeId)} · estimate {r.costEstimate ? `USD ${r.costEstimate}` : "not stated"}
                </p>
              }
            />
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold">Expense claims ({claims.length})</h2>
      {claims.length === 0 ? (
        <EmptyState title="No expense claims submitted" />
      ) : (
        <div className="space-y-3">
          {claims.map((r) => (
            <RequestRow
              key={r.id}
              req={r}
              extra={
                <p className="mt-2 text-xs text-muted-foreground">
                  Claim USD {r.expense!.amount} · {r.expense!.status} · cost centre {r.costCentre ?? "—"}
                </p>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
