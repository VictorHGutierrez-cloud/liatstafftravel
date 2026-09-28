import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { KindBadge, StatusBadge } from "@/components/common";
import { StatusStepper } from "@/components/StatusStepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { audit, drawDown, employeeName, updateRequest, useSession } from "@/lib/store";
import {
  DUTY_STAGES,
  LEISURE_STAGES,
  TIER_LABELS,
  type DutyRequest,
  type LeisureRequest,
  type TravelRequest,
} from "@/lib/types";
import { dutyActions, dutyStageIndex, leisureActions, leisureStageIndex, type Action } from "@/lib/workflow";

export const Route = createFileRoute("/request/$id")({
  head: () => ({
    meta: [
      { title: "Request detail · LIAT Staff Travel Tracker" },
      { name: "description", content: "Stage actions, approvals and full audit trail for a LIAT staff travel request." },
      { property: "og:title", content: "Request detail · LIAT Staff Travel Tracker" },
      { property: "og:description", content: "Stage actions, approvals and full audit trail for a travel request." },
    ],
  }),
  component: () => (
    <AppShell>
      <RequestDetail />
    </AppShell>
  ),
});

function RequestDetail() {
  const { id } = Route.useParams();
  const { state, user, role } = useSession();
  const [pending, setPending] = useState<Action | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const req = state.requests.find((r) => r.id === id);
  if (!user || !role) return null;
  if (!req)
    return (
      <>
        <PageHeader title="Request not found" />
        <Button asChild variant="outline">
          <Link to="/my-requests">Back to my requests</Link>
        </Button>
      </>
    );

  const actions =
    req.kind === "duty" ? dutyActions(req as DutyRequest, user, role) : leisureActions(req as LeisureRequest, user, role);

  function commit() {
    if (!pending || !req || !user || !role) return;
    const a = pending;
    const note = form["note"]?.trim();
    if (a.needsFields === "budget" && (!form["budgetCode"] || !form["costCentre"])) {
      toast.error("A budget code and cost centre are required before booking can proceed.");
      return;
    }
    if (a.needsFields === "ticket" && !form["ticketRef"]) {
      toast.error("Enter the ticket reference before issuing.");
      return;
    }
    if (a.needsFields === "expense" && (!form["amount"] || !form["summary"])) {
      toast.error("Enter the claim amount and a short summary.");
      return;
    }

    updateRequest(req.id, (r) => applyAction(r, a.key, form, user.name, role, note));

    if (a.key === "ticket" && req.kind === "leisure") {
      drawDown(req.employeeId, (req as LeisureRequest).tier);
      toast.success("Ticket issued — one entitlement drawn down.");
    } else {
      toast.success(`${a.label} recorded.`);
    }
    setPending(null);
    setForm({});
  }

  const owner = employeeName(state, req.employeeId);

  return (
    <>
      <PageHeader
        title={`${req.ref} · ${req.route}`}
        description={`${owner} · ${req.department} · submitted ${new Date(req.createdAt).toLocaleDateString()}`}
        action={<StatusBadge status={req.status} />}
      />

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <KindBadge kind={req.kind} />
            <span className="text-sm text-muted-foreground">
              {req.kind === "duty" ? "Duty travel workflow" : "Leisure benefit workflow"}
            </span>
          </div>
          {req.kind === "duty" ? (
            <StatusStepper
              stages={DUTY_STAGES}
              currentIndex={dutyStageIndex((req as DutyRequest).status)}
              failed={req.status === "Declined" || req.status === "Expense rejected"}
            />
          ) : (
            <StatusStepper stages={LEISURE_STAGES} currentIndex={leisureStageIndex((req as LeisureRequest).status)} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 pt-0 text-sm sm:grid-cols-2">
              <Detail label="Routing" value={req.route} />
              <Detail label="Dates" value={`${req.departDate} → ${req.returnDate}`} />
              {req.kind === "duty" ? (
                <>
                  <Detail label="Purpose" value={(req as DutyRequest).purpose} />
                  <Detail label="Booking arranged by" value={(req as DutyRequest).bookingArrangedBy} />
                  <Detail
                    label="Cost estimate"
                    value={(req as DutyRequest).costEstimate ? `USD ${(req as DutyRequest).costEstimate}` : "—"}
                  />
                  <Detail label="Approving Officer" value={employeeName(state, (req as DutyRequest).approvingOfficerId)} />
                  <Detail label="Budget code" value={(req as DutyRequest).budgetCode ?? "Pending Finance"} />
                  <Detail label="Cost centre" value={(req as DutyRequest).costCentre ?? "Pending Finance"} />
                  <Detail label="HR compliance note" value={(req as DutyRequest).hrNote ?? "—"} />
                </>
              ) : (
                <>
                  <Detail label="Benefit tier" value={TIER_LABELS[(req as LeisureRequest).tier]} />
                  <Detail label="Booking type" value={(req as LeisureRequest).bookingType} />
                  <Detail label="Travellers" value={(req as LeisureRequest).travellers.join(", ")} />
                  <Detail
                    label="Entitlement drawn down"
                    value={(req as LeisureRequest).drawnDown ? "Yes — 1 unit" : "Not yet (only on ticket issue)"}
                  />
                </>
              )}
              <Detail label="Ticket reference" value={req.ticketRef ?? "—"} />
              <Detail label="PNR" value={req.pnr ?? "—"} />
              {req.notes && <Detail label="Notes" value={req.notes} />}
            </CardContent>
          </Card>

          {req.kind === "leisure" && (req as LeisureRequest).commercialFlag && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
              <p className="font-medium">Commercial advisory flag (not a block)</p>
              <p className="mt-1">{(req as LeisureRequest).commercialFlag!.note}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Raised by {(req as LeisureRequest).commercialFlag!.by} ·{" "}
                {new Date((req as LeisureRequest).commercialFlag!.at).toLocaleString()}
              </p>
            </div>
          )}

          {req.kind === "duty" && (req as DutyRequest).expense && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Post-travel expense claim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-5 pt-0 text-sm">
                <p>Amount: USD {(req as DutyRequest).expense!.amount}</p>
                <p>{(req as DutyRequest).expense!.summary}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date((req as DutyRequest).expense!.submittedAt).toLocaleString()} · Status:{" "}
                  {(req as DutyRequest).expense!.status}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5 pt-0">
              {req.audit
                .slice()
                .reverse()
                .map((e, i) => (
                  <div key={i} className="border-l-2 border-border pl-3">
                    <p className="text-sm font-medium">{e.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.actorName} · {new Date(e.at).toLocaleString()}
                    </p>
                    {e.note && <p className="mt-1 text-sm">{e.note}</p>}
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Actions for your role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-5 pt-0">
            {actions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No action is available to you at this stage. The request is waiting on another role.
              </p>
            ) : (
              actions.map((a) => (
                <Button
                  key={a.key}
                  className="w-full"
                  variant={a.tone === "primary" ? "default" : a.tone === "danger" ? "destructive" : "outline"}
                  onClick={() => {
                    setForm({});
                    setPending(a);
                  }}
                >
                  {a.label}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pending?.label}</DialogTitle>
            <DialogDescription>
              {pending?.key === "ticket" && req.kind === "leisure"
                ? "Issuing this ticket draws down one entitlement from the selected tier. This cannot be undone in the demo."
                : "This action is recorded in the audit trail with your name and timestamp."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {pending?.needsFields === "budget" && (
              <>
                <div>
                  <Label htmlFor="bc">Budget code</Label>
                  <Input id="bc" value={form["budgetCode"] ?? ""} onChange={(e) => setForm({ ...form, budgetCode: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="cc">Cost centre</Label>
                  <Input id="cc" value={form["costCentre"] ?? ""} onChange={(e) => setForm({ ...form, costCentre: e.target.value })} />
                </div>
              </>
            )}
            {pending?.needsFields === "ticket" && (
              <>
                <div>
                  <Label htmlFor="tr">Ticket reference</Label>
                  <Input id="tr" value={form["ticketRef"] ?? ""} onChange={(e) => setForm({ ...form, ticketRef: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="pnr">PNR</Label>
                  <Input id="pnr" value={form["pnr"] ?? ""} onChange={(e) => setForm({ ...form, pnr: e.target.value })} />
                </div>
              </>
            )}
            {pending?.needsFields === "expense" && (
              <>
                <div>
                  <Label htmlFor="amt">Claim amount (USD)</Label>
                  <Input id="amt" type="number" value={form["amount"] ?? ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="sum">Summary of expenses</Label>
                  <Textarea id="sum" value={form["summary"] ?? ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Claims are due within 2 business days of return.
                </p>
              </>
            )}
            {(pending?.needsNote || !pending?.needsFields) && (
              <div>
                <Label htmlFor="note">Note {pending?.needsNote ? "" : "(optional)"}</Label>
                <Textarea id="note" value={form["note"] ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button variant={pending?.tone === "danger" ? "destructive" : "default"} onClick={commit}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}

function applyAction(
  r: TravelRequest,
  key: string,
  form: Record<string, string>,
  actorName: string,
  actorRole: Parameters<typeof audit>[1],
  note?: string,
): TravelRequest {
  const ev = (action: string) => audit(actorName, actorRole, action, note);

  if (r.kind === "duty") {
    const d = { ...r } as DutyRequest;
    switch (key) {
      case "recommend":
        d.status = "Recommended by manager";
        d.audit = [...d.audit, ev("Recommended by line manager")];
        break;
      case "return":
        d.status = "Returned to employee";
        d.audit = [...d.audit, ev("Returned to employee")];
        break;
      case "approve":
        d.status = "Approved by officer";
        d.audit = [...d.audit, ev("Approved by approving officer")];
        break;
      case "decline":
        d.status = "Declined";
        d.audit = [...d.audit, ev("Declined")];
        break;
      case "hr_clear":
        d.status = "HR compliance cleared";
        if (note) d.hrNote = note;
        d.audit = [...d.audit, ev("HR policy compliance cleared")];
        break;
      case "finance_auth":
        d.status = "Finance authorised";
        d.budgetCode = form["budgetCode"] ?? "";
        d.costCentre = form["costCentre"] ?? "";
        d.audit = [...d.audit, ev(`Budget authorised (${d.budgetCode} / ${d.costCentre})`)];
        break;
      case "ticket":
        d.status = "Ticketed";
        d.ticketRef = form["ticketRef"] ?? "";
        if (form["pnr"]) d.pnr = form["pnr"];
        d.audit = [...d.audit, ev(`Ticket issued (${d.ticketRef})`)];
        break;
      case "expense":
        d.status = "Expense claim submitted";
        d.expense = {
          amount: Number(form["amount"]),
          summary: form["summary"] ?? "",
          submittedAt: new Date().toISOString(),
          status: "Submitted",
        };
        d.audit = [...d.audit, ev("Expense claim submitted")];
        break;
      case "expense_paid":
        d.status = "Expense paid";
        if (d.expense) d.expense = { ...d.expense, status: "Paid" };
        d.audit = [...d.audit, ev("Expense reimbursement processed")];
        break;
      case "expense_rejected":
        d.status = "Expense rejected";
        if (d.expense) d.expense = { ...d.expense, status: "Rejected" };
        d.audit = [...d.audit, ev("Expense claim rejected")];
        break;
      case "cancel":
        d.status = "Cancelled";
        d.audit = [...d.audit, ev("Request cancelled")];
        break;
    }
    return d;
  }

  const l = { ...r } as LeisureRequest;
  switch (key) {
    case "flag":
      l.commercialFlag = { note: note ?? "Commercial advisory concern", by: actorName, at: new Date().toISOString() };
      l.audit = [...l.audit, ev("Commercial advisory flag added (advisory only)")];
      break;
    case "hr_release":
      l.status = "HR released";
      l.audit = [...l.audit, ev("Eligibility confirmed by People & Culture — released to Travel Desk")];
      break;
    case "return":
      l.status = "Returned to employee";
      l.audit = [...l.audit, ev("Returned to employee")];
      break;
    case "ticket":
      l.status = "Ticketed";
      l.drawnDown = true;
      l.ticketRef = form["ticketRef"] ?? "";
      if (form["pnr"]) l.pnr = form["pnr"];
      l.audit = [...l.audit, ev(`Ticket issued (${l.ticketRef}) — entitlement drawn down by 1`)];
      break;
    case "cancel":
      l.status = "Cancelled";
      l.audit = [...l.audit, ev("Request cancelled before ticket issue — no entitlement drawdown")];
      break;
  }
  return l;
}
