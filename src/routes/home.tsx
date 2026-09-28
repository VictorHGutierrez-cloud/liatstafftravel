import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Palmtree, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { BalanceCards, EmptyState, RequestRow } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/types";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Employee Home · LIAT Staff Travel Tracker" },
      { name: "description", content: "Entitlement balances, open travel requests and quick actions for LIAT staff." },
      { property: "og:title", content: "Employee Home · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Entitlement balances, open travel requests and quick actions." },
    ],
  }),
  component: () => (
    <AppShell>
      <Home />
    </AppShell>
  ),
});

function Home() {
  const { state, user, role } = useSession();
  if (!user || !role) return null;

  const mine = state.requests.filter((r) => r.employeeId === user.id);
  const open = mine.filter((r) => !["Cancelled", "Declined", "Expense paid", "Expense rejected"].includes(r.status));
  const pendingDependants = state.dependants.filter((d) => d.employeeId === user.id && d.renewalDue);

  return (
    <>
      <PageHeader
        title={`Good day, ${user.name.split(" ")[0]}`}
        description={`${user.jobTitle} · ${user.department} · Acting as ${ROLE_LABELS[role]}`}
      />

      {pendingDependants.length > 0 && (
        <div className="mb-6 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          Annual renewal of your Declaration of Eligible Relatives is due. {pendingDependants.length} record(s) need
          attention before 1 January.{" "}
          <Link to="/dependants" className="font-medium underline">
            Review dependants
          </Link>
        </div>
      )}

      <h2 className="mb-3 font-display text-lg font-semibold">Leisure entitlement balances ({state.year})</h2>
      <BalanceCards employee={user} />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <QuickAction to="/new-duty" icon={<Briefcase className="h-5 w-5" />} label="New Duty Request" hint="Business travel" />
        <QuickAction to="/new-leisure" icon={<Palmtree className="h-5 w-5" />} label="New Leisure Request" hint="Staff benefit travel" />
        <QuickAction to="/dependants" icon={<Users className="h-5 w-5" />} label="Manage Dependants" hint="Eligible relatives" />
      </div>

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold">Open requests</h2>
      {open.length === 0 ? (
        <EmptyState title="No open requests" hint="Start a duty or leisure request using the actions above." />
      ) : (
        <div className="space-y-3">
          {open.map((r) => (
            <RequestRow key={r.id} req={r} />
          ))}
        </div>
      )}
      <div className="mt-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/my-requests">View all my requests</Link>
        </Button>
      </div>
    </>
  );
}

function QuickAction({ to, icon, label, hint }: { to: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link to={to}>
      <Card className="h-full transition-colors hover:border-accent">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
          <span>
            <span className="block font-medium">{label}</span>
            <span className="block text-xs text-muted-foreground">{hint}</span>
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
