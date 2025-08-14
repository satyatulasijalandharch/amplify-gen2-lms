"use server"

import { cookiesClient } from "@/utils/amplify-utils";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";
import { ApiResponse } from "@/lib/types";

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