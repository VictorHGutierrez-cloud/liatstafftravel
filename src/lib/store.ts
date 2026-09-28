import { useSyncExternalStore } from "react";
import { DEMO_YEAR, seedDependants, seedEmployees, seedRequests } from "./seed";
import {
  GRADE_ALLOCATION,
  type AuditEvent,
  type Dependant,
  type DutyRequest,
  type Employee,
  type LeisureRequest,
  type Role,
  type TravelRequest,
} from "./types";

export interface AppState {
  year: number;
  currentUserId: string | null;
  currentRole: Role | null;
  employees: Employee[];
  dependants: Dependant[];
  requests: TravelRequest[];
}

const KEY = "liat-staff-travel-v1";

export function freshState(): AppState {
  return {
    year: DEMO_YEAR,
    currentUserId: null,
    currentRole: null,
    employees: seedEmployees(),
    dependants: seedDependants(),
    requests: seedRequests(),
  };
}

let state: AppState = freshState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function hydrate() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      state = { ...freshState(), ...(JSON.parse(raw) as AppState) };
      emit();
    }
  } catch {
    /* ignore */
  }
}

export function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => state;

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useSession() {
  const s = useAppState();
  const user = s.employees.find((e) => e.id === s.currentUserId) ?? null;
  return { state: s, user, role: s.currentRole };
}

export function login(userId: string, role: Role) {
  setState((s) => ({ ...s, currentUserId: userId, currentRole: role }));
}

export function logout() {
  setState((s) => ({ ...s, currentUserId: null, currentRole: null }));
}

export function resetDemo() {
  setState(() => freshState());
}

export function employeeName(s: AppState, id: string) {
  if (id === "u-board-chair") return "Board Chair (placeholder)";
  return s.employees.find((e) => e.id === id)?.name ?? "Unknown";
}

export function nextRef(s: AppState, kind: "duty" | "leisure") {
  const prefix = kind === "duty" ? "DTY" : "LSR";
  const base = kind === "duty" ? 1000 : 2000;
  const count = s.requests.filter((r) => r.kind === kind).length;
  return `${prefix}-${base + count + 1}`;
}

export function audit(actorName: string, actorRole: Role, action: string, note?: string): AuditEvent {
  return { at: new Date().toISOString(), actorName, actorRole, action, ...(note ? { note } : {}) };
}

export function updateRequest(id: string, fn: (r: TravelRequest) => TravelRequest) {
  setState((s) => ({ ...s, requests: s.requests.map((r) => (r.id === id ? fn(r) : r)) }));
}

export function drawDown(employeeId: string, tier: keyof Employee["balances"]) {
  setState((s) => ({
    ...s,
    employees: s.employees.map((e) =>
      e.id === employeeId ? { ...e, balances: { ...e.balances, [tier]: Math.max(0, e.balances[tier] - 1) } } : e,
    ),
  }));
}

export function runYearReset() {
  setState((s) => ({
    ...s,
    year: s.year + 1,
    employees: s.employees.map((e) => {
      const allocation = { ...GRADE_ALLOCATION[e.grade] };
      return {
        ...e,
        archives: [...e.archives, { year: s.year, allocation: e.allocation, remaining: e.balances }],
        allocation,
        balances: { ...allocation },
      };
    }),
    dependants: s.dependants.map((d) => ({ ...d, renewalDue: true })),
  }));
}

export function isDuty(r: TravelRequest): r is DutyRequest {
  return r.kind === "duty";
}
export function isLeisure(r: TravelRequest): r is LeisureRequest {
  return r.kind === "leisure";
}
