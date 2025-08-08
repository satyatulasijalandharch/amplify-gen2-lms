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
import { resetPassword } from "aws-amplify/auth";
import { Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export function ForgotPassword() {
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleForgotPassword() {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    startEmailTransition(async () => {
      try {
        await resetPassword({ username: email });
        toast.success("Password reset code sent to your email!");
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } catch (error: unknown) {
        console.error("Reset password error:", error);
        const authError = error as { name?: string; message?: string };

        switch (authError.name) {
          case "UserNotFoundException":
            toast.error("No account found with this email address.");
            break;
          case "LimitExceededException":
            toast.error("Too many requests. Please try again later.");
            break;
          case "InvalidParameterException":
            toast.error("Please enter a valid email address.");
            break;
          default:
            toast.error("Failed to send reset code. Please try again.");
        }
      }
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset code.
        </CardDescription>
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
          <Button onClick={handleForgotPassword} disabled={emailPending}>
            {emailPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Send Reset Code</span>
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Remembered your password?{" "}
          </span>
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
