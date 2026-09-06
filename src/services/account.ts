/** Talks to the accounts, billing and credit endpoints. */

export interface ChildProfile {
  id: string;
  name: string;
  grade: number;
}

export interface MeResponse {
  features: { accounts: boolean; billing: boolean; metered: boolean };
  signedIn: boolean;
  email?: string;
  pro: boolean;
  planStatus?: string | null;
  periodEnd?: string | null;
  hasBillingAccount?: boolean;
  children?: ChildProfile[];
  creditsUsed: number;
  creditsLeft: number | null;
  freeCredits: number;
}

const DEVICE_KEY = "maple-device-id";

/** A stable anonymous id so the server can meter free pieces per device. */
export function deviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, "");
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "nodevice";
  }
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status}).`);
  return data as T;
}

export function fetchMe(): Promise<MeResponse> {
  return call<MeResponse>(`/api/me?device=${encodeURIComponent(deviceId())}`);
}

export function requestLoginLink(email: string): Promise<{ sent: boolean }> {
  return call("/api/auth/request-link", { method: "POST", body: JSON.stringify({ email }) });
}

export function logout(): Promise<unknown> {
  return call("/api/auth/logout", { method: "POST" });
}

export function addChild(name: string, grade: number): Promise<{ children: ChildProfile[] }> {
  return call("/api/children", { method: "POST", body: JSON.stringify({ name, grade }) });
}

export function removeChild(id: string): Promise<{ children: ChildProfile[] }> {
  return call(`/api/children/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function startCheckout(cycle: "monthly" | "yearly"): Promise<void> {
  const { url } = await call<{ url: string }>("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ cycle }),
  });
  window.location.href = url;
}

export function redeemCode(code: string): Promise<{ ok: boolean }> {
  return call("/api/billing/redeem", { method: "POST", body: JSON.stringify({ code }) });
}

export async function openBillingPortal(): Promise<void> {
  const { url } = await call<{ url: string }>("/api/billing/portal", { method: "POST" });
  window.location.href = url;
}

/** Spend one free credit on a finished piece. Returns false when none are left. */
export async function spendCredit(pieceId: string): Promise<boolean> {
  try {
    const res = await call<{ allowed: boolean }>("/api/credits/spend", {
      method: "POST",
      body: JSON.stringify({ device: deviceId(), piece: pieceId }),
    });
    return res.allowed;
  } catch {
    return true; // a server hiccup must never block a child mid-piece
  }
}
