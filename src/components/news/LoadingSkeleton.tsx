
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[200px]" />
          <div className="space-y-2">
            {[...Array(4)].map((_, idx) => (
              <Skeleton key={idx} className="h-6" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
