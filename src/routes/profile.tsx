import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserCircle, ShieldAlert } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isAuthenticated } from "@/lib/authVerification";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/zustand/userStore";
import { AvatarUploader } from "@/componenets/Profile/AvatarUploader";
import { DeleteAccountDialog } from "@/componenets/Profile/DeleteAccountDialog";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  useDocumentTitle("Profile - Zendoro");

  const { user, fetchMe, hasInitialized } = useUserStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const isLoading = !hasInitialized;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-2 md:p-4">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white md:text-3xl">
          <UserCircle className="h-6 w-6 text-sky-300" />
          Profile
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Manage your profile picture and account.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : !user ? (
        <p className="text-sm text-white/60">
          Couldn't load your profile. Try refreshing the page.
        </p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Profile picture</CardTitle>
              <CardDescription>
                Shown across Zendoro wherever your account appears.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarUploader user={user} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-white/50">Name</p>
                <p className="text-sm font-medium text-white">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Email</p>
                <p className="text-sm font-medium text-white">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-4 w-4" />
                Danger zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all of your data. This
                can't be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete account
              </Button>
            </CardContent>
          </Card>

          <DeleteAccountDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </div>
  );
}
