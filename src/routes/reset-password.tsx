import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { MailCheck, Lock, Eye, EyeOff } from "lucide-react";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { API_BASE_URL } from "@/constants/data";
import { setAuthToken } from "@/lib/authHelpers";
import { isValidSixDigitCode, isStrongPassword } from "@/lib/authValidation";

type ResetPasswordSearch = {
  email?: string;
};

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordComponent,
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
});

type resetResponseType = {
  message: string;
  user: { id: number; name: string; email: string };
  token: string;
};

function ResetPasswordComponent() {
  useDocumentTitle("Reset Password - Zendoro");
  const router = useRouter();
  const { email } = Route.useSearch();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resendMessage, setResendMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.general = "Missing email address. Please start over.";
    }
    if (!isValidSixDigitCode(code)) {
      newErrors.code = "Enter the 6-digit code from your email.";
    }
    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (!isStrongPassword(newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrors({});
    setIsLoading(true);
    try {
      const result = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      if (result.ok) {
        const response: resetResponseType = await result.json();
        setAuthToken(response.token);
        router.navigate({ to: "/dashboard" });
      } else {
        const errorData = await result.json().catch(() => ({}));
        setErrors({
          general: errorData.error || "Password reset failed. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "Password reset failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setErrors({});
    setResendMessage("");
    setIsResending(true);
    try {
      const result = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (result.ok) {
        setResendMessage("A new code has been sent to your email.");
      } else {
        const errorData = await result.json().catch(() => ({}));
        setErrors({
          general: errorData.error || "Failed to resend code. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "Failed to resend code. Please try again." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-beba">Reset Password</CardTitle>
            <CardDescription>
              {email
                ? `Enter the code we sent to ${email} and choose a new password`
                : "Enter the code we sent to your email and choose a new password"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {errors.general}
                </div>
              )}
              {resendMessage && (
                <div className="p-3 text-sm text-sky-300 bg-sky-500/10 border border-sky-500/20 rounded-md">
                  {resendMessage}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">
                  <MailCheck className="h-4 w-4" />
                  Reset Code
                </Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  aria-invalid={!!errors.code}
                  className={
                    (errors.code ? "border-destructive " : "") +
                    "tracking-[0.5em] text-center text-lg"
                  }
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  <Lock className="h-4 w-4" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    aria-invalid={!!errors.newPassword}
                    className={
                      errors.newPassword ? "border-destructive pr-10" : "pr-10"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={!!errors.confirmPassword}
                    className={
                      errors.confirmPassword
                        ? "border-destructive pr-10"
                        : "pr-10"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <GradientButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </GradientButton>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-0">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleResend}
              disabled={isResending || !email}
            >
              {isResending ? "Sending..." : "Resend code"}
            </Button>
            <div className="text-center text-sm text-white/60">
              Wrong email?{" "}
              <Link
                to="/forgot-password"
                className="font-medium text-white hover:underline"
              >
                Start over
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
