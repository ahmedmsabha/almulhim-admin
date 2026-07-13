import { Suspense } from "react";

import { StudentDetailContainer } from "@/components/students/StudentDetailContainer";
import { StudentDetailSkeleton } from "@/components/students/StudentDetailSkeleton";

type StudentDetailPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const { userId } = await params;

  return (
    <Suspense fallback={<StudentDetailSkeleton />}>
      <StudentDetailContainer userId={userId} />
    </Suspense>
  );
}
