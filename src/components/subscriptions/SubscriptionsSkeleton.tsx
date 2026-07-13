import { Skeleton } from "@/components/ui/skeleton";

export function SubscriptionsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex gap-2 border-b border-outline-variant px-6 py-4">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-6 w-36 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>
      <div className="border-b border-outline-variant bg-surface-container-low/30 px-6 py-4">
        <Skeleton className="h-9 w-full max-w-sm rounded-lg" />
      </div>
      <div className="flex flex-col">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-outline-variant px-6 py-4 last:border-b-0"
          >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="hidden h-4 w-28 md:block" />
            <Skeleton className="hidden h-4 w-32 lg:block" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="hidden h-4 w-40 xl:block" />
            <div className="ml-auto flex gap-1">
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="size-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
