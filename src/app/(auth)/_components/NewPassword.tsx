"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { useState, useTransition } from "react";
import { confirmSignIn } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  function setPassword() {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast.error(
        "Password must contain uppercase, lowercase, numbers, and special characters"
      );
      return;
    }

    startTransition(async () => {
      try {
        const { nextStep } = await confirmSignIn({
          challengeResponse: newPassword,
        });

        if (nextStep.signInStep === "DONE") {
          toast.success("Password set successfully! You are now signed in.");
          router.push("/");
        } else {
          toast.error("Failed to complete sign in. Please try again.");
        }
      } catch (error: unknown) {
        console.error("Set new password error:", error);
        const authError = error as { name?: string; message?: string };

        switch (authError.name) {
          case "InvalidPasswordException":
            toast.error(
              "Password does not meet the requirements. Please try a stronger password."
            );
            break;
          case "NotAuthorizedException":
            toast.error("Invalid session. Please sign in again.");
            router.push("/login");
            break;
          case "LimitExceededException":
            toast.error("Too many attempts. Please try again later.");
            break;
          default:
            toast.error("Failed to set new password. Please try again.");
        }
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set Your New Password</CardTitle>
        <CardDescription>
          Please set a new password for your account
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password *</Label>
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="Enter your new password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <Input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm your new password"
              required
            />
          </div>
          <Button onClick={setPassword} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Setting password...</span>
              </>
            ) : (
              <>
                <Lock className="size-4" />
                <span>Set New Password</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
