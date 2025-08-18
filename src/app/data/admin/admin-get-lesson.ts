import { cookiesClient } from "@/utils/amplify-utils";
import { notFound } from "next/navigation";

export async function adminGetLesson(id: string) {
    const {data} = await cookiesClient.models.Lesson.get({ id: id }, {
        selectionSet: [
            "id",
            "title",
            "videoKey",
            "thumbnailKey",
            "description",
            "position"
        ]
    })
    if (!data) {
        return notFound()
    }
    return data
}

export type AdminLessonType = Awaited<ReturnType<typeof adminGetLesson>>;