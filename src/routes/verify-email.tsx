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
import { MailCheck } from "lucide-react";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { API_BASE_URL } from "@/constants/data";
import { setAuthToken } from "@/lib/authHelpers";
import { isValidSixDigitCode } from "@/lib/authValidation";

type VerifyEmailSearch = {
  email?: string;
};

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailComponent,
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
});

type verifyResponseType = {
  message: string;
  user: { id: number; name: string; email: string };
  token: string;
};

function VerifyEmailComponent() {
  useDocumentTitle("Verify Email - Zendoro");
  const router = useRouter();
  const { email } = Route.useSearch();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError("Missing email address. Please sign up again.");
      return;
    }
    if (!isValidSixDigitCode(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const result = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (result.ok) {
        const response: verifyResponseType = await result.json();
        setAuthToken(response.token);
        router.navigate({ to: "/dashboard" });
      } else {
        const errorData = await result.json().catch(() => ({}));
        setError(errorData.error || "Verification failed. Please try again.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError("");
    setResendMessage("");
    setIsResending(true);
    try {
      const result = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (result.ok) {
        setResendMessage("A new code has been sent to your email.");
      } else {
        const errorData = await result.json().catch(() => ({}));
        setError(errorData.error || "Failed to resend code. Please try again.");
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-beba">
              Verify Your Email
            </CardTitle>
            <CardDescription>
              {email
                ? `Enter the 6-digit code we sent to ${email}`
                : "Enter the 6-digit code we sent to your email"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
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
                  Verification Code
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
                  className="tracking-[0.5em] text-center text-lg"
                />
              </div>

              <GradientButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
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
                to="/signup"
                className="font-medium text-white hover:underline"
              >
                Sign up again
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
