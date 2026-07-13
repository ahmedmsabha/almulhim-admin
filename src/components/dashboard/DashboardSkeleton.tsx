import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-xl border border-outline-variant py-0 ring-0"
          >
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-start justify-between">
                <Skeleton className="size-10 rounded-lg" />
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <Card className="rounded-xl border border-outline-variant py-0 ring-0 lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 px-8 pt-8">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-outline-variant py-0 ring-0">
          <CardHeader className="flex flex-col gap-2 px-8 pt-8">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="flex flex-col gap-6 px-8 pb-8">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-8 h-12 w-full" />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-outline-variant py-0 ring-0">
        <CardHeader className="px-6 py-6">
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-6 pb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
