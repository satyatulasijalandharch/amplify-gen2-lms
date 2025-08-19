import "server-only"

import { cookiesClient } from "@/utils/amplify-utils";
import { notFound } from "next/navigation";

export async function getIndividualCourse(slug: string) {
    const { data } = await cookiesClient.models.Course.listCourseBySlug({ slug }, {
        selectionSet: [
            "id",
            "title",
            "slug",
            "category",
            "description",
            "smallDescription",
            "fileKey",
            "duration",
            "level",
            "price",
            "chapters.id",
            "chapters.title",
            "chapters.position",
            "chapters.lessons.id",
            "chapters.lessons.title",
            "chapters.lessons.position"
        ]
    });
    if (!data) {
        return notFound();
    }

    // Sort chapters and lessons by position
    const course = Array.isArray(data) ? data[0] : data;
    if (course && Array.isArray(course.chapters)) {
        course.chapters.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        course.chapters.forEach(chapter => {
            if (Array.isArray(chapter.lessons)) {
                chapter.lessons.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            }
        });
    }
    return course;
}