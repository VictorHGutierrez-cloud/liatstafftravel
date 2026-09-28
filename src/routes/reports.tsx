import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/store";
import { GRADE_BANDS, TIER_LABELS, type DutyRequest, type Tier } from "@/lib/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · LIAT Staff Travel Tracker" },
      { name: "description", content: "Entitlement utilisation by grade, duty spend by cost centre and ledger exceptions." },
      { property: "og:title", content: "Reports · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Entitlement utilisation, duty spend by cost centre and ledger exceptions." },
    ],
  }),
  component: () => (
    <AppShell>
      <Reports />
    </AppShell>
  ),
});

const TIERS: Tier[] = ["free100", "fare50", "fare15"];

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${name} exported.`);
}

function Reports() {
  const { state } = useSession();

  const byGrade = ([1, 2, 3, 4] as const).map((g) => {
    const emps = state.employees.filter((e) => e.grade === g);
    const row = { grade: g, band: GRADE_BANDS[g], used: {} as Record<Tier, number>, alloc: {} as Record<Tier, number> };
    TIERS.forEach((t) => {
      row.alloc[t] = emps.reduce((n, e) => n + e.allocation[t], 0);
      row.used[t] = emps.reduce((n, e) => n + (e.allocation[t] - e.balances[t]), 0);
    });
    return row;
  });

  const duty = state.requests.filter((r) => r.kind === "duty") as DutyRequest[];
  const spendMap = new Map<string, number>();
  duty.forEach((r) => {
    const cc = r.costCentre ?? "Unallocated";
    spendMap.set(cc, (spendMap.get(cc) ?? 0) + (r.expense?.amount ?? r.costEstimate ?? 0));
  });

  const exceptions = state.employees.filter((e) => TIERS.some((t) => e.balances[t] < 0 || e.balances[t] > e.allocation[t]));

  return (
    <>
      <PageHeader title="Reports" description={`Demo year ${state.year}.`} />

      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Entitlement utilisation by grade &amp; tier</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadCsv("entitlement-utilisation.csv", [
                ["Grade", "Band", ...TIERS.flatMap((t) => [`${TIER_LABELS[t]} used`, `${TIER_LABELS[t]} allocated`])],
                ...byGrade.map((r) => [r.grade, r.band, ...TIERS.flatMap((t) => [r.used[t], r.alloc[t]])]),
              ])
            }
          >
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                {TIERS.map((t) => (
                  <TableHead key={t}>{TIER_LABELS[t]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {byGrade.map((r) => (
                <TableRow key={r.grade}>
                  <TableCell>
                    {r.grade} · {r.band}
                  </TableCell>
                  {TIERS.map((t) => (
                    <TableCell key={t}>
                      {r.used[t]} used / {r.alloc[t]} allocated
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Duty spend by cost centre</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadCsv("duty-spend.csv", [["Cost centre", "Amount (USD)"], ...[...spendMap].map(([k, v]) => [k, v])])
            }
          >
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cost centre</TableHead>
                <TableHead>Amount (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...spendMap].map(([cc, amt]) => (
                <TableRow key={cc}>
                  <TableCell>{cc}</TableCell>
                  <TableCell>{amt.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Ledger exception report</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadCsv("ledger-exceptions.csv", [
                ["Employee", "100% left", "50% left", "15% left"],
                ...exceptions.map((e) => [e.name, e.balances.free100, e.balances.fare50, e.balances.fare15]),
              ])
            }
          >
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-0 text-sm">
          {exceptions.length === 0 ? (
            <p className="text-muted-foreground">No negative or unexplained balances.</p>
          ) : (
            exceptions.map((e) => (
              <p key={e.id}>
                {e.name}: {e.balances.free100}/{e.balances.fare50}/{e.balances.fare15}
              </p>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
