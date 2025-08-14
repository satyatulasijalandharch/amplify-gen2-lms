"use client"

import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
    const router = useRouter();

    const handleSignOut = async function signout() {
        await signOut({ global: true });
        router.push("/login");
        toast.success("Signed out successfully");
    };

    return { handleSignOut };
}