import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState, RequestRow } from "@/components/common";
import { employeeName, useSession } from "@/lib/store";
import { TIER_LABELS, type LeisureRequest } from "@/lib/types";

export const Route = createFileRoute("/commercial")({
  head: () => ({
    meta: [
      { title: "Standby Board · LIAT Staff Travel Tracker" },
      { name: "description", content: "Commercial advisory view of standby and space-available staff leisure requests." },
      { property: "og:title", content: "Standby Board · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Commercial advisory view of standby and space-available leisure requests." },
    ],
  }),
  component: () => (
    <AppShell>
      <Commercial />
    </AppShell>
  ),
});

function Commercial() {
  const { state } = useSession();
  const standby = state.requests.filter(
    (r) => r.kind === "leisure" && (r as LeisureRequest).bookingType === "Standby (Space-Available)",
  ) as LeisureRequest[];

  return (
    <>
      <PageHeader
        title="Commercial Standby Board"
        description="Advisory only. Commercial may raise an inventory or demand concern; People & Culture weighs it and decides."
      />
      <div className="mb-4 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        Commercial has no veto over leisure travel. Flags raised here are advisory notes attached to the request.
      </div>
      {standby.length === 0 ? (
        <EmptyState title="No standby requests on the board" />
      ) : (
        <div className="space-y-3">
          {standby.map((r) => (
            <RequestRow
              key={r.id}
              req={r}
              extra={
                <p className="mt-2 text-xs text-muted-foreground">
                  {employeeName(state, r.employeeId)} · {TIER_LABELS[r.tier]} · {r.travellers.length} traveller(s)
                  {r.commercialFlag ? " · Advisory flag raised" : ""}
                </p>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
