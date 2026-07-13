type PlaceholderPanelProps = {
  message: string;
};

export function PlaceholderPanel({ message }: PlaceholderPanelProps) {
  return (
    <section className="rounded-lg border border-border bg-surface-container-lowest p-6 md:p-8">
      <p className="text-body-md text-on-surface-variant">{message}</p>
    </section>
  );
}
