"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, fetchUserAttributes } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { LogOut, Mail, User, Shield, Calendar } from "lucide-react";

interface UserAttributes {
  email?: string;
  name?: string;
  fullname?: string;
  profilePicture?: string;
  email_verified?: string;
  [key: string]: string | undefined;
}

export default function Home() {
  const router = useRouter();
  const { user, authStatus } = useAuthenticator((context) => [
    context.user,
    context.authStatus,
  ]);
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "authenticated" && user) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [authStatus, user]);

  async function fetchUserDetails() {
    try {
      const attributes = await fetchUserAttributes();
      setUserAttributes(attributes);
    } catch (error) {
      console.error("Error fetching user attributes:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/login");
      toast.success("You have been signed out successfully.");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out. Please try again.");
    }
  }

  function getInitials(name: string = "") {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to Demo LMS
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Your learning management system dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {authStatus === "authenticated" && (
              <Button
                type="button"
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            )}
          </div>
        </div>

        {authStatus === "authenticated" && user && userAttributes ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* User Profile Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={userAttributes.profilePicture} />
                    <AvatarFallback className="text-lg">
                      {getInitials(
                        userAttributes.name ||
                          userAttributes.fullname ||
                          userAttributes.email
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="grid gap-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Full Name
                        </label>
                        <p className="text-lg font-semibold">
                          {userAttributes.name ||
                            userAttributes.fullname ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Email Address
                        </label>
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-muted-foreground" />
                          <p>{userAttributes.email}</p>
                          {userAttributes.email_verified === "true" ? (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="size-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          User ID
                        </label>
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {user.username}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="size-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Account Type
                    </label>
                    <p className="text-sm mt-1">Standard User</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Session
                    </label>
                    <p className="text-sm mt-1">Currently signed in</p>
                  </div>
                  {user.signInDetails?.loginId && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Sign In
                      </label>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        <p className="text-xs">
                          {formatDate(new Date().toISOString())}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and navigation options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-auto p-4"
                  >
                    <User className="size-5" />
                    <div className="text-left">
                      <div className="font-medium">Edit Profile</div>
                      <div className="text-xs text-muted-foreground">
                        Update your information
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-auto p-4"
                  >
                    <Shield className="size-5" />
                    <div className="text-left">
                      <div className="font-medium">Security Settings</div>
                      <div className="text-xs text-muted-foreground">
                        Manage your security
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-auto p-4"
                  >
                    <Mail className="size-5" />
                    <div className="text-left">
                      <div className="font-medium">Notifications</div>
                      <div className="text-xs text-muted-foreground">
                        Configure preferences
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Welcome to Demo LMS</CardTitle>
              <CardDescription>
                Please sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Sign in
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
