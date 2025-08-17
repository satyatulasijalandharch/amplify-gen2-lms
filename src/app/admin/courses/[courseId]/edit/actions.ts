"use server"

import { cookiesClient } from "@/utils/amplify-utils";
import { chapterSchema, ChapterSchemaType, courseSchema, CourseSchemaType, lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";
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

export async function createChapter(values: ChapterSchemaType): Promise<ApiResponse> {
    try {
        const result = chapterSchema.safeParse(values);
        if (!result.success) {
            return {
                status: 'error',
                message: 'Invalid chapter data.'
            };
        }

        // Get all chapters for this course (limit to 100 for safety)
        const { data: chaptersData } = await cookiesClient.models.Chapter.list({
            filter: { courseId: { eq: result.data.courseId } },
            limit: 100
        });
        type ChapterItem = { position?: number };
        const maxPos = chaptersData && chaptersData.length > 0
            ? Math.max(...(chaptersData as ChapterItem[]).map((c) => c.position ?? 0))
            : 0;

        // Create the new chapter with position = max + 1
        await cookiesClient.models.Chapter.create({
            title: result.data.name,
            courseId: result.data.courseId,
            position: maxPos + 1
        });

        revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

        return {
            status: 'success',
            message: 'Chapter created successfully.'
        }

    } catch {
        return {
            status: 'error',
            message: 'Failed to create chapter.'
        }
    }
}

export async function createLesson(values: LessonSchemaType): Promise<ApiResponse> {
    try {
        const result = lessonSchema.safeParse(values);
        if (!result.success) {
            return {
                status: 'error',
                message: 'Invalid lesson data.'
            };
        }

        // Get all lessons for this chapter (limit to 100 for safety)
        const { data: lessonsData } = await cookiesClient.models.Lesson.list({
            filter: { chapterId: { eq: result.data.chapterId } },
            limit: 100
        });
        type LessonItem = { position?: number };
        const maxPos = lessonsData && lessonsData.length > 0
            ? Math.max(...(lessonsData as LessonItem[]).map((l) => l.position ?? 0))
            : 0;

        // Create the new lesson with position = max + 1
        await cookiesClient.models.Lesson.create({
            title: result.data.name,
            description: result.data.description,
            videoKey: result.data.videoKey,
            thumbnailKey: result.data.thumbnailKey,
            chapterId: result.data.chapterId,
            position: maxPos + 1
        });

        revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

        return {
            status: 'success',
            message: 'Lesson created successfully.'
        }

    } catch {
        return {
            status: 'error',
            message: 'Failed to create lesson.'
        }
    }
}

export async function deleteLesson({ chapterId, courseId, lessonId }: { chapterId: string, courseId: string, lessonId: string }): Promise<ApiResponse> {
    try {
        const { data: chapterWithLessons } = await cookiesClient.models.Chapter.get({ id: chapterId }, {
            selectionSet: [
                "lessons.id",
                "lessons.position"
            ]
        })
        if (!chapterWithLessons) {
            return {
                status: 'error',
                message: 'Chapter not found.'
            }
        }
        const lessons = chapterWithLessons.lessons
        const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId)
        if (!lessonToDelete) {
            return {
                status: 'error',
                message: 'Lesson not found.'
            }
        }

        const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId)
        // Reorder remaining lessons
        const updates = remainingLessons.map((lesson, index) => {
            return cookiesClient.models.Lesson.update({
                id: lesson.id,
                position: index + 1
            })
        })

        await Promise.all([
            ...updates,
            cookiesClient.models.Lesson.delete({ id: lessonId })
        ])
        revalidatePath(`/admin/courses/${courseId}/edit`);

        return {
            status: 'success',
            message: 'Lesson deleted successfully.'
        }

    } catch {
        return {
            status: 'error',
            message: 'Failed to delete lesson.'
        }
    }
}

export async function deleteChapter({
    chapterId,
    courseId
}: {
    chapterId: string,
    courseId: string
}): Promise<ApiResponse> {
    try {
        // Get the course with chapters
        const { data: courseWithChapters } = await cookiesClient.models.Course.get({ id: courseId }, {
            selectionSet: [
                "id",
                "chapters.id",
                "chapters.position"
            ]
        });
        if (!courseWithChapters) {
            return {
                status: 'error',
                message: 'Course not found.'
            }
        }
        const chapters = courseWithChapters.chapters;
        const chapterToDelete = chapters.find((chapter) => chapter.id === chapterId);
        if (!chapterToDelete) {
            return {
                status: 'error',
                message: 'Chapter not found.'
            }
        }

        // Get all lessons for the chapter to delete
        const { data: lessonsData } = await cookiesClient.models.Lesson.list({
            filter: { chapterId: { eq: chapterId } },
            limit: 100
        });

        // Prepare lesson delete promises
        const lessonDeletes = (lessonsData ?? []).map((lesson: { id: string }) =>
            cookiesClient.models.Lesson.delete({ id: lesson.id })
        );

        const remainingChapters = chapters.filter((chapter) => chapter.id !== chapterId);
        // Reorder remaining chapters
        const updates = remainingChapters.map((chapter, index) => {
            return cookiesClient.models.Chapter.update({
                id: chapter.id,
                position: index + 1
            });
        });

        await Promise.all([
            ...lessonDeletes,
            ...updates,
            cookiesClient.models.Chapter.delete({ id: chapterId })
        ]);

        revalidatePath(`/admin/courses/${courseId}/edit`);

        return {
            status: 'success',
            message: 'Chapter and its lessons deleted successfully.'
        }

    } catch {
        return {
            status: 'error',
            message: 'Failed to delete chapter.'
        }
    }
}