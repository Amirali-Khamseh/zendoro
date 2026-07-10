import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isAuthenticated, isAdminUser } from "@/lib/authVerification";
import { getAuthToken } from "@/lib/authHelpers";
import { useAdminStore } from "@/zustand/adminStore";
import { AdminStatsGrid } from "@/componenets/Admin/AdminStatsGrid";
import { UsersTable } from "@/componenets/Admin/UsersTable";
import { AddUserDialog } from "@/componenets/Admin/AddUserDialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
    if (!isAdminUser()) {
      throw redirect({ to: "/" });
    }
  },
});

function getCurrentUserId(): number | null {
  const token = getAuthToken();
  const payload = token?.split(".")[1];
  if (!payload) return null;
  try {
    return JSON.parse(atob(payload)).userId ?? null;
  } catch {
    return null;
  }
}

function AdminSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-6">
      <Skeleton className="h-10 w-56" />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

function RouteComponent() {
  useDocumentTitle("Admin - Zendoro");

  const { stats, users, fetchStats, fetchUsers, hasInitialized, error } =
    useAdminStore();
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  const isLoading = !hasInitialized;

  if (isLoading) return <AdminSkeleton />;

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-6 md:space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white md:text-4xl">
            Admin
          </h1>
          <p className="text-sm text-white/70 md:text-base">
            Platform-wide statistics and user management.
          </p>
        </div>
        <AddUserDialog />
      </header>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {stats && (
        <section>
          <AdminStatsGrid stats={stats} />
        </section>
      )}

      <section className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5">
        <h2 className="mb-4 text-base font-semibold text-white md:text-lg">
          Users
        </h2>
        <UsersTable users={users} currentUserId={currentUserId} />
      </section>
    </div>
  );
}
