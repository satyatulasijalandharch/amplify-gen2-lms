"use server"

import { ApiResponse } from "@/lib/types";
import { cookiesClient } from "@/utils/amplify-utils";
import { revalidatePath } from "next/cache";

export async function deleteCourse(courseId: string): Promise<ApiResponse> {
    try {
        // 1. First, get the course with all its chapters
        const { data: courseWithChapters } = await cookiesClient.models.Course.get(
            { id: courseId },
            { selectionSet: ["id", "chapters.*"] }
        );

        if (!courseWithChapters) {
            return {
                status: "error",
                message: "Course not found"
            }
        }

        // 2. For each chapter, get all lessons and delete them
        for (const chapter of courseWithChapters.chapters) {
            // Get all lessons for this chapter
            const { data: lessons } = await cookiesClient.models.Lesson.list({
                filter: {
                    chapterId: { eq: chapter.id }
                }
            });

            // Delete all lessons in parallel
            if (lessons && lessons.length > 0) {
                await Promise.all(
                    lessons.map(lesson =>
                        cookiesClient.models.Lesson.delete({ id: lesson.id })
                    )
                );
            }
        }

        // 3. Delete all chapters in parallel
        if (courseWithChapters.chapters.length > 0) {
            await Promise.all(
                courseWithChapters.chapters.map(chapter =>
                    cookiesClient.models.Chapter.delete({ id: chapter.id })
                )
            );
        }

        // 4. Finally, delete the course itself
        await cookiesClient.models.Course.delete({ id: courseId });

        revalidatePath("/admin/courses");
        return {
            status: "success",
            message: "Course and all related content deleted successfully"
        }

    } catch (error) {
        console.error("Error deleting course:", error);
        return {
            status: "error",
            message: "Failed to delete course and related content"
        }
    }

}