import "server-only"
import { cookiesClient } from "@/utils/amplify-utils";
import { notFound } from "next/navigation";

export async function adminGetCourse(id: string) {

    const { data } = await cookiesClient.models.Course.get({ id });
    if (!data) {
        return notFound();
    }
    return data;

}

export type AdminCourseSingularType = Awaited<ReturnType<typeof adminGetCourse>>;
