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
import { useState, useTransition, useEffect } from "react";
import { confirmResetPassword } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") as string;

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  function setPassword() {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

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

    startTransition(async () => {
      try {
        await confirmResetPassword({
          username: email,
          confirmationCode: otp,
          newPassword: newPassword,
        });
        toast.success("Password reset successfully!");
        router.push("/login");
      } catch (error: unknown) {
        const authError = error as { name?: string; message?: string };
        switch (authError.name) {
          case "CodeMismatchException":
            toast.error("Invalid verification code. Please try again.");
            break;
          case "ExpiredCodeException":
            toast.error(
              "Verification code has expired. Please request a new one."
            );
            break;
          case "InvalidPasswordException":
            toast.error(
              "Password does not meet requirements. Please try again."
            );
            break;
          case "LimitExceededException":
            toast.error("Too many attempts. Please try again later.");
            break;
          default:
            toast.error("Failed to reset password. Please try again.");
        }
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set New Password</CardTitle>
        <CardDescription>
          Verification code sent to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col items-center space-y-2">
          <InputOTP
            value={otp}
            onChange={(value) => setOtp(value)}
            maxLength={6}
            className="gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password *</Label>
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="At least 8 characters"
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
