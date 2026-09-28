import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { audit, employeeName, nextRef, setState, useSession } from "@/lib/store";
import { routeApprovingOfficer } from "@/lib/workflow";
import type { DutyRequest } from "@/lib/types";

export const Route = createFileRoute("/new-duty")({
  head: () => ({
    meta: [
      { title: "New Duty Request · LIAT Staff Travel Tracker" },
      { name: "description", content: "Submit a business duty travel request for manager, officer, HR and Finance authorisation." },
      { property: "og:title", content: "New Duty Request · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Submit a business duty travel request for authorisation." },
    ],
  }),
  component: () => (
    <AppShell>
      <NewDuty />
    </AppShell>
  ),
});

function NewDuty() {
  const { state, user } = useSession();
  const navigate = useNavigate();
  const [f, setF] = useState({
    route: "",
    departDate: "",
    returnDate: "",
    purpose: "",
    bookingArrangedBy: "Travel Desk",
    costEstimate: "",
    budgetCode: "",
    notes: "",
  });
  if (!user) return null;

  const officerId = routeApprovingOfficer(user.department, user.id);

  function submit() {
    if (!f.route || !f.departDate || !f.returnDate || !f.purpose.trim()) {
      toast.error("Please complete routing, both dates and the purpose of travel.");
      return;
    }
    if (f.returnDate < f.departDate) {
      toast.error("The return date cannot be before the departure date.");
      return;
    }
    const id = `r-${Date.now()}`;
    const req: DutyRequest = {
      id,
      ref: nextRef(state, "duty"),
      kind: "duty",
      employeeId: user!.id,
      department: user!.department,
      createdAt: new Date().toISOString(),
      route: f.route,
      departDate: f.departDate,
      returnDate: f.returnDate,
      purpose: f.purpose,
      bookingArrangedBy: f.bookingArrangedBy,
      ...(f.costEstimate ? { costEstimate: Number(f.costEstimate) } : {}),
      ...(f.budgetCode ? { budgetCode: f.budgetCode } : {}),
      ...(f.notes ? { notes: f.notes } : {}),
      approvingOfficerId: officerId,
      status: "Submitted",
      audit: [audit(user!.name, "employee", "Submitted duty travel request")],
    };
    setState((s) => ({ ...s, requests: [req, ...s.requests] }));
    toast.success(`Duty request ${req.ref} submitted to your line manager.`);
    navigate({ to: "/request/$id", params: { id } });
  }

  return (
    <>
      <PageHeader
        title="New Duty Travel Request"
        description="Business travel. No leisure entitlement is drawn down — this route requires cost authorisation."
      />
      <Card className="max-w-2xl">
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="route">Destination / routing</Label>
              <Input
                id="route"
                placeholder="e.g. ANU – BGI – ANU"
                value={f.route}
                onChange={(e) => setF({ ...f, route: e.target.value })}
              />
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
              <Label htmlFor="purpose">Purpose of travel</Label>
              <Textarea id="purpose" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} />
            </div>
            <div>
              <Label>Booking arranged by</Label>
              <Select value={f.bookingArrangedBy} onValueChange={(v) => setF({ ...f, bookingArrangedBy: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Travel Desk">Travel Desk</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Self">Self</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cost">Cost estimate (USD, optional)</Label>
              <Input id="cost" type="number" value={f.costEstimate} onChange={(e) => setF({ ...f, costEstimate: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="budget">Requested budget code (optional — Finance confirms)</Label>
              <Input id="budget" value={f.budgetCode} onChange={(e) => setF({ ...f, budgetCode: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
            </div>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            Department: <strong className="text-foreground">{user.department}</strong> · Approving Officer:{" "}
            <strong className="text-foreground">{employeeName(state, officerId)}</strong>
          </div>
          <Button onClick={submit}>Submit duty request</Button>
        </CardContent>
      </Card>
    </>
  );
}
