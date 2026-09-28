import type { Department, DutyRequest, DutyStatus, Employee, LeisureRequest, Role } from "./types";

export function routeApprovingOfficer(department: Department, employeeId: string): string {
  if (employeeId === "u-marcus") return "u-board-chair";
  switch (department) {
    case "Commercial & Customer Experience":
      return "u-alicia";
    case "Finance & Revenue Accounts":
    case "People & Culture":
      return "u-robert";
    default:
      return "u-marcus";
  }
}

export function dutyStageIndex(status: DutyStatus): number {
  const order: DutyStatus[] = [
    "Submitted",
    "Recommended by manager",
    "Approved by officer",
    "HR compliance cleared",
    "Finance authorised",
    "Ticketed",
    "Expense paid",
  ];
  if (status === "Expense claim submitted") return 5;
  if (status === "Expense rejected") return 5;
  const i = order.indexOf(status);
  return i === -1 ? 0 : i;
}

export function leisureStageIndex(status: LeisureRequest["status"]): number {
  const order = ["Submitted", "HR released", "Ticketed"];
  const i = order.indexOf(status);
  return i === -1 ? 0 : i;
}

export function isTerminal(status: string): boolean {
  return ["Declined", "Cancelled", "Expense paid", "Expense rejected"].includes(status);
}

export interface Action {
  key: string;
  label: string;
  tone?: "primary" | "danger";
  needsNote?: boolean;
  needsFields?: "budget" | "ticket" | "expense";
}

export function dutyActions(req: DutyRequest, user: Employee, role: Role): Action[] {
  if (isTerminal(req.status)) return [];
  const isOwner = req.employeeId === user.id;
  switch (req.status) {
    case "Submitted":
    case "Returned to employee":
      if (role === "manager")
        return [
          { key: "recommend", label: "Recommend", tone: "primary", needsNote: true },
          { key: "return", label: "Return to employee", needsNote: true },
        ];
      if (isOwner && role === "employee")
        return [{ key: "cancel", label: "Cancel request", tone: "danger" }];
      return [];
    case "Recommended by manager":
      if (role === "officer" && req.approvingOfficerId === user.id)
        return [
          { key: "approve", label: "Approve", tone: "primary", needsNote: true },
          { key: "decline", label: "Decline", tone: "danger", needsNote: true },
        ];
      return [];
    case "Approved by officer":
      if (role === "hr")
        return [
          { key: "hr_clear", label: "Clear policy compliance", tone: "primary", needsNote: true },
          { key: "return", label: "Return to employee", needsNote: true },
        ];
      return [];
    case "HR compliance cleared":
      if (role === "finance")
        return [
          { key: "finance_auth", label: "Authorise budget", tone: "primary", needsFields: "budget" },
          { key: "decline", label: "Decline", tone: "danger", needsNote: true },
        ];
      return [];
    case "Finance authorised":
      if (role === "traveldesk")
        return [
          { key: "ticket", label: "Issue ticket", tone: "primary", needsFields: "ticket" },
          { key: "cancel", label: "Cancel request", tone: "danger", needsNote: true },
        ];
      return [];
    case "Ticketed":
      if (isOwner && role === "employee")
        return [{ key: "expense", label: "Submit expense claim", tone: "primary", needsFields: "expense" }];
      return [];
    case "Expense claim submitted":
      if (role === "finance")
        return [
          { key: "expense_paid", label: "Mark reimbursed", tone: "primary" },
          { key: "expense_rejected", label: "Reject claim", tone: "danger", needsNote: true },
        ];
      return [];
    default:
      return [];
  }
}

export function leisureActions(req: LeisureRequest, user: Employee, role: Role): Action[] {
  if (isTerminal(req.status) || req.status === "Ticketed") return [];
  const isOwner = req.employeeId === user.id;
  const actions: Action[] = [];
  if (req.status === "Submitted" || req.status === "Returned to employee") {
    if (role === "commercial" && req.bookingType === "Standby (Space-Available)")
      actions.push({ key: "flag", label: "Add advisory flag", needsNote: true });
    if (role === "hr")
      actions.push(
        { key: "hr_release", label: "Confirm eligibility & release", tone: "primary", needsNote: true },
        { key: "return", label: "Return to employee", needsNote: true },
      );
  }
  if (req.status === "HR released" && role === "traveldesk")
    actions.push({ key: "ticket", label: "Issue ticket (draws down entitlement)", tone: "primary", needsFields: "ticket" });
  if (isOwner && role === "employee")
    actions.push({ key: "cancel", label: "Cancel request", tone: "danger" });
  return actions;
}
