import { LS_ZENDORO_AUTH } from "@/constants/data";

export function isAuthenticated() {
  const token = localStorage.getItem(LS_ZENDORO_AUTH);
  const expiration = token?.split(".")[1];
  const isExpired = expiration
    ? Date.now() > JSON.parse(atob(expiration)).exp * 1000
    : true;
  return !!token && !isExpired;
}
