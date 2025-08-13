import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cookiesClient } from "@/utils/amplify-utils";
import { AdminCourseCard } from "./_components/AdminCourseCard";

export default async function CoursesPage() {
  const { data: courses } = await cookiesClient.models.Course.list();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Courses</h1>

        <Link className={buttonVariants()} href="/admin/courses/create">
          Create Course
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-7">
        {courses &&
          courses.map((course) => (
            <AdminCourseCard key={course.id} data={course} />
          ))}
      </div>
    </>
  );
}
