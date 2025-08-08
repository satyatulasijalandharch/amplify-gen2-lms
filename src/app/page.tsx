import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Shield } from "lucide-react";
import Link from "next/link";
import Logout from "./Logout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AuthGetCurrentUserServer,
  getUserAttributes,
  isUserAuthenticatedServer,
} from "@/utils/amplify-utils";

export default async function Home() {
  const isAuthenticated = await isUserAuthenticatedServer();
  const userAttributes = isAuthenticated ? await getUserAttributes() : {};
  const user = isAuthenticated ? await AuthGetCurrentUserServer() : null;

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
            {isAuthenticated && <Logout />}
          </div>
        </div>

        {isAuthenticated && user && userAttributes ? (
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
              <Link href="/login" className="w-full" passHref>
                <Button type="button" className="w-full">
                  Sign in
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
