import { useState } from "react";
import { format } from "date-fns";
import { Ban, KeyRound, ShieldCheck, Trash2, UserCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminStore, type AdminUser } from "@/zustand/adminStore";
import {
  ResetPasswordResultDialog,
  type ResetPasswordResult,
} from "@/componenets/Admin/ResetPasswordResultDialog";

type PendingAction = { type: "block" | "unblock" | "delete"; user: AdminUser };

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: number | null;
}) {
  const { setUserBlocked, deleteUser, sendPasswordReset } = useAdminStore();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [resetResult, setResetResult] = useState<ResetPasswordResult>(null);
  const [resettingId, setResettingId] = useState<number | null>(null);

  const handleConfirm = async () => {
    if (!pendingAction) return;
    setIsActing(true);
    setActionError("");
    const result =
      pendingAction.type === "delete"
        ? await deleteUser(pendingAction.user.id)
        : await setUserBlocked(
            pendingAction.user.id,
            pendingAction.type === "block"
          );
    setIsActing(false);
    if (!result.ok) {
      setActionError(result.error ?? "Something went wrong");
      return;
    }
    setPendingAction(null);
  };

  const handleResetPassword = async (user: AdminUser) => {
    setResettingId(user.id);
    const result = await sendPasswordReset(user.id);
    setResettingId(null);
    if (result.ok && result.email && result.code) {
      setResetResult({ email: result.email, code: result.code });
    }
  };

  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/50">No users yet.</p>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-white/10">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">User</TableHead>
              <TableHead className="text-white/60">Joined</TableHead>
              <TableHead className="text-white/60">Role</TableHead>
              <TableHead className="text-white/60">Status</TableHead>
              <TableHead className="text-white/60">Todos</TableHead>
              <TableHead className="text-right text-white/60">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <TableRow key={user.id} className="border-white/10">
                  <TableCell>
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-white/50">{user.email}</div>
                  </TableCell>
                  <TableCell className="text-white/70">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="gap-1 bg-sky-500/20 text-sky-300 border-sky-500/30">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-white/70">
                        Member
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-white/70">{user.todoCount}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Send password reset code"
                        disabled={resettingId === user.id}
                        onClick={() => handleResetPassword(user)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title={user.isBlocked ? "Unblock user" : "Block user"}
                        disabled={isSelf}
                        onClick={() =>
                          setPendingAction({
                            type: user.isBlocked ? "unblock" : "block",
                            user,
                          })
                        }
                      >
                        {user.isBlocked ? (
                          <UserCheck className="h-4 w-4" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Delete user"
                        disabled={isSelf}
                        className="text-destructive hover:text-destructive"
                        onClick={() => setPendingAction({ type: "delete", user })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open && !isActing) {
            setPendingAction(null);
            setActionError("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === "delete"
                ? "Delete this user?"
                : pendingAction?.type === "block"
                  ? "Block this user?"
                  : "Unblock this user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "delete" &&
                `This permanently deletes ${pendingAction.user.name}'s account and all of their data — todos, habits, reminders, and goals. This can't be undone.`}
              {pendingAction?.type === "block" &&
                `${pendingAction.user.name} will be signed out and won't be able to log back in until unblocked.`}
              {pendingAction?.type === "unblock" &&
                `${pendingAction.user.name} will be able to log in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {actionError}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActing}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant={pendingAction?.type === "delete" ? "destructive" : "default"}
              disabled={isActing}
              onClick={handleConfirm}
            >
              {isActing
                ? "Working…"
                : pendingAction?.type === "delete"
                  ? "Delete user"
                  : pendingAction?.type === "block"
                    ? "Block user"
                    : "Unblock user"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResetPasswordResultDialog
        result={resetResult}
        onOpenChange={(open) => !open && setResetResult(null)}
      />
    </>
  );
}
