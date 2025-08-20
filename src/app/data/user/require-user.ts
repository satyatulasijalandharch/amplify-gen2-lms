
import { runWithAmplifyServerContext } from "@/utils/amplify-utils";
import { fetchUserAttributes } from "aws-amplify/auth/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function requireUser() {
    const userAttributes = await runWithAmplifyServerContext({
        nextServerContext: { cookies },
        operation: async (contextSpec) => {
            return await fetchUserAttributes(contextSpec);
        }
    });

    if (!userAttributes) {
        return redirect("/login");
    }

    const { sub, name, email } = userAttributes ?? {};

    return {
        sub: sub as string,
        name: name as string,
        email: email as string,
    };
}