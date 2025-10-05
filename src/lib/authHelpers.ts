import { LS_ZENDORO_AUTH } from "@/constants/data";

export function logout() {
  localStorage.removeItem(LS_ZENDORO_AUTH);
  window.dispatchEvent(new Event("auth-change"));
  window.location.href = "/login";
}

export function getAuthToken(): string | null {
  return localStorage.getItem(LS_ZENDORO_AUTH);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(LS_ZENDORO_AUTH, token);
  // Dispatch event to notify components about auth state change
  window.dispatchEvent(new Event("auth-change"));
}
