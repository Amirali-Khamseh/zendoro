import { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminStore } from "@/zustand/adminStore";
import { isValidEmail, isStrongPassword } from "@/lib/authValidation";

export function AddUserDialog() {
  const { addUser } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setIsAdmin(false);
    setError("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!isSubmitting) {
      if (!next) reset();
      setOpen(next);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    if (!isValidEmail(email)) return setError("Enter a valid email address");
    if (!isStrongPassword(password)) {
      return setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
    }
    setError("");
    setIsSubmitting(true);
    const result = await addUser({ name, email, password, isAdmin });
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Failed to add user");
      return;
    }
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4" />
          Add user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new user</DialogTitle>
          <DialogDescription>
            Creates an account directly. The user can sign in immediately with
            this password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="new-user-name">Name</Label>
            <Input
              id="new-user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-user-email">Email</Label>
            <Input
              id="new-user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-user-password">Temporary password</Label>
            <Input
              id="new-user-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters, mixed case, number, symbol"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="new-user-admin"
              checked={isAdmin}
              onCheckedChange={(checked) => setIsAdmin(checked === true)}
            />
            <Label htmlFor="new-user-admin" className="font-normal">
              Grant admin access
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
