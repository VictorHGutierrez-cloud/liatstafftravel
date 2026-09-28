import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState, RequestRow } from "@/components/common";
import { employeeName, useSession } from "@/lib/store";
import { dutyActions, leisureActions } from "@/lib/workflow";
import type { DutyRequest, LeisureRequest } from "@/lib/types";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals Inbox · LIAT Staff Travel Tracker" },
      { name: "description", content: "Pending duty and leisure travel tasks assigned to your role at LIAT." },
      { property: "og:title", content: "Approvals Inbox · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Pending duty and leisure travel tasks assigned to your role." },
    ],
  }),
  component: () => (
    <AppShell>
      <Approvals />
    </AppShell>
  ),
});

function Approvals() {
  const { state, user, role } = useSession();
  if (!user || !role) return null;

  const pending = state.requests.filter((r) => {
    if (r.employeeId === user.id && role === "employee") return false;
    if (role === "manager") {
      const owner = state.employees.find((e) => e.id === r.employeeId);
      if (owner?.managerId !== user.id) return false;
    }
    const acts =
      r.kind === "duty"
        ? dutyActions(r as DutyRequest, user, role)
        : leisureActions(r as LeisureRequest, user, role);
    return acts.some((a) => a.key !== "cancel");
  });

  return (
    <>
      <PageHeader
        title="Approvals Inbox"
        description={`${pending.length} item(s) waiting on you.`}
      />
      {pending.length === 0 ? (
        <EmptyState title="Your inbox is clear" hint="Nothing is waiting on your role right now." />
      ) : (
        <div className="space-y-3">
          {pending.map((r) => (
            <RequestRow
              key={r.id}
              req={r}
              extra={<p className="mt-2 text-xs text-muted-foreground">Requested by {employeeName(state, r.employeeId)}</p>}
            />
          ))}
        </div>
      )}
    </>
  );
}
