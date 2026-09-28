import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { resetDemo, runYearReset, useSession } from "@/lib/store";
import { DEPARTMENTS, GRADE_BANDS, ROLE_LABELS } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · LIAT Staff Travel Tracker" },
      { name: "description", content: "Manage users, departments, grade tiers and reset the LIAT demo data set." },
      { property: "og:title", content: "Admin · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Manage users, departments, grade tiers and reset demo data." },
    ],
  }),
  component: () => (
    <AppShell>
      <Admin />
    </AppShell>
  ),
});

function Admin() {
  const { state } = useSession();

  return (
    <>
      <PageHeader
        title="Admin"
        description="Users, departments, grade tiers and demo data controls."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                runYearReset();
                toast.success("Year reset complete.");
              }}
            >
              Run year reset
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset demo data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Every request, dependant and ledger balance returns to the seeded state. You will be signed out.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetDemo();
                      toast.success("Demo data reset to seed.");
                    }}
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Users &amp; roles</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    {e.name}
                    <span className="block text-xs text-muted-foreground">{e.email}</span>
                  </TableCell>
                  <TableCell>{e.department}</TableCell>
                  <TableCell>
                    {e.grade} · {GRADE_BANDS[e.grade]}
                  </TableCell>
                  <TableCell className="text-xs">{e.roles.map((r) => ROLE_LABELS[r]).join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Departments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 p-5 pt-0">
          {DEPARTMENTS.map((d) => (
            <span key={d} className="rounded-full bg-muted px-3 py-1 text-sm">
              {d}
            </span>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
