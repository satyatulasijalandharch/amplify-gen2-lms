"use server"

import { ApiResponse } from "@/lib/types";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";
import { cookiesClient } from "@/utils/amplify-utils";

export async function updateLesson(
    values: LessonSchemaType,
    lessonId: string
): Promise<ApiResponse> {
    try {
        const result = lessonSchema.safeParse(values);
        if (!result.success) {
            return {
                status: "error",
                message: "Invalid lesson data"
            };
        }
        await cookiesClient.models.Lesson.update({
            id: lessonId,
            title: result.data.name,
            description: result.data.description,
            thumbnailKey: result.data.thumbnailKey,
            videoKey: result.data.videoKey,
        })

        return {
            status: "success",
            message: "Lesson updated successfully"
        }

    } catch {
        return {
            status: "error",
            message: "Failed to update lesson"
        }
    }
}