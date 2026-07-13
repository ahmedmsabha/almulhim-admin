import { Skeleton } from "@/components/ui/skeleton";

export function PlansSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant px-6 py-4">
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex flex-col gap-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-outline-variant px-6 py-4 last:border-b-0"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="ms-auto size-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
