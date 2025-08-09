"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.png";

import { ThemeToggle } from "@/components/ui/themeToggle";
import { buttonVariants } from "@/components/ui/button";
import { UserDropdown } from "./UserDropdown";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";

const navigationItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Courses",
    href: "/courses",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

export function Navbar() {
  const { authStatus, isPending } = useAuthenticator();
  const [attributes, setAttributes] = useState<{
    fullName?: string;
    email?: string;
    picture?: string;
  } | null>(null);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchUserAttributes()
        .then((attrs) => {
          setAttributes({
            fullName: attrs.name,
            email: attrs.email,
            picture: attrs.picture,
          });
        })
        .catch(() => setAttributes(null));
    } else {
      setAttributes(null);
    }
  }, [authStatus]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-4">
          <Image src={Logo} alt="Logo" className="size-9" />
          <span className="font-bold">Demo LMS.</span>
        </Link>
        {/* Desktop navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isPending ? null : authStatus === "authenticated" ? (
              <UserDropdown
                name={
                  attributes?.fullName && attributes?.fullName.length > 0
                    ? attributes.fullName
                    : attributes?.email?.split("@")[0] || ""
                }
                email={attributes?.email || ""}
                image={attributes?.picture || ""}
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Login
                </Link>
                <Link href="/signup" className={buttonVariants()}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
