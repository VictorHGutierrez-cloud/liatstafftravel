import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState, RequestRow } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/lib/store";

export const Route = createFileRoute("/my-requests")({
  head: () => ({
    meta: [
      { title: "My Requests · LIAT Staff Travel Tracker" },
      { name: "description", content: "Filter your duty and leisure travel requests by type and status." },
      { property: "og:title", content: "My Requests · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Filter your duty and leisure travel requests by type and status." },
    ],
  }),
  component: () => (
    <AppShell>
      <MyRequests />
    </AppShell>
  ),
});

function MyRequests() {
  const { state, user } = useSession();
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  if (!user) return null;

  const mine = state.requests.filter((r) => r.employeeId === user.id);
  const statuses = Array.from(new Set(mine.map((r) => r.status)));
  const filtered = mine.filter(
    (r) => (kind === "all" || r.kind === kind) && (status === "all" || r.status === status),
  );

  return (
    <>
      <PageHeader
        title="My Requests"
        description="Every duty and leisure request you have submitted, with its live stage."
        action={
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/new-duty">New Duty</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/new-leisure">New Leisure</Link>
            </Button>
          </div>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="duty">Duty travel</SelectItem>
            <SelectItem value="leisure">Leisure travel</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No requests match these filters" hint="Try clearing the filters or submit a new request." />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <RequestRow key={r.id} req={r} />
          ))}
        </div>
      )}
    </>
  );
}
