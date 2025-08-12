import {
    fetchAuthSession,
    fetchUserAttributes,
    getCurrentUser,
} from "aws-amplify/auth";
import { useEffect, useState } from "react";

type AuthUser = {
    username?: string;
    userId?: string;
    name?: string;
    email?: string;
    picture?: string;
    isAdmin: boolean;
    [key: string]: unknown;
};

export default function useAuthUser() {
    const [user, setUser] = useState<AuthUser>();

    useEffect(() => {
        async function getUser() {
            const session = await fetchAuthSession();
            if (!session.tokens) {
                return;
            }
            const user = {
                ...(await getCurrentUser()),
                ...(await fetchUserAttributes()),
                isAdmin: false,
            };
            const groups = session.tokens.accessToken.payload["cognito:groups"];
            user.isAdmin = Array.isArray(groups) && groups.includes("Admins");
            setUser(user);
        }

        getUser();
    }, []);

    return user;
}