"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "aws-amplify/auth";
import { Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export function Login() {
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  function validateForm() {
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return false;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return false;
    }
    return true;
  }

  function signInWithEmail() {
    if (!validateForm()) return;

    startEmailTransition(async () => {
      try {
        const { isSignedIn, nextStep } = await signIn({
          username: email,
          password: password,
        });
        if (isSignedIn) {
          toast.success("Successfully signed in!");
          router.push("/");
          router.refresh();
        } else if (nextStep) {
          switch (nextStep.signInStep) {
            case "CONFIRM_SIGN_IN_WITH_EMAIL_CODE":
              toast.info("Please verify your email address.");
              router.push(`/verify-request?email=${encodeURIComponent(email)}`);
              break;
            case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
              toast.info("Please set a new password for your account.");
              router.push(
                `/set-new-password?email=${encodeURIComponent(email)}`
              );
              break;
            default:
              toast.error("Additional steps required. Please contact support.");
          }
        }
      } catch (error: unknown) {
        console.error("Sign in error:", error);
        const authError = error as { name?: string; message?: string };

        // Handle specific error cases
        switch (authError.name) {
          case "UserNotConfirmedException":
            toast.error("Please verify your email address first.");
            setTimeout(() => {
              router.push(`/verify-request?email=${encodeURIComponent(email)}`);
            }, 1000);
            break;
          case "NotAuthorizedException":
            toast.error("Incorrect email or password.");
            break;
          case "UserNotFoundException":
            toast.error("No account found with this email.");
            break;
          case "LimitExceededException":
            toast.error("Too many attempts. Please try again later.");
            break;
          default:
            toast.error("Failed to sign in. Please try again.");
        }
      }
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>Login with your email and password</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="your@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="your password"
              required
            />
          </div>
          <Button onClick={signInWithEmail} disabled={emailPending}>
            {emailPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Continue with Email</span>
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Don&apos;t have an account?{" "}
          </span>
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
