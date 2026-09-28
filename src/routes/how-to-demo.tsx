import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/how-to-demo")({
  head: () => ({
    meta: [
      { title: "How to demo · LIAT Staff Travel Tracker" },
      { name: "description", content: "Five-minute click path through the LIAT leisure and duty travel workflows." },
      { property: "og:title", content: "How to demo · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Five-minute click path through the leisure and duty travel workflows." },
    ],
  }),
  component: () => (
    <AppShell>
      <HowTo />
    </AppShell>
  ),
});

const LEISURE = [
  "Sign in as Tamara Joseph (Employee) → New Leisure Request → pick a tier and a verified dependant → submit.",
  "Optional: sign in as Alicia Fraser (Commercial) → Standby Board → add an advisory flag (never a block).",
  "Sign in as Denise Antoine (HR) → Approvals Inbox → confirm eligibility and release.",
  "Sign in as Shirley Emmanuel (Travel Desk) → Travel Desk → issue ticket.",
  "Sign back in as Tamara → Home → the tier balance has dropped by one.",
];

const DUTY = [
  "Sign in as Andre Peters (Employee) → New Duty Request → submit.",
  "Julian Baptiste (Line Manager) → Approvals Inbox → Recommend.",
  "Marcus Williams (Approving Officer) → Approve (routing is automatic by department).",
  "Denise Antoine (HR) → clear policy compliance.",
  "Robert Clarke (Finance) → authorise budget with a budget code and cost centre.",
  "Shirley Emmanuel (Travel Desk) → issue ticket with reference and PNR.",
  "Andre Peters → submit the expense claim → Robert Clarke marks it reimbursed.",
];

function HowTo() {
  return (
    <>
      <PageHeader title="How to demo" description="Two separate workflows. Roughly five minutes end to end." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 font-display text-lg font-semibold">Leisure path (entitlement drawdown)</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {LEISURE.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 font-display text-lg font-semibold">Duty path (cost authorisation)</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {DUTY.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        Cancelling a leisure request before ticket issue never consumes entitlement. Commercial flags are advisory only —
        People &amp; Culture decides. Admin can reset the demo data at any time.
      </div>
    </>
  );
}
