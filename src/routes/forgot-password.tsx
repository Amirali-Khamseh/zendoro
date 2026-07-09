import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
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
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Mail } from "lucide-react";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { API_BASE_URL } from "@/constants/data";
import { validateNoInjection } from "@/lib/inputSanitization";
import { isValidEmail } from "@/lib/authValidation";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordComponent,
});

function ForgotPasswordComponent() {
  useDocumentTitle("Forgot Password - Zendoro");
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateFormData = (formData: FormData) => {
    const newErrors: Record<string, string> = {};

    const email = formData.get("email") as string;

    if (!email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const injectionErrors = validateNoInjection({ email });
    Object.assign(newErrors, injectionErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Honeypot: real users never see or fill this field — bots do
    if (formData.get("website")) return;

    if (!validateFormData(formData)) return;

    setIsLoading(true);
    try {
      const email = formData.get("email") as string;
      const result = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (result.ok) {
        formRef.current?.reset();
        setErrors({});
        router.navigate({ to: "/reset-password", search: { email } });
      } else {
        const errorData = await result.json().catch(() => ({}));
        setErrors({
          general: errorData.error || "Failed to send reset code. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "Failed to send reset code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-beba">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a code to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {errors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  aria-invalid={!!errors.email}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Honeypot — hidden from real users, bots fill it and get silently rejected */}
              <div
                aria-hidden="true"
                className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
              >
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <GradientButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </GradientButton>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="text-center text-sm text-white/60">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="font-medium text-white hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
