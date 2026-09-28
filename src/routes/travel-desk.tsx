import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState, RequestRow } from "@/components/common";
import { employeeName, useSession } from "@/lib/store";
import { TIER_LABELS, type LeisureRequest } from "@/lib/types";

export const Route = createFileRoute("/travel-desk")({
  head: () => ({
    meta: [
      { title: "Travel Desk Queue · LIAT Staff Travel Tracker" },
      { name: "description", content: "Ticketable duty and leisure requests for the LIAT Travel & Groups Desk." },
      { property: "og:title", content: "Travel Desk Queue · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Ticketable duty and leisure requests for the Travel & Groups Desk." },
    ],
  }),
  component: () => (
    <AppShell>
      <TravelDesk />
    </AppShell>
  ),
});

function TravelDesk() {
  const { state, user } = useSession();
  if (!user) return null;

  const ticketable = state.requests.filter(
    (r) => (r.kind === "duty" && r.status === "Finance authorised") || (r.kind === "leisure" && r.status === "HR released"),
  );
  const issued = state.requests.filter((r) => r.status === "Ticketed" || r.status === "Expense paid");

  return (
    <>
      <PageHeader
        title="Travel / Groups Desk"
        description="Duty requests appear here only after Finance authorisation. Issuing a leisure ticket draws down one entitlement."
      />
      <h2 className="mb-3 font-display text-lg font-semibold">Ready to ticket ({ticketable.length})</h2>
      {ticketable.length === 0 ? (
        <EmptyState title="Nothing ready to ticket" hint="Requests arrive once Finance or HR has released them." />
      ) : (
        <div className="space-y-3">
          {ticketable.map((r) => (
            <RequestRow
              key={r.id}
              req={r}
              extra={
                <p className="mt-2 text-xs text-muted-foreground">
                  {employeeName(state, r.employeeId)}
                  {r.kind === "leisure" ? ` · ${TIER_LABELS[(r as LeisureRequest).tier]} · ${(r as LeisureRequest).bookingType}` : ""}
                </p>
              }
            />
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold">Recently issued</h2>
      {issued.length === 0 ? (
        <EmptyState title="No tickets issued yet" />
      ) : (
        <div className="space-y-3">
          {issued.map((r) => (
            <RequestRow key={r.id} req={r} extra={<p className="mt-2 text-xs text-muted-foreground">Ticket {r.ticketRef}</p>} />
          ))}
        </div>
      )}
    </>
  );
}
