import { cookiesClient } from "@/utils/amplify-utils";

export async function getAllCourses() {
    const { data: courses } = await cookiesClient.models.Course.list(
        {
            filter: {
                status: {
                    eq: "Published"
                }
            },
            sortDirection: "DESC",
            selectionSet: [
                "id",
                "title",
                "price",
                "smallDescription",
                "slug",
                "level",
                "duration",
                "category",
                "fileKey"
            ]
        }
    )
    return courses

}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0]