"use client";

import {
  IconDashboard,
  IconDotsVertical,
  IconLogout,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";
import Link from "next/link";
import { HomeIcon, Tv2 } from "lucide-react";
import { useSignOut } from "@/hooks/use-signout";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { authStatus, isPending } = useAuthenticator();
  const { handleSignOut } = useSignOut();
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

  if (isPending) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={
                    attributes?.picture ??
                    `https://avatar.vercel.sh/${attributes?.email}`
                  }
                  alt={attributes?.fullName}
                />
                <AvatarFallback className="rounded-lg">
                  {attributes?.fullName && attributes?.fullName.length > 0
                    ? attributes?.fullName.charAt(0).toUpperCase()
                    : attributes?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {attributes?.fullName && attributes?.fullName.length > 0
                    ? attributes?.fullName
                    : attributes?.email?.split("@")[0]}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {attributes?.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={
                      attributes?.picture ??
                      `https://avatar.vercel.sh/${attributes?.email}`
                    }
                    alt={attributes?.fullName}
                  />
                  <AvatarFallback className="rounded-lg">
                    {attributes?.fullName && attributes?.fullName.length > 0
                      ? attributes?.fullName.charAt(0).toUpperCase()
                      : attributes?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {attributes?.fullName && attributes?.fullName.length > 0
                      ? attributes?.fullName
                      : attributes?.email?.split("@")[0]}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {attributes?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/">
                  <HomeIcon />
                  Homepage
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <IconDashboard />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/courses">
                  <Tv2 />
                  Courses
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
