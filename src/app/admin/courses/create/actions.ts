"use server"

import { cookiesClient } from "@/utils/amplify-utils";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";
import { ApiResponse } from "@/lib/types";

export async function createCourseAction(values: CourseSchemaType): Promise<ApiResponse> {
    try {
        const validation = courseSchema.safeParse(values);
        if (!validation.success) {
            return {
                status: "error",
                message: "Invalid Form Data"
            }
        }
        await cookiesClient.models.Course.create({
            title: values.title,
            description: values.description,
            fileKey: values.fileKey,
            price: values.price,
            duration: values.duration,
            level: values.level,
            status: values.status,
            category: values.category,
            smallDescription: values.smallDescription,
            slug: values.slug
        });
        return {
            status: "success",
            message: "Course created successfully"
        };
    } catch {
        return {
            status: "error",
            message: "Failed to create course"
        };
    }
}
