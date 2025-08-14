import "server-only"
import { cookiesClient } from "@/utils/amplify-utils";
import { notFound } from "next/navigation";

export async function adminGetCourse(id: string) {

    const { data } = await cookiesClient.models.Course.get({ id }, {
        selectionSet: [
            "id",
            "title",
            "description",
            "fileKey",
            "price",
            "duration",
            "level",
            "category",
            "smallDescription",
            "slug",
            "status",
            "chapter.id",
            "chapter.title",
            "chapter.position",
            "chapter.lessons.id",
            "chapter.lessons.title",
            "chapter.lessons.description",
            "chapter.lessons.thumbnailKey",
            "chapter.lessons.videoKey",
            "chapter.lessons.position",
        ]
    });
    if (!data) {
        return notFound();
    }
    return data;

}

export type AdminCourseSingularType = Awaited<ReturnType<typeof adminGetCourse>>;
