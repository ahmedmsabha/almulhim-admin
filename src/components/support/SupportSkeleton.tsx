import { Skeleton } from "@/components/ui/skeleton";

export function SupportSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-14 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="ms-auto h-9 w-full max-w-xs rounded-lg" />
      </div>
      <div className="flex min-h-[28rem] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="flex w-full flex-col border-outline-variant md:w-1/3 md:border-e">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex gap-3 border-b border-outline-variant p-4 last:border-b-0"
            >
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden flex-1 flex-col gap-4 p-6 md:flex">
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="h-24 w-3/4 rounded-2xl" />
          <Skeleton className="ms-auto h-20 w-2/3 rounded-2xl" />
          <div className="mt-auto space-y-3 border-t border-outline-variant pt-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
