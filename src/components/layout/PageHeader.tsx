import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-8", className)}>
      {eyebrow ? (
        <p className="mb-1 text-label-md font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-display-lg text-on-surface">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
          {description}
        </p>
      ) : null}
    </header>
  );
}
