import {
  cookiesClient,
  runWithAmplifyServerContext,
} from "@/utils/amplify-utils";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { cookies } from "next/headers";

export async function checkIfCourseBought(courseId: string): Promise<boolean> {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      return await fetchAuthSession(contextSpec);
    },
  });
  if (!session.userSub) return false;

  const { data: enrollment } = await cookiesClient.models.Enrollment.get(
    {
      userId: session.userSub,
      courseId: courseId,
    },
    {
      selectionSet: ["status"],
    }
  );

  return enrollment?.status === "Active" ? true : false;
}
