import { cookies } from "next/headers";
import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth/server";

import { type Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

export const { runWithAmplifyServerContext } = createServerRunner({
    config: outputs,
});

export const cookiesClient = generateServerClientUsingCookies<Schema>({
    config: outputs,
    cookies,
    authMode: "userPool"
});

export async function AuthGetCurrentUserServer() {
    try {
        const currentUser = await runWithAmplifyServerContext({
            nextServerContext: { cookies },
            operation: (contextSpec) => getCurrentUser(contextSpec),
        });
        return currentUser;
    } catch {
        return null;
    }
}

export async function isUserAuthenticatedServer() {
    const user = await AuthGetCurrentUserServer();
    return user !== null;
}

export async function getUserGroups() {
    try {
        const session = await runWithAmplifyServerContext({
            nextServerContext: { cookies },
            operation: (contextSpec) => fetchAuthSession(contextSpec),
        });

        // Extract groups from the access token
        const accessToken = session.tokens?.accessToken;
        if (accessToken) {
            const payload = accessToken.payload;
            return payload['cognito:groups'] as string[] || [];
        }
        return [];
    } catch (error) {
        console.error('Error getting user groups:', error);
        return [];
    }
}