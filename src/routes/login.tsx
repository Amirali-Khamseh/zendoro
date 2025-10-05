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
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GradientButton } from "@/componenets/customUIComponenets/CustomButton";
import { API_BASE_URL, LS_ZENDORO_AUTH } from "@/constants/data";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});
type logInResponseType = {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
};
function LoginComponent() {
  useDocumentTitle("Login - Zendoro");
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateFormData = (formData: FormData) => {
    const newErrors: Record<string, string> = {};

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password?.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    if (!validateFormData(formData)) return;

    setIsLoading(true);
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const result = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (result.ok || result.status === 200) {
        const response: logInResponseType = await result.json();
        localStorage.setItem(LS_ZENDORO_AUTH, response.token);
        formRef.current?.reset();
        setErrors({});
        router.navigate({ to: "/" });
      } else {
        console.log("Login failed with status:", result.status);
        const errorData = await result.json().catch((e) => {
          console.log("Failed to parse error response:", e);
          return {};
        });
        console.log("Error data:", errorData);
        setErrors({
          general: errorData.message || "Login failed. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-beba">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Zendoro account to continue your productivity
              journey
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

              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                    className={
                      errors.password ? "border-destructive pr-10" : "pr-10"
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
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <GradientButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </GradientButton>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-primary hover:underline"
              >
                Sign up here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
