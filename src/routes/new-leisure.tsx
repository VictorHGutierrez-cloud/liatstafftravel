import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { audit, nextRef, setState, useSession } from "@/lib/store";
import { TIER_LABELS, type LeisureRequest, type Tier } from "@/lib/types";

export const Route = createFileRoute("/new-leisure")({
  head: () => ({
    meta: [
      { title: "New Leisure Request · LIAT Staff Travel Tracker" },
      { name: "description", content: "Request staff benefit leisure travel for yourself and verified dependants." },
      { property: "og:title", content: "New Leisure Request · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Request staff benefit leisure travel for yourself and verified dependants." },
    ],
  }),
  component: () => (
    <AppShell>
      <NewLeisure />
    </AppShell>
  ),
});

function NewLeisure() {
  const { state, user } = useSession();
  const navigate = useNavigate();
  const [tier, setTier] = useState<Tier>("free100");
  const [f, setF] = useState({
    route: "",
    departDate: "",
    returnDate: "",
    bookingType: "Firm",
    notes: "",
  });
  const [travellers, setTravellers] = useState<string[]>([]);
  if (!user) return null;

  const verified = state.dependants.filter((d) => d.employeeId === user.id && d.status === "Verified");
  const eligible = user.probationCleared && user.leisureEligibleFrom <= `${state.year}-12-31`;
  const balance = user.balances[tier];
  const selected = [user.name, ...travellers];

  function submit() {
    if (!eligible) {
      toast.error("You are not yet eligible for leisure travel — probation must be cleared first.");
      return;
    }
    if (balance <= 0) {
      toast.error(`No ${TIER_LABELS[tier]} entitlement remaining for ${state.year}. Choose another tier.`);
      return;
    }
    if (!f.route || !f.departDate || !f.returnDate) {
      toast.error("Please enter the route and both travel dates.");
      return;
    }
    const id = `r-${Date.now()}`;
    const req: LeisureRequest = {
      id,
      ref: nextRef(state, "leisure"),
      kind: "leisure",
      employeeId: user!.id,
      department: user!.department,
      createdAt: new Date().toISOString(),
      route: f.route,
      departDate: f.departDate,
      returnDate: f.returnDate,
      ...(f.notes ? { notes: f.notes } : {}),
      tier,
      travellers: selected,
      bookingType: f.bookingType as LeisureRequest["bookingType"],
      status: "Submitted",
      drawnDown: false,
      audit: [audit(user!.name, "employee", "Submitted leisure travel request")],
    };
    setState((s) => ({ ...s, requests: [req, ...s.requests] }));
    toast.success(`Leisure request ${req.ref} submitted to People & Culture.`);
    navigate({ to: "/request/$id", params: { id } });
  }

  return (
    <>
      <PageHeader
        title="New Leisure Travel Request"
        description="Staff benefit travel. One entitlement is drawn down only when the Travel Desk issues the ticket."
      />
      {!eligible && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          You cannot submit leisure travel yet: probation has not been cleared on your travel profile.
        </div>
      )}
      <Card className="max-w-2xl">
        <CardContent className="space-y-4 p-5">
          <div>
            <Label>Benefit tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["free100", "fare50", "fare15"] as Tier[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIER_LABELS[t]} — {user.balances[t]} remaining
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {balance <= 0 && (
              <p className="mt-1 text-sm text-destructive">
                No {TIER_LABELS[tier]} entitlement remaining — submission is blocked for this tier.
              </p>
            )}
          </div>

          <div>
            <Label>Travellers</Label>
            <p className="mb-2 text-xs text-muted-foreground">
              Only you and HR-verified dependants may travel on this benefit.
            </p>
            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center gap-2 text-sm">
                <Checkbox checked disabled /> {user.name} (employee)
              </div>
              {verified.length === 0 ? (
                <p className="text-xs text-muted-foreground">No verified dependants on file.</p>
              ) : (
                verified.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={travellers.includes(d.name)}
                      onCheckedChange={(c) =>
                        setTravellers((t) => (c ? [...t, d.name] : t.filter((n) => n !== d.name)))
                      }
                    />
                    {d.name} ({d.relationship})
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="route">Route</Label>
              <Input id="route" placeholder="e.g. ANU – SLU" value={f.route} onChange={(e) => setF({ ...f, route: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="dep">Departure date</Label>
              <Input id="dep" type="date" value={f.departDate} onChange={(e) => setF({ ...f, departDate: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ret">Return date</Label>
              <Input id="ret" type="date" value={f.returnDate} onChange={(e) => setF({ ...f, returnDate: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Booking type</Label>
              <Select value={f.bookingType} onValueChange={(v) => setF({ ...f, bookingType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Firm">Firm</SelectItem>
                  <SelectItem value="Standby (Space-Available)">Standby (Space-Available)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
            </div>
          </div>
          <Button onClick={submit} disabled={!eligible || balance <= 0}>
            Submit leisure request
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
