import {
  GRADE_ALLOCATION,
  type Dependant,
  type Employee,
  type Grade,
  type TravelRequest,
} from "./types";

export const DEMO_YEAR = 2026;

function emp(
  id: string,
  name: string,
  email: string,
  department: Employee["department"],
  jobTitle: string,
  grade: Grade,
  roles: Employee["roles"],
  managerId?: string,
  opts: Partial<Employee> = {},
): Employee {
  const allocation = { ...GRADE_ALLOCATION[grade] };
  return {
    id,
    name,
    email,
    department,
    jobTitle,
    grade,
    roles,
    employmentType: "permanent",
    probationCleared: true,
    leisureEligibleFrom: `${DEMO_YEAR}-01-01`,
    managerId,
    allocation,
    balances: { ...allocation },
    archives: [],
    ...opts,
  };
}

export function seedEmployees(): Employee[] {
  return [
    emp("u-marcus", "Marcus Williams", "marcus.williams@liat.com", "Executive", "Chief Executive Officer", 1, [
      "officer",
      "employee",
    ]),
    emp("u-denise", "Denise Antoine", "denise.antoine@liat.com", "People & Culture", "Head of HR", 2, [
      "hr",
      "manager",
      "employee",
    ], "u-marcus"),
    emp("u-robert", "Robert Clarke", "robert.clarke@liat.com", "Finance & Revenue Accounts", "Chief Financial Officer", 1, [
      "officer",
      "finance",
      "employee",
    ], "u-marcus"),
    emp("u-kamala", "Kamala Singh", "kamala.singh@liat.com", "Flight Operations", "Director Flight Operations", 2, [
      "manager",
      "employee",
    ], "u-marcus"),
    emp("u-julian", "Julian Baptiste", "julian.baptiste@liat.com", "Ground Operations & MRO", "Ground Ops & MRO Lead", 2, [
      "manager",
      "employee",
    ], "u-marcus"),
    emp("u-alicia", "Alicia Fraser", "alicia.fraser@liat.com", "Commercial & Customer Experience", "Commercial & CX Lead (CCO)", 1, [
      "officer",
      "commercial",
      "manager",
      "employee",
    ], "u-marcus"),
    emp("u-tamara", "Tamara Joseph", "tamara.joseph@liat.com", "Flight Operations", "First Officer", 4, ["employee"], "u-kamala"),
    emp("u-andre", "Andre Peters", "andre.peters@liat.com", "Ground Operations & MRO", "Line Maintenance Supervisor", 4, ["employee"], "u-julian"),
    emp("u-shirley", "Shirley Emmanuel", "shirley.emmanuel@liat.com", "Commercial & Customer Experience", "Travel & Groups Desk Officer", 4, [
      "traveldesk",
      "employee",
    ], "u-alicia"),
    emp("u-nadia", "Nadia Charles", "nadia.charles@liat.com", "Finance & Revenue Accounts", "Revenue Accounts Manager", 3, [
      "finance",
      "employee",
    ], "u-robert"),
    emp("u-kirt", "Kirt Sebastian", "kirt.sebastian@liat.com", "People & Culture", "Systems Administrator", 3, ["admin", "employee"], "u-denise", {
      probationCleared: false,
    }),
  ];
}

export function seedDependants(): Dependant[] {
  return [
    {
      id: "d-1",
      employeeId: "u-tamara",
      name: "Joel Joseph",
      relationship: "Spouse",
      dob: "1989-04-12",
      idDocStatus: "Submitted",
      status: "Verified",
      renewalDue: false,
    },
    {
      id: "d-2",
      employeeId: "u-tamara",
      name: "Ayla Joseph",
      relationship: "Child",
      dob: "2016-09-02",
      idDocStatus: "Submitted",
      status: "Pending",
      renewalDue: true,
    },
    {
      id: "d-3",
      employeeId: "u-andre",
      name: "Marva Peters",
      relationship: "Spouse",
      dob: "1985-01-22",
      idDocStatus: "Expired",
      status: "Rejected",
      note: "Passport copy expired — please re-upload.",
      renewalDue: true,
    },
  ];
}

export function seedRequests(): TravelRequest[] {
  const now = `${DEMO_YEAR}-01-08T09:15:00.000Z`;
  return [
    {
      id: "r-1",
      ref: "DTY-1001",
      kind: "duty",
      employeeId: "u-andre",
      department: "Ground Operations & MRO",
      createdAt: now,
      route: "ANU – BGI – ANU",
      departDate: `${DEMO_YEAR}-02-03`,
      returnDate: `${DEMO_YEAR}-02-06`,
      purpose: "Line maintenance audit support at Barbados station",
      bookingArrangedBy: "Travel Desk",
      costEstimate: 1850,
      approvingOfficerId: "u-marcus",
      status: "Recommended by manager",
      audit: [
        { at: now, actorName: "Andre Peters", actorRole: "employee", action: "Submitted duty travel request" },
        {
          at: `${DEMO_YEAR}-01-09T13:40:00.000Z`,
          actorName: "Julian Baptiste",
          actorRole: "manager",
          action: "Recommended",
          note: "Required for the BGI audit window.",
        },
      ],
    },
    {
      id: "r-2",
      ref: "LSR-2001",
      kind: "leisure",
      employeeId: "u-tamara",
      department: "Flight Operations",
      createdAt: `${DEMO_YEAR}-01-10T10:00:00.000Z`,
      route: "ANU – SLU",
      departDate: `${DEMO_YEAR}-03-14`,
      returnDate: `${DEMO_YEAR}-03-18`,
      tier: "fare50",
      travellers: ["Tamara Joseph", "Joel Joseph"],
      bookingType: "Standby (Space-Available)",
      status: "Submitted",
      drawnDown: false,
      notes: "Family weekend in Saint Lucia.",
      audit: [
        {
          at: `${DEMO_YEAR}-01-10T10:00:00.000Z`,
          actorName: "Tamara Joseph",
          actorRole: "employee",
          action: "Submitted leisure travel request",
        },
      ],
    },
  ];
}
