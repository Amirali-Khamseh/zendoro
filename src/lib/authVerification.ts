import { getAuthToken } from "./authHelpers";

export function isAuthenticated() {
  const token = getAuthToken();
  const expiration = token?.split(".")[1];
  const isExpired = expiration
    ? Date.now() > JSON.parse(atob(expiration)).exp * 1000
    : true;
  return !!token && !isExpired;
}
