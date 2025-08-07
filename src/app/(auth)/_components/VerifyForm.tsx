"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

export default function VerifyForm() {
  const [otp, setOtp] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [resendCountdown, setResendCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  useEffect(() => {
    if (!email) {
      router.replace("/signup");
    }
  }, [email, router]);

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  function resendCode() {
    if (resendCountdown > 0) {
      return;
    }

    startResendTransition(async () => {
      try {
        await resendSignUpCode({ username: email });
        toast.success("Verification code resent to your email.");
        setResendCountdown(30);
      } catch (error: unknown) {
        const authError = error as { name?: string; message?: string };
        switch (authError.name) {
          case "LimitExceededException":
            toast.error("Too many requests. Please try again later.");
            break;
          default:
            toast.error("Failed to resend code. Please try again.");
        }
      }
    });
  }

  function verifyOtp() {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    startTransition(async () => {
      try {
        await confirmSignUp({ username: email, confirmationCode: otp });
        toast.success("Email verified successfully!");
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
          default:
            toast.error("Failed to verify code. Please try again.");
        }
      }
    });
  }
  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Please check your email</CardTitle>
        <CardDescription>
          We have sent a verification code to your email address. Please enter
          the 6-digit code below to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </div>
        <Button
          onClick={verifyOtp}
          disabled={isPending || otp.length !== 6}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Account"
          )}
        </Button>

        {/* Resend Code Section */}
        <div className="flex flex-col items-center space-y-2 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the code?
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={resendCode}
            disabled={isResending || resendCountdown > 0}
            className="text-primary hover:text-primary/80"
          >
            {isResending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Sending...
              </>
            ) : resendCountdown > 0 ? (
              `Resend code (${resendCountdown}s)`
            ) : (
              <>
                <RefreshCw className="size-4 mr-2" />
                Resend code
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
