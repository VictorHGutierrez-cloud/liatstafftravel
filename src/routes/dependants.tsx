import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employeeName, setState, useSession } from "@/lib/store";
import type { Dependant, VerificationStatus } from "@/lib/types";

export const Route = createFileRoute("/dependants")({
  head: () => ({
    meta: [
      { title: "Dependants · LIAT Staff Travel Tracker" },
      { name: "description", content: "Declare eligible relatives and track HR verification for staff leisure travel." },
      { property: "og:title", content: "Dependants · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Declare eligible relatives and track HR verification." },
    ],
  }),
  component: () => (
    <AppShell>
      <Dependants />
    </AppShell>
  ),
});

const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Domestic partner", "Other eligible relative"];

function statusTone(s: VerificationStatus) {
  return s === "Verified"
    ? "bg-accent/15 text-accent"
    : s === "Rejected"
      ? "bg-destructive/10 text-destructive"
      : "bg-warning/20 text-warning-foreground";
}

function Dependants() {
  const { state, user, role } = useSession();
  const [form, setForm] = useState({ name: "", relationship: "Spouse", dob: "", idDocStatus: "Submitted" });
  const [notes, setNotes] = useState<Record<string, string>>({});
  if (!user || !role) return null;

  const mine = state.dependants.filter((d) => d.employeeId === user.id);
  const queue = state.dependants.filter((d) => d.status === "Pending" || d.renewalDue);

  function add() {
    if (!form.name.trim() || !form.dob) {
      toast.error("Please enter the relative's full name and date of birth.");
      return;
    }
    const dep: Dependant = {
      id: `d-${Date.now()}`,
      employeeId: user!.id,
      name: form.name.trim(),
      relationship: form.relationship,
      dob: form.dob,
      idDocStatus: form.idDocStatus as Dependant["idDocStatus"],
      status: "Pending",
      renewalDue: false,
    };
    setState((s) => ({ ...s, dependants: [...s.dependants, dep] }));
    setForm({ name: "", relationship: "Spouse", dob: "", idDocStatus: "Submitted" });
    toast.success("Dependant added and sent to HR for verification.");
  }

  function verify(id: string, status: VerificationStatus) {
    setState((s) => ({
      ...s,
      dependants: s.dependants.map((d) =>
        d.id === id ? { ...d, status, note: notes[id] ?? d.note, renewalDue: false } : d,
      ),
    }));
    toast.success(`Dependant marked ${status.toLowerCase()}.`);
  }

  return (
    <>
      <PageHeader
        title="Declaration of Eligible Relatives"
        description="Dependants must be verified by People & Culture before they can travel on a staff benefit ticket."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">My declared relatives</h2>
          {mine.length === 0 ? (
            <EmptyState title="No dependants declared yet" hint="Use the form to add your first eligible relative." />
          ) : (
            mine.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-sm text-muted-foreground">{d.relationship}</span>
                    <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone(d.status)}`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    DOB {d.dob} · ID document: {d.idDocStatus}
                    {d.renewalDue ? " · Annual renewal due" : ""}
                  </p>
                  {d.note && <p className="mt-2 text-sm text-destructive">{d.note}</p>}
                </CardContent>
              </Card>
            ))
          )}

          {role === "hr" && (
            <>
              <h2 className="mt-8 font-display text-lg font-semibold">HR verification queue</h2>
              {queue.length === 0 ? (
                <EmptyState title="Nothing awaiting verification" />
              ) : (
                queue.map((d) => (
                  <Card key={d.id}>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{d.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {d.relationship} of {employeeName(state, d.employeeId)}
                        </span>
                        <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone(d.status)}`}>
                          {d.status}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Verification note (optional)"
                        value={notes[d.id] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [d.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => verify(d.id, "Verified")}>
                          Verify
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => verify(d.id, "Rejected")}>
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Add a relative</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="dep-name">Full name</Label>
              <Input id="dep-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Relationship</Label>
              <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dep-dob">Date of birth</Label>
              <Input id="dep-dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div>
              <Label>ID document status</Label>
              <Select value={form.idDocStatus} onValueChange={(v) => setForm({ ...form, idDocStatus: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Not provided">Not provided</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={add}>
              Add dependant
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
