import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { runYearReset, setState, useSession } from "@/lib/store";
import { GRADE_BANDS, TIER_LABELS, type Employee, type Tier } from "@/lib/types";

export const Route = createFileRoute("/hr")({
  head: () => ({
    meta: [
      { title: "HR Console · LIAT Staff Travel Tracker" },
      { name: "description", content: "Employee travel profiles, entitlement editor, verification and annual year reset." },
      { property: "og:title", content: "HR Console · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Employee travel profiles, entitlement editor and annual year reset." },
    ],
  }),
  component: () => (
    <AppShell>
      <HrConsole />
    </AppShell>
  ),
});

const TIERS: Tier[] = ["free100", "fare50", "fare15"];

function HrConsole() {
  const { state } = useSession();
  const [editing, setEditing] = useState<string | null>(null);

  const exceptions = state.employees.filter((e) =>
    TIERS.some((t) => e.balances[t] < 0 || e.balances[t] > e.allocation[t]),
  );

  function setBalance(id: string, tier: Tier, value: number) {
    setState((s) => ({
      ...s,
      employees: s.employees.map((e) => (e.id === id ? { ...e, balances: { ...e.balances, [tier]: value } } : e)),
    }));
  }

  function toggleProbation(e: Employee) {
    setState((s) => ({
      ...s,
      employees: s.employees.map((x) => (x.id === e.id ? { ...x, probationCleared: !x.probationCleared } : x)),
    }));
    toast.success(`${e.name}: probation ${e.probationCleared ? "marked outstanding" : "cleared"}.`);
  }

  return (
    <>
      <PageHeader
        title="HR Console (People & Culture)"
        description={`Travel profiles and entitlement ledger for year ${state.year}.`}
        action={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Run year reset</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Run year reset ({state.year} → {state.year + 1})?</AlertDialogTitle>
                <AlertDialogDescription>
                  All balances are reset to the grade allocation and the current year is archived for audit. Dependant
                  declarations are flagged for annual renewal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    runYearReset();
                    toast.success("Year reset complete — prior year archived.");
                  }}
                >
                  Run reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Grade entitlement table (Policy §6.3)</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Role band</TableHead>
                <TableHead>100% Free</TableHead>
                <TableHead>50% fare</TableHead>
                <TableHead>15% fare</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {([1, 2, 3, 4] as const).map((g) => (
                <TableRow key={g}>
                  <TableCell>{g}</TableCell>
                  <TableCell>{GRADE_BANDS[g]}</TableCell>
                  <TableCell>{g === 1 ? 12 : g === 2 ? 10 : g === 3 ? 8 : 6}</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell>10</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <h2 className="mb-3 font-display text-lg font-semibold">Employee travel profiles</h2>
      <div className="space-y-3">
        {state.employees.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{e.name}</span>
                <span className="text-sm text-muted-foreground">
                  Grade {e.grade} · {e.department} · {e.employmentType}
                </span>
                <span className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleProbation(e)}>
                    {e.probationCleared ? "Probation cleared" : "Probation outstanding"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(editing === e.id ? null : e.id)}>
                    {editing === e.id ? "Done" : "Edit entitlements"}
                  </Button>
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {TIERS.map((t) => (
                  <span key={t}>
                    <span className="text-muted-foreground">{TIER_LABELS[t]}: </span>
                    {editing === e.id ? (
                      <Input
                        className="inline-block h-8 w-20"
                        type="number"
                        value={e.balances[t]}
                        onChange={(ev) => setBalance(e.id, t, Number(ev.target.value))}
                      />
                    ) : (
                      <strong>
                        {e.balances[t]} / {e.allocation[t]}
                      </strong>
                    )}
                  </span>
                ))}
              </div>
              {e.archives.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Archived years:{" "}
                  {e.archives
                    .map((a) => `${a.year} (left ${a.remaining.free100}/${a.remaining.fare50}/${a.remaining.fare15})`)
                    .join(", ")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold">Ledger exception list</h2>
      {exceptions.length === 0 ? (
        <EmptyState title="No ledger exceptions" hint="No negative or over-allocated balances detected." />
      ) : (
        <div className="space-y-2">
          {exceptions.map((e) => (
            <div key={e.id} className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
              {e.name}: balances outside the grade allocation — {e.balances.free100}/{e.balances.fare50}/
              {e.balances.fare15}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
