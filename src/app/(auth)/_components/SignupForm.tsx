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
import { Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { signUp } from "aws-amplify/auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [emailPending, startEmailTransition] = useTransition();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  function validateForm() {
    if (!fullname.trim()) {
      toast.error("Please enter your full name.");
      return false;
    }
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return false;
    }
    if (!password) {
      toast.error("Please enter a password.");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  }

  function signUpWithEmail() {
    if (!validateForm()) return;

    startEmailTransition(async () => {
      try {
        const { nextStep } = await signUp({
          username: email,
          password: password,
          options: {
            userAttributes: {
              email: email,
              name: fullname,
            },
          },
        });
        if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
          toast.success("Account created! Please verify your email.");
          // Redirect to verification page
          router.push(`/verify-request?email=${encodeURIComponent(email)}`);
        }
      } catch (error: unknown) {
        console.error("Sign up error:", error);
        const authError = error as { name?: string; message?: string };
        switch (authError.name) {
          case "UsernameExistsException":
            toast.error("An account with this email already exists.");
            break;
          case "InvalidPasswordException":
            toast.error(
              "Password does not meet requirements. Please ensure it contains uppercase, lowercase, numbers, and special characters."
            );
            break;
          case "InvalidParameterException":
            toast.error("Invalid email or password format.");
            break;
          default:
            toast.error("Failed to create account. Please try again.");
        }
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Enter your details to create a new account
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              type="text"
              placeholder="John Doe"
              required
            />
          </div>
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
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm your password"
              required
            />
          </div>
          <Button onClick={signUpWithEmail} disabled={emailPending}>
            {emailPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Create Account</span>
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
