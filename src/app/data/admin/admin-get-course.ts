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
            // Chapters
            "chapters.id",
            "chapters.title",
            "chapters.position",
            // Lessons
            "chapters.lessons.id",
            "chapters.lessons.title",
            "chapters.lessons.description",
            "chapters.lessons.thumbnailKey",
            "chapters.lessons.videoKey",
            "chapters.lessons.position",
        ],
    });
    if (!data) {
        return notFound();
    }
    // Sort chapters and lessons by position
    if (Array.isArray(data.chapters)) {
        data.chapters.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        data.chapters.forEach(chapter => {
            if (Array.isArray(chapter.lessons)) {
                chapter.lessons.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            }
        });
    }
    return data;

}


export type AdminCourseSingularType = Awaited<ReturnType<typeof adminGetCourse>>;
