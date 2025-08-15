"use server"

import { cookiesClient } from "@/utils/amplify-utils";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function editCourse(data: CourseSchemaType, courseId: string): Promise<ApiResponse> {
    try {
        const result = courseSchema.safeParse(data);
        if (!result.success) {
            return {
                status: "error",
                message: "Invalid Form Data"
            }
        }
        await cookiesClient.models.Course.update({
            id: courseId,
            ...result.data
        })
        return {
            status: "success",
            message: "Course updated successfully"
        };
    } catch {
        return {
            status: "error",
            message: "Failed to update course"
        };
    }
}

export async function reorderLessons(
    chapterId: string,
    lessons: { id: string; position: number }[],
    courseId: string
): Promise<ApiResponse> {
    try {
        if (!lessons || lessons.length === 0) {
            return {
                status: "error",
                message: "No lessons provided for reordering."
            }
        }

        const updates = lessons.map((lesson) => cookiesClient.models.Lesson.update({
            id: lesson.id, chapterId: chapterId, position: lesson.position
        }))

        await Promise.all(updates);

        revalidatePath(`/admin/courses/${courseId}/edit`);

        return {
            status: "success",
            message: "Lessons reordered successfully."
        }
    } catch {
        return {
            status: "error",
            message: "Failed to reorder lessons."
        }
    }
}

export async function reorderChapters(
    courseId: string,
    chapters: { id: string, position: number }[]

): Promise<ApiResponse> {
    try {

        if (!chapters || chapters.length === 0) {
            return {
                status: 'error',
                message: 'No chapters provided for reordering.'
            }
        }

        const updates = chapters.map((chapter) => cookiesClient.models.Chapter.update({
            id: chapter.id,
            courseId: courseId,
            position: chapter.position
        }))

        await Promise.all(updates);

        revalidatePath(`/admin/courses/${courseId}/edit`);

        return {
            status: 'success',
            message: 'Chapters reordered successfully.'
        }

    } catch {
        return {
            status: 'error',
            message: 'Failed to reorder chapters.'
        }
    }
}