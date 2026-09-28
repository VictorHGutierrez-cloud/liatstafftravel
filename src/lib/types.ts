export type Role =
  | "employee"
  | "manager"
  | "officer"
  | "hr"
  | "finance"
  | "commercial"
  | "traveldesk"
  | "admin";

export const ROLE_LABELS: Record<Role, string> = {
  employee: "Employee",
  manager: "Line Manager / HoD",
  officer: "Approving Officer",
  hr: "HR (People & Culture)",
  finance: "Finance",
  commercial: "Commercial",
  traveldesk: "Travel / Groups Desk",
  admin: "Admin",
};

export const DEPARTMENTS = [
  "Executive",
  "Flight Operations",
  "Ground Operations & MRO",
  "Commercial & Customer Experience",
  "Finance & Revenue Accounts",
  "People & Culture",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export type Grade = 1 | 2 | 3 | 4;

export type Tier = "free100" | "fare50" | "fare15";

export const TIER_LABELS: Record<Tier, string> = {
  free100: "100% Free",
  fare50: "50% Fare",
  fare15: "15% Fare",
};

export const GRADE_BANDS: Record<Grade, string> = {
  1: "C-Suite / Board",
  2: "Directors / HoD",
  3: "Managers",
  4: "Officers, Supervisors, Other",
};

export const GRADE_ALLOCATION: Record<Grade, Record<Tier, number>> = {
  1: { free100: 12, fare50: 4, fare15: 10 },
  2: { free100: 10, fare50: 4, fare15: 10 },
  3: { free100: 8, fare50: 4, fare15: 10 },
  4: { free100: 6, fare50: 4, fare15: 10 },
};

export interface Balances {
  free100: number;
  fare50: number;
  fare15: number;
}

export interface ArchivedYear {
  year: number;
  allocation: Balances;
  remaining: Balances;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: Department;
  jobTitle: string;
  grade: Grade;
  roles: Role[];
  employmentType: "permanent" | "contractual";
  probationCleared: boolean;
  leisureEligibleFrom: string;
  managerId?: string;
  balances: Balances;
  allocation: Balances;
  archives: ArchivedYear[];
}

export type VerificationStatus = "Pending" | "Verified" | "Rejected";

export interface Dependant {
  id: string;
  employeeId: string;
  name: string;
  relationship: string;
  dob: string;
  idDocStatus: "Not provided" | "Submitted" | "Expired";
  status: VerificationStatus;
  note?: string;
  renewalDue: boolean;
}

export interface AuditEvent {
  at: string;
  actorName: string;
  actorRole: Role;
  action: string;
  note?: string;
}

export type DutyStatus =
  | "Submitted"
  | "Returned to employee"
  | "Recommended by manager"
  | "Approved by officer"
  | "Declined"
  | "HR compliance cleared"
  | "Finance authorised"
  | "Ticketed"
  | "Expense claim submitted"
  | "Expense paid"
  | "Expense rejected"
  | "Cancelled";

export type LeisureStatus =
  | "Submitted"
  | "Returned to employee"
  | "HR released"
  | "Ticketed"
  | "Cancelled";

export const DUTY_STAGES: DutyStatus[] = [
  "Submitted",
  "Recommended by manager",
  "Approved by officer",
  "HR compliance cleared",
  "Finance authorised",
  "Ticketed",
  "Expense paid",
];

export const LEISURE_STAGES: LeisureStatus[] = [
  "Submitted",
  "HR released",
  "Ticketed",
];

interface BaseRequest {
  id: string;
  ref: string;
  employeeId: string;
  department: Department;
  createdAt: string;
  route: string;
  departDate: string;
  returnDate: string;
  notes?: string;
  ticketRef?: string;
  pnr?: string;
  audit: AuditEvent[];
}

export interface DutyRequest extends BaseRequest {
  kind: "duty";
  status: DutyStatus;
  purpose: string;
  bookingArrangedBy: string;
  costEstimate?: number;
  budgetCode?: string;
  costCentre?: string;
  approvingOfficerId: string;
  hrNote?: string;
  expense?: {
    amount: number;
    summary: string;
    submittedAt: string;
    status: "Submitted" | "Paid" | "Rejected";
  };
}

export interface LeisureRequest extends BaseRequest {
  kind: "leisure";
  status: LeisureStatus;
  tier: Tier;
  travellers: string[];
  bookingType: "Firm" | "Standby (Space-Available)";
  commercialFlag?: { note: string; by: string; at: string };
  drawnDown: boolean;
}

export type TravelRequest = DutyRequest | LeisureRequest;
